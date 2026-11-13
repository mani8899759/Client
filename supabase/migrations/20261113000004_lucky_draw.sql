-- ═══════════════════════════════════════════════════════════════════════════
-- 0004 · Lucky draw engine
--
-- Default: 11 winners in total from the combined Bride + Groom pool of
-- VERIFIED participants. The draw runs entirely inside one database
-- transaction using pgcrypto's CSPRNG (gen_random_bytes) — never browser
-- Math.random(). Results are immutable; the only correction path is an
-- owner-authorised, audited void, after which a new draw may be executed.
-- ═══════════════════════════════════════════════════════════════════════════

create table public.lucky_draw_config (
  id               boolean primary key default true check (id),
  winner_count     integer not null default 11 check (winner_count between 1 and 500),
  eligibility_rule public.eligibility_rule not null default 'verified_only',
  event_id         uuid references public.events (id) on delete set null,
  updated_by       uuid,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create trigger lucky_draw_config_updated_at before update on public.lucky_draw_config
  for each row execute function public.set_updated_at();

insert into public.lucky_draw_config (id) values (true) on conflict (id) do nothing;

create table public.lucky_draws (
  id                            uuid primary key default gen_random_uuid(),
  event_id                      uuid,
  status                        public.draw_status not null default 'completed',
  winner_count                  integer not null check (winner_count > 0),
  eligibility_rule              public.eligibility_rule not null,
  eligible_count                integer not null check (eligible_count >= winner_count),
  eligible_participant_snapshot jsonb not null check (jsonb_typeof(eligible_participant_snapshot) = 'array'),
  executed_by                   uuid not null,
  executed_at                   timestamptz not null default now(),
  voided_at                     timestamptz,
  voided_by                     uuid,
  void_reason                   text check (void_reason is null or char_length(void_reason) between 5 and 500),
  created_at                    timestamptz not null default now(),
  constraint lucky_draws_void_consistency check (
    (status = 'voided') = (voided_at is not null and voided_by is not null and void_reason is not null))
);
-- At most one completed (live) draw at any time → reruns are impossible.
create unique index lucky_draws_single_completed on public.lucky_draws ((true)) where status = 'completed';
create index lucky_draws_executed_at_idx on public.lucky_draws (executed_at desc);

create table public.lucky_draw_winners (
  id                  uuid primary key default gen_random_uuid(),
  draw_id             uuid not null references public.lucky_draws (id) on delete restrict,
  participant_id      uuid not null references public.participants (id) on delete restrict,
  winner_position     integer not null check (winner_position > 0),
  public_display_name text not null check (char_length(btrim(public_display_name)) between 1 and 80),
  gift_status         public.gift_status not null default 'pending',
  gift_notes          text check (gift_notes is null or char_length(gift_notes) <= 500),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint lucky_draw_winners_participant_key unique (draw_id, participant_id),
  constraint lucky_draw_winners_position_key unique (draw_id, winner_position)
);
create index lucky_draw_winners_participant_idx on public.lucky_draw_winners (participant_id);
create trigger lucky_draw_winners_updated_at before update on public.lucky_draw_winners
  for each row execute function public.set_updated_at();

-- ── Immutability guards ────────────────────────────────────────────────────
create or replace function public.guard_lucky_draw_mutation()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'lucky_draw_immutable' using errcode = 'P0001';
  end if;
  if old.status = 'voided'
     or new.status <> 'voided'
     or new.id <> old.id
     or new.winner_count <> old.winner_count
     or new.eligibility_rule <> old.eligibility_rule
     or new.eligible_count <> old.eligible_count
     or new.eligible_participant_snapshot <> old.eligible_participant_snapshot
     or new.executed_by <> old.executed_by
     or new.executed_at <> old.executed_at
     or new.event_id is distinct from old.event_id then
    raise exception 'lucky_draw_immutable' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
create trigger lucky_draws_immutable before update or delete on public.lucky_draws
  for each row execute function public.guard_lucky_draw_mutation();

create or replace function public.guard_lucky_winner_mutation()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'lucky_draw_immutable' using errcode = 'P0001';
  end if;
  if new.draw_id <> old.draw_id
     or new.participant_id <> old.participant_id
     or new.winner_position <> old.winner_position
     or new.created_at <> old.created_at then
    raise exception 'lucky_draw_immutable' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
create trigger lucky_draw_winners_immutable before update or delete on public.lucky_draw_winners
  for each row execute function public.guard_lucky_winner_mutation();

-- ── RLS ────────────────────────────────────────────────────────────────────
alter table public.lucky_draw_config enable row level security;
alter table public.lucky_draws enable row level security;
alter table public.lucky_draw_winners enable row level security;

create policy lucky_draw_config_admin_read on public.lucky_draw_config
  for select to authenticated using (public.is_admin());
create policy lucky_draws_admin_read on public.lucky_draws
  for select to authenticated using (public.is_admin());
create policy lucky_draw_winners_admin_read on public.lucky_draw_winners
  for select to authenticated using (public.is_admin());

revoke all on public.lucky_draw_config, public.lucky_draws, public.lucky_draw_winners from anon;
revoke insert, update, delete on public.lucky_draw_config, public.lucky_draws, public.lucky_draw_winners from authenticated;

-- ── Cryptographically secure integer in [0, p_max) ─────────────────────────
-- Rejection sampling over 32 random bits removes modulo bias.
create or replace function public.secure_random_int(p_max integer)
returns integer
language plpgsql
volatile
set search_path = public, extensions
as $$
declare
  v_space constant bigint := 4294967296;
  v_limit bigint;
  v_r     bigint;
begin
  if p_max is null or p_max <= 0 then
    raise exception 'invalid_range' using errcode = 'P0001';
  end if;
  v_limit := v_space - (v_space % p_max);
  loop
    v_r := ('x' || lpad(encode(gen_random_bytes(4), 'hex'), 16, '0'))::bit(64)::bigint;
    exit when v_r < v_limit;
  end loop;
  return (v_r % p_max)::integer;
end;
$$;

-- ── Draw configuration (audited) ───────────────────────────────────────────
create or replace function public.admin_update_draw_config(
  p_winner_count     integer,
  p_eligibility_rule public.eligibility_rule,
  p_event_id         uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old public.lucky_draw_config%rowtype;
  v_new public.lucky_draw_config%rowtype;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = 'P0001';
  end if;
  if p_winner_count is null or p_winner_count < 1 or p_winner_count > 500 then
    raise exception 'invalid_winner_count' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.lucky_draws where status = 'completed') then
    raise exception 'draw_already_completed' using errcode = 'P0001';
  end if;

  select * into v_old from public.lucky_draw_config where id for update;

  -- Widening eligibility beyond verified participants is an explicit,
  -- owner-only decision.
  if p_eligibility_rule <> v_old.eligibility_rule and not public.is_owner() then
    raise exception 'owner_required' using errcode = 'P0001';
  end if;

  update public.lucky_draw_config
     set winner_count = p_winner_count,
         eligibility_rule = p_eligibility_rule,
         event_id = p_event_id,
         updated_by = auth.uid()
   where id
  returning * into v_new;

  perform public.write_audit('lucky_draw.config_update', 'lucky_draw_config', 'lucky_draw_config',
    jsonb_build_object('winner_count', v_old.winner_count, 'eligibility_rule', v_old.eligibility_rule, 'event_id', v_old.event_id),
    jsonb_build_object('winner_count', v_new.winner_count, 'eligibility_rule', v_new.eligibility_rule, 'event_id', v_new.event_id));
end;
$$;

-- ── Draw execution (owner only, atomic) ────────────────────────────────────
-- p_expected_* must match the configuration the administrator confirmed on
-- screen, so a draw can never run with settings that changed underneath.
create or replace function public.execute_lucky_draw(
  p_expected_winner_count integer,
  p_expected_rule         public.eligibility_rule
)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_cfg     public.lucky_draw_config%rowtype;
  v_open    boolean;
  v_pool    uuid[];
  v_n       integer;
  v_k       integer;
  v_i       integer;
  v_j       integer;
  v_tmp     uuid;
  v_draw_id uuid;
begin
  if not public.is_owner() then
    raise exception 'owner_required' using errcode = 'P0001';
  end if;

  -- Serialise concurrent executions on the configuration row.
  select * into v_cfg from public.lucky_draw_config where id for update;

  if exists (select 1 from public.lucky_draws where status = 'completed') then
    raise exception 'draw_already_completed' using errcode = 'P0001';
  end if;

  select registration_open into v_open from public.app_settings where id;
  if coalesce(v_open, true) then
    raise exception 'registration_open' using errcode = 'P0001';
  end if;

  if v_cfg.winner_count <> p_expected_winner_count or v_cfg.eligibility_rule <> p_expected_rule then
    raise exception 'config_changed' using errcode = 'P0001';
  end if;

  select coalesce(array_agg(p.id order by p.id), '{}')
    into v_pool
    from public.participants p
   where p.registration_status = 'registered'
     and (v_cfg.eligibility_rule = 'all_registered' or p.verification_status = 'verified');

  v_n := coalesce(array_length(v_pool, 1), 0);
  v_k := v_cfg.winner_count;

  if v_n = 0 then
    raise exception 'no_eligible_participants' using errcode = 'P0001';
  end if;
  if v_n < v_k then
    raise exception 'insufficient_eligible_participants' using errcode = 'P0001';
  end if;

  insert into public.lucky_draws (event_id, winner_count, eligibility_rule, eligible_count,
                                  eligible_participant_snapshot, executed_by)
  values (v_cfg.event_id, v_k, v_cfg.eligibility_rule, v_n, to_jsonb(v_pool), auth.uid())
  returning id into v_draw_id;

  -- Partial Fisher–Yates shuffle: positions 1..k become the winners.
  for v_i in 1 .. v_k loop
    v_j := v_i + public.secure_random_int(v_n - v_i + 1);
    v_tmp := v_pool[v_i];
    v_pool[v_i] := v_pool[v_j];
    v_pool[v_j] := v_tmp;
  end loop;

  insert into public.lucky_draw_winners (draw_id, participant_id, winner_position, public_display_name)
  select v_draw_id, w.pid, w.pos::integer, public.public_display_name(p.full_name)
    from unnest(v_pool[1:v_k]) with ordinality as w(pid, pos)
    join public.participants p on p.id = w.pid;

  perform public.write_audit('lucky_draw.execute', 'lucky_draw', v_draw_id::text, null,
    jsonb_build_object('winner_count', v_k, 'eligibility_rule', v_cfg.eligibility_rule, 'eligible_count', v_n));

  return v_draw_id;
end;
$$;

-- ── Exceptional correction: void a completed draw (owner only) ─────────────
create or replace function public.admin_void_draw(p_draw_id uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_draw public.lucky_draws%rowtype;
begin
  if not public.is_owner() then
    raise exception 'owner_required' using errcode = 'P0001';
  end if;
  if p_reason is null or char_length(btrim(p_reason)) < 5 then
    raise exception 'reason_required' using errcode = 'P0001';
  end if;

  select * into v_draw from public.lucky_draws where id = p_draw_id for update;
  if not found then
    raise exception 'not_found' using errcode = 'P0001';
  end if;
  if v_draw.status <> 'completed' then
    raise exception 'draw_not_completed' using errcode = 'P0001';
  end if;

  update public.lucky_draws
     set status = 'voided', voided_at = now(), voided_by = auth.uid(), void_reason = btrim(p_reason)
   where id = p_draw_id;

  -- Hide the voided result publicly until a new draw is explicitly published.
  update public.app_settings set winners_public = false where id and winners_public;

  perform public.write_audit('lucky_draw.void', 'lucky_draw', p_draw_id::text,
    jsonb_build_object('status', 'completed'), jsonb_build_object('status', 'voided'), btrim(p_reason));
end;
$$;

-- ── Winner management (audited) ────────────────────────────────────────────
create or replace function public.admin_update_winner(
  p_winner_id           uuid,
  p_gift_status         public.gift_status,
  p_public_display_name text,
  p_gift_notes          text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old public.lucky_draw_winners%rowtype;
  v_new public.lucky_draw_winners%rowtype;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = 'P0001';
  end if;

  select * into v_old from public.lucky_draw_winners where id = p_winner_id for update;
  if not found then
    raise exception 'not_found' using errcode = 'P0001';
  end if;

  update public.lucky_draw_winners
     set gift_status = p_gift_status,
         public_display_name = coalesce(nullif(btrim(p_public_display_name), ''), v_old.public_display_name),
         gift_notes = nullif(btrim(coalesce(p_gift_notes, '')), '')
   where id = p_winner_id
  returning * into v_new;

  if v_new.gift_status is distinct from v_old.gift_status then
    perform public.write_audit('winner.gift_status', 'lucky_draw_winner', p_winner_id::text,
      jsonb_build_object('gift_status', v_old.gift_status), jsonb_build_object('gift_status', v_new.gift_status));
  end if;
  if v_new.public_display_name is distinct from v_old.public_display_name
     or v_new.gift_notes is distinct from v_old.gift_notes then
    perform public.write_audit('winner.update', 'lucky_draw_winner', p_winner_id::text,
      jsonb_build_object('public_display_name', v_old.public_display_name, 'gift_notes', v_old.gift_notes),
      jsonb_build_object('public_display_name', v_new.public_display_name, 'gift_notes', v_new.gift_notes));
  end if;
end;
$$;

-- ── Public winner announcement (safe fields only) ──────────────────────────
create or replace function public.get_public_winners()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_public boolean;
  v_draw   public.lucky_draws%rowtype;
begin
  select winners_public into v_public from public.app_settings where id;
  if not coalesce(v_public, false) then
    return jsonb_build_object('status', 'pending');
  end if;

  select * into v_draw from public.lucky_draws where status = 'completed';
  if not found then
    return jsonb_build_object('status', 'pending');
  end if;

  return jsonb_build_object(
    'status', 'announced',
    'announced_at', v_draw.executed_at,
    'winners', coalesce((
      select jsonb_agg(jsonb_build_object(
               'position', w.winner_position,
               'display_name', w.public_display_name,
               'side', p.side) order by w.winner_position)
        from public.lucky_draw_winners w
        join public.participants p on p.id = w.participant_id
       where w.draw_id = v_draw.id
    ), '[]'::jsonb)
  );
end;
$$;

revoke execute on function public.secure_random_int(integer) from public, anon, authenticated;
revoke execute on function public.guard_lucky_draw_mutation() from public, anon, authenticated;
revoke execute on function public.guard_lucky_winner_mutation() from public, anon, authenticated;
revoke execute on function public.admin_update_draw_config(integer, public.eligibility_rule, uuid) from public, anon;
revoke execute on function public.execute_lucky_draw(integer, public.eligibility_rule) from public, anon;
revoke execute on function public.admin_void_draw(uuid, text) from public, anon;
revoke execute on function public.admin_update_winner(uuid, public.gift_status, text, text) from public, anon;
grant execute on function public.admin_update_draw_config(integer, public.eligibility_rule, uuid) to authenticated;
grant execute on function public.execute_lucky_draw(integer, public.eligibility_rule) to authenticated;
grant execute on function public.admin_void_draw(uuid, text) to authenticated;
grant execute on function public.admin_update_winner(uuid, public.gift_status, text, text) to authenticated;
grant execute on function public.get_public_winners() to anon, authenticated;
