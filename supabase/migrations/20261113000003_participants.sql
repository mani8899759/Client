-- ═══════════════════════════════════════════════════════════════════════════
-- 0003 · Participants, common-QR verification, abuse protection
--
-- Approved workflow: one common event QR → /verify → guest enters registered
-- mobile number → automatic verification. No OTP, no individual QR codes.
--
-- Public registration and verification run ONLY through the SECURITY DEFINER
-- functions below, which are executable solely by the service role (called
-- from Next.js Route Handlers after validation and rate limiting). The anon
-- key can never read or write participant data.
-- ═══════════════════════════════════════════════════════════════════════════

create table public.participants (
  id                      uuid primary key default gen_random_uuid(),
  full_name               text not null check (char_length(btrim(full_name)) between 2 and 120),
  mobile_number           text not null check (char_length(mobile_number) between 10 and 32),
  normalized_mobile       text not null check (normalized_mobile ~ '^\+91[6-9][0-9]{9}$'),
  email                   text not null check (char_length(email) between 3 and 254),
  normalized_email        text not null check (
                            normalized_email = lower(btrim(normalized_email))
                            and normalized_email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  gender                  public.participant_gender not null,
  address                 text not null check (char_length(btrim(address)) between 5 and 500),
  side                    public.participant_side not null,
  consent                 boolean not null check (consent),
  consent_timestamp       timestamptz not null,
  consent_policy_version  text not null check (char_length(consent_policy_version) between 1 and 40),
  registration_status     public.registration_status not null default 'registered',
  verification_status     public.verification_status not null default 'pending',
  registration_request_id uuid,
  registered_at           timestamptz not null default now(),
  verified_at             timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  constraint participants_normalized_mobile_key unique (normalized_mobile),
  constraint participants_normalized_email_key unique (normalized_email),
  constraint participants_registration_request_id_key unique (registration_request_id),
  constraint participants_verification_consistency check ((verification_status = 'verified') = (verified_at is not null))
);

create index participants_side_idx on public.participants (side);
create index participants_verification_idx on public.participants (verification_status);
create index participants_registration_idx on public.participants (registration_status);
create index participants_registered_at_idx on public.participants (registered_at desc);
create index participants_name_idx on public.participants (lower(full_name));

create trigger participants_updated_at before update on public.participants
  for each row execute function public.set_updated_at();

-- ── Check-in records: at most one per participant ──────────────────────────
create table public.checkins (
  id                  uuid primary key default gen_random_uuid(),
  participant_id      uuid not null references public.participants (id) on delete cascade,
  verification_method text not null check (verification_method in ('common_qr_mobile_match', 'admin_manual')),
  verified_at         timestamptz not null default now(),
  verified_by         uuid,
  reason              text check (reason is null or char_length(reason) <= 500),
  created_at          timestamptz not null default now(),
  constraint checkins_participant_key unique (participant_id)
);
create index checkins_verified_at_idx on public.checkins (verified_at desc);

-- ── Rate limiting (fixed window, database-backed; no Redis needed) ─────────
create table public.rate_limit_buckets (
  bucket_key   text not null check (char_length(bucket_key) <= 200),
  window_start timestamptz not null,
  hits         integer not null default 0,
  primary key (bucket_key, window_start)
);

create table public.security_events (
  id         uuid primary key default gen_random_uuid(),
  event_type text not null check (char_length(event_type) <= 60),
  ip_hash    text,
  detail     jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index security_events_created_at_idx on public.security_events (created_at desc);
create index security_events_type_idx on public.security_events (event_type, created_at desc);

-- ── RLS ────────────────────────────────────────────────────────────────────
alter table public.participants enable row level security;
alter table public.checkins enable row level security;
alter table public.rate_limit_buckets enable row level security;
alter table public.security_events enable row level security;

-- Administrators may read. All writes go through audited functions.
create policy participants_admin_read on public.participants
  for select to authenticated using (public.is_admin());
create policy checkins_admin_read on public.checkins
  for select to authenticated using (public.is_admin());
create policy security_events_admin_read on public.security_events
  for select to authenticated using (public.is_admin());

-- Defence in depth: the public role has no table privileges at all.
revoke all on public.participants, public.checkins, public.rate_limit_buckets, public.security_events from anon;
revoke insert, update, delete on public.participants, public.checkins, public.rate_limit_buckets, public.security_events from authenticated;

-- ═══════════════════════════════════════════════════════════════════════════
-- Service-role functions (called from Route Handlers only)
-- ═══════════════════════════════════════════════════════════════════════════

create or replace function public.consume_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window timestamptz;
  v_hits   integer;
begin
  if p_limit < 1 or p_window_seconds < 1 then
    raise exception 'invalid_rate_limit' using errcode = 'P0001';
  end if;

  v_window := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);

  insert into public.rate_limit_buckets as b (bucket_key, window_start, hits)
  values (p_key, v_window, 1)
  on conflict (bucket_key, window_start) do update set hits = b.hits + 1
  returning hits into v_hits;

  -- Opportunistic cleanup of expired windows.
  if random() < 0.02 then
    delete from public.rate_limit_buckets where window_start < now() - interval '1 day';
  end if;

  return v_hits <= p_limit;
end;
$$;

create or replace function public.log_security_event(p_event_type text, p_ip_hash text, p_detail jsonb default '{}'::jsonb)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.security_events (event_type, ip_hash, detail)
  values (p_event_type, p_ip_hash, coalesce(p_detail, '{}'::jsonb));
$$;

-- First name + initial of last name, e.g. "Priya S." — used for public display.
create or replace function public.public_display_name(p_full_name text)
returns text
language sql
immutable
as $$
  select case
    when array_length(parts, 1) is null then 'Guest'
    when array_length(parts, 1) = 1 then parts[1]
    else parts[1] || ' ' || upper(left(parts[array_length(parts, 1)], 1)) || '.'
  end
  from (select regexp_split_to_array(btrim(regexp_replace(coalesce(p_full_name, ''), '\s+', ' ', 'g')), ' ') as parts) s;
$$;

-- Registration. Uniqueness is enforced by the database (normalized mobile,
-- normalized email); concurrent duplicates surface as unique_violation.
-- p_request_id makes network retries idempotent.
create or replace function public.register_participant(
  p_full_name              text,
  p_mobile_number          text,
  p_normalized_mobile      text,
  p_email                  text,
  p_normalized_email       text,
  p_gender                 public.participant_gender,
  p_address                text,
  p_side                   public.participant_side,
  p_consent                boolean,
  p_consent_policy_version text,
  p_request_id             uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_open       boolean;
  v_row        public.participants%rowtype;
  v_constraint text;
begin
  select registration_open into v_open from public.app_settings where id;
  if not coalesce(v_open, false) then
    return jsonb_build_object('status', 'closed');
  end if;

  if p_consent is not true then
    return jsonb_build_object('status', 'invalid');
  end if;

  if p_request_id is not null then
    select * into v_row from public.participants where registration_request_id = p_request_id;
    if found then
      return jsonb_build_object('status', 'created', 'participant_id', v_row.id,
                                'full_name', v_row.full_name, 'side', v_row.side);
    end if;
  end if;

  begin
    insert into public.participants (
      full_name, mobile_number, normalized_mobile, email, normalized_email,
      gender, address, side, consent, consent_timestamp, consent_policy_version,
      registration_request_id
    ) values (
      btrim(p_full_name), btrim(p_mobile_number), p_normalized_mobile, btrim(p_email), p_normalized_email,
      p_gender, btrim(p_address), p_side, true, now(), p_consent_policy_version,
      p_request_id
    )
    returning * into v_row;
  exception
    when unique_violation then
      get stacked diagnostics v_constraint = constraint_name;
      if v_constraint = 'participants_registration_request_id_key' then
        select * into v_row from public.participants where registration_request_id = p_request_id;
        return jsonb_build_object('status', 'created', 'participant_id', v_row.id,
                                  'full_name', v_row.full_name, 'side', v_row.side);
      end if;
      return jsonb_build_object('status', 'duplicate');
    when check_violation then
      return jsonb_build_object('status', 'invalid');
  end;

  return jsonb_build_object('status', 'created', 'participant_id', v_row.id,
                            'full_name', v_row.full_name, 'side', v_row.side);
end;
$$;

-- Common-QR verification by registered mobile number.
-- The conditional UPDATE takes a row lock, so concurrent requests for the same
-- participant serialise: exactly one returns 'verified', the rest 'already_verified'.
create or replace function public.verify_participant(p_normalized_mobile text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_enabled boolean;
  v_p       public.participants%rowtype;
begin
  select verification_enabled into v_enabled from public.app_settings where id;
  if not coalesce(v_enabled, false) then
    return jsonb_build_object('status', 'disabled');
  end if;

  if to_regclass('public.lucky_draws') is not null
     and exists (select 1 from public.lucky_draws where status = 'completed') then
    return jsonb_build_object('status', 'closed');
  end if;

  select * into v_p from public.participants where normalized_mobile = p_normalized_mobile;
  if not found then
    return jsonb_build_object('status', 'not_found');
  end if;

  if v_p.registration_status <> 'registered' then
    return jsonb_build_object('status', 'inactive');
  end if;

  update public.participants
     set verification_status = 'verified', verified_at = now()
   where id = v_p.id and verification_status = 'pending'
  returning * into v_p;

  if not found then
    select * into v_p from public.participants where normalized_mobile = p_normalized_mobile;
    return jsonb_build_object('status', 'already_verified',
                              'display_name', split_part(btrim(v_p.full_name), ' ', 1),
                              'side', v_p.side);
  end if;

  insert into public.checkins (participant_id, verification_method, verified_at)
  values (v_p.id, 'common_qr_mobile_match', v_p.verified_at);

  return jsonb_build_object('status', 'verified',
                            'display_name', split_part(btrim(v_p.full_name), ' ', 1),
                            'side', v_p.side);
end;
$$;

revoke execute on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated;
revoke execute on function public.log_security_event(text, text, jsonb) from public, anon, authenticated;
revoke execute on function public.register_participant(text, text, text, text, text, public.participant_gender, text, public.participant_side, boolean, text, uuid) from public, anon, authenticated;
revoke execute on function public.verify_participant(text) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;
grant execute on function public.log_security_event(text, text, jsonb) to service_role;
grant execute on function public.register_participant(text, text, text, text, text, public.participant_gender, text, public.participant_side, boolean, text, uuid) to service_role;
grant execute on function public.verify_participant(text) to service_role;
