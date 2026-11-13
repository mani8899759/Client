-- ═══════════════════════════════════════════════════════════════════════════
-- 0005 · Administrative operations
-- Participant corrections, manual verification, registration state changes
-- and dashboard statistics. Each function checks the caller's role and writes
-- an audit record in the same transaction as the change.
-- ═══════════════════════════════════════════════════════════════════════════

create or replace function public.admin_update_participant(
  p_participant_id    uuid,
  p_full_name         text,
  p_mobile_number     text,
  p_normalized_mobile text,
  p_email             text,
  p_normalized_email  text,
  p_gender            public.participant_gender,
  p_address           text,
  p_side              public.participant_side,
  p_reason            text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old public.participants%rowtype;
  v_new public.participants%rowtype;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = 'P0001';
  end if;
  if p_reason is null or char_length(btrim(p_reason)) < 5 then
    raise exception 'reason_required' using errcode = 'P0001';
  end if;

  select * into v_old from public.participants where id = p_participant_id for update;
  if not found then
    raise exception 'not_found' using errcode = 'P0001';
  end if;

  if p_side <> v_old.side and not public.is_owner() then
    raise exception 'owner_required' using errcode = 'P0001';
  end if;

  begin
    update public.participants
       set full_name = btrim(p_full_name),
           mobile_number = btrim(p_mobile_number),
           normalized_mobile = p_normalized_mobile,
           email = btrim(p_email),
           normalized_email = p_normalized_email,
           gender = p_gender,
           address = btrim(p_address),
           side = p_side
     where id = p_participant_id
    returning * into v_new;
  exception
    when unique_violation then
      raise exception 'duplicate' using errcode = 'P0001';
    when check_violation then
      raise exception 'invalid' using errcode = 'P0001';
  end;

  if v_new.side <> v_old.side then
    perform public.write_audit('participant.side_correction', 'participant', p_participant_id::text,
      jsonb_build_object('side', v_old.side), jsonb_build_object('side', v_new.side), btrim(p_reason));
  end if;

  if (v_new.full_name, v_new.mobile_number, v_new.email, v_new.gender, v_new.address)
     is distinct from (v_old.full_name, v_old.mobile_number, v_old.email, v_old.gender, v_old.address) then
    perform public.write_audit('participant.correction', 'participant', p_participant_id::text,
      jsonb_build_object('full_name', v_old.full_name, 'mobile_number', v_old.mobile_number,
                         'email', v_old.email, 'gender', v_old.gender, 'address', v_old.address),
      jsonb_build_object('full_name', v_new.full_name, 'mobile_number', v_new.mobile_number,
                         'email', v_new.email, 'gender', v_new.gender, 'address', v_new.address),
      btrim(p_reason));
  end if;
end;
$$;

create or replace function public.admin_manual_verify(p_participant_id uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_p public.participants%rowtype;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = 'P0001';
  end if;
  if p_reason is null or char_length(btrim(p_reason)) < 5 then
    raise exception 'reason_required' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.lucky_draws where status = 'completed') then
    raise exception 'draw_already_completed' using errcode = 'P0001';
  end if;

  select * into v_p from public.participants where id = p_participant_id for update;
  if not found then
    raise exception 'not_found' using errcode = 'P0001';
  end if;
  if v_p.registration_status <> 'registered' then
    raise exception 'inactive' using errcode = 'P0001';
  end if;
  if v_p.verification_status = 'verified' then
    raise exception 'already_verified' using errcode = 'P0001';
  end if;

  update public.participants
     set verification_status = 'verified', verified_at = now()
   where id = p_participant_id
  returning * into v_p;

  insert into public.checkins (participant_id, verification_method, verified_at, verified_by, reason)
  values (p_participant_id, 'admin_manual', v_p.verified_at, auth.uid(), btrim(p_reason));

  perform public.write_audit('participant.manual_verify', 'participant', p_participant_id::text,
    jsonb_build_object('verification_status', 'pending'),
    jsonb_build_object('verification_status', 'verified', 'verified_at', v_p.verified_at),
    btrim(p_reason));
end;
$$;

create or replace function public.admin_revert_verification(p_participant_id uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_p public.participants%rowtype;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = 'P0001';
  end if;
  if p_reason is null or char_length(btrim(p_reason)) < 5 then
    raise exception 'reason_required' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.lucky_draws where status = 'completed') then
    raise exception 'draw_already_completed' using errcode = 'P0001';
  end if;

  select * into v_p from public.participants where id = p_participant_id for update;
  if not found then
    raise exception 'not_found' using errcode = 'P0001';
  end if;
  if v_p.verification_status <> 'verified' then
    raise exception 'not_verified' using errcode = 'P0001';
  end if;

  delete from public.checkins where participant_id = p_participant_id;
  update public.participants
     set verification_status = 'pending', verified_at = null
   where id = p_participant_id;

  perform public.write_audit('participant.verification_reverted', 'participant', p_participant_id::text,
    jsonb_build_object('verification_status', 'verified', 'verified_at', v_p.verified_at),
    jsonb_build_object('verification_status', 'pending'),
    btrim(p_reason));
end;
$$;

create or replace function public.admin_set_registration_status(
  p_participant_id uuid,
  p_status         public.registration_status,
  p_reason         text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_p public.participants%rowtype;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = 'P0001';
  end if;
  if p_reason is null or char_length(btrim(p_reason)) < 5 then
    raise exception 'reason_required' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.lucky_draws where status = 'completed') then
    raise exception 'draw_already_completed' using errcode = 'P0001';
  end if;

  select * into v_p from public.participants where id = p_participant_id for update;
  if not found then
    raise exception 'not_found' using errcode = 'P0001';
  end if;
  if v_p.registration_status = p_status then
    return;
  end if;

  update public.participants set registration_status = p_status where id = p_participant_id;

  perform public.write_audit('participant.registration_status', 'participant', p_participant_id::text,
    jsonb_build_object('registration_status', v_p.registration_status),
    jsonb_build_object('registration_status', p_status),
    btrim(p_reason));
end;
$$;

create or replace function public.admin_dashboard_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = 'P0001';
  end if;

  select jsonb_build_object(
    'total_registered',  count(*) filter (where registration_status = 'registered'),
    'total_cancelled',   count(*) filter (where registration_status = 'cancelled'),
    'bride_registered',  count(*) filter (where registration_status = 'registered' and side = 'bride'),
    'groom_registered',  count(*) filter (where registration_status = 'registered' and side = 'groom'),
    'total_verified',    count(*) filter (where registration_status = 'registered' and verification_status = 'verified'),
    'total_pending',     count(*) filter (where registration_status = 'registered' and verification_status = 'pending'),
    'bride_verified',    count(*) filter (where registration_status = 'registered' and verification_status = 'verified' and side = 'bride'),
    'groom_verified',    count(*) filter (where registration_status = 'registered' and verification_status = 'verified' and side = 'groom'),
    'male_registered',   count(*) filter (where registration_status = 'registered' and gender = 'male'),
    'female_registered', count(*) filter (where registration_status = 'registered' and gender = 'female')
  )
  into v_result
  from public.participants;

  return v_result || jsonb_build_object(
    'winner_count', (select count(*) from public.lucky_draw_winners w
                       join public.lucky_draws d on d.id = w.draw_id and d.status = 'completed'),
    'failed_verifications_24h', (select count(*) from public.security_events
                                  where event_type = 'verification_not_found'
                                    and created_at > now() - interval '24 hours'),
    'rate_limited_24h', (select count(*) from public.security_events
                          where event_type = 'rate_limited'
                            and created_at > now() - interval '24 hours')
  );
end;
$$;

revoke execute on function public.admin_update_participant(uuid, text, text, text, text, text, public.participant_gender, text, public.participant_side, text) from public, anon;
revoke execute on function public.admin_manual_verify(uuid, text) from public, anon;
revoke execute on function public.admin_revert_verification(uuid, text) from public, anon;
revoke execute on function public.admin_set_registration_status(uuid, public.registration_status, text) from public, anon;
revoke execute on function public.admin_dashboard_stats() from public, anon;
grant execute on function public.admin_update_participant(uuid, text, text, text, text, text, public.participant_gender, text, public.participant_side, text) to authenticated;
grant execute on function public.admin_manual_verify(uuid, text) to authenticated;
grant execute on function public.admin_revert_verification(uuid, text) to authenticated;
grant execute on function public.admin_set_registration_status(uuid, public.registration_status, text) to authenticated;
grant execute on function public.admin_dashboard_stats() to authenticated;

-- Audit record for participant data exports (personal data leaving the system).
create or replace function public.admin_log_export(p_format text, p_row_count integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = 'P0001';
  end if;
  if p_format not in ('csv', 'xlsx') then
    raise exception 'invalid' using errcode = 'P0001';
  end if;
  perform public.write_audit('participants.export', 'participant', null, null,
    jsonb_build_object('format', p_format, 'rows', greatest(coalesce(p_row_count, 0), 0)));
end;
$$;

revoke execute on function public.admin_log_export(text, integer) from public, anon;
grant execute on function public.admin_log_export(text, integer) to authenticated;
