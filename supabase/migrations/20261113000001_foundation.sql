-- ═══════════════════════════════════════════════════════════════════════════
-- 0001 · Foundation
-- Extensions, enum types, shared helpers, administrator profiles, audit log.
-- Conventions: UUID primary keys, created_at/updated_at timestamps, RLS on
-- every table, privileged operations only through SECURITY DEFINER functions
-- that verify the caller and write to the audit log in the same transaction.
-- ═══════════════════════════════════════════════════════════════════════════

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

-- ── Enum types ─────────────────────────────────────────────────────────────
create type public.admin_role          as enum ('owner', 'admin');
create type public.participant_side    as enum ('bride', 'groom');
create type public.participant_gender  as enum ('male', 'female');
create type public.registration_status as enum ('registered', 'cancelled');
create type public.verification_status as enum ('pending', 'verified');
create type public.event_type          as enum ('engagement', 'haldi', 'mehendi', 'wedding', 'reception', 'other');
create type public.media_type          as enum ('photo', 'video');
create type public.video_source        as enum ('upload', 'youtube');
create type public.stream_status       as enum ('upcoming', 'live', 'ended');
create type public.draw_status         as enum ('completed', 'voided');
create type public.gift_status         as enum ('pending', 'contacted', 'delivered');
create type public.eligibility_rule    as enum ('verified_only', 'all_registered');

-- ── updated_at trigger ─────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ── Administrator profiles ─────────────────────────────────────────────────
-- Rows are provisioned manually (see supabase/provision_admin.sql).
-- There is deliberately no public sign-up path.
create table public.admin_profiles (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  full_name  text not null check (char_length(btrim(full_name)) between 1 and 120),
  role       public.admin_role not null default 'admin',
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger admin_profiles_updated_at
  before update on public.admin_profiles
  for each row execute function public.set_updated_at();

-- SECURITY DEFINER so RLS policies can call it without recursing into
-- admin_profiles' own policies.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_profiles
    where user_id = auth.uid() and is_active
  );
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_profiles
    where user_id = auth.uid() and is_active and role = 'owner'
  );
$$;

alter table public.admin_profiles enable row level security;

create policy admin_profiles_admin_read on public.admin_profiles
  for select to authenticated
  using (public.is_admin());

-- ── Audit log (append-only) ────────────────────────────────────────────────
create table public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  admin_id    uuid,
  action      text not null check (char_length(action) between 1 and 80),
  entity_type text not null check (char_length(entity_type) between 1 and 60),
  entity_id   text,
  before_data jsonb,
  after_data  jsonb,
  reason      text check (reason is null or char_length(reason) <= 500),
  created_at  timestamptz not null default now()
);

create index audit_logs_created_at_idx on public.audit_logs (created_at desc);
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);
create index audit_logs_admin_idx on public.audit_logs (admin_id);

alter table public.audit_logs enable row level security;

create policy audit_logs_admin_read on public.audit_logs
  for select to authenticated
  using (public.is_admin());

-- No insert/update/delete policies: rows are written only by SECURITY DEFINER
-- functions and triggers. The trigger below blocks modification by anyone,
-- including the service role.
create or replace function public.prevent_audit_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'audit_log_immutable' using errcode = 'P0001';
end;
$$;

create trigger audit_logs_immutable
  before update or delete on public.audit_logs
  for each row execute function public.prevent_audit_mutation();

create or replace function public.write_audit(
  p_action      text,
  p_entity_type text,
  p_entity_id   text,
  p_before      jsonb,
  p_after       jsonb,
  p_reason      text default null
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.audit_logs (admin_id, action, entity_type, entity_id, before_data, after_data, reason)
  values (auth.uid(), p_action, p_entity_type, p_entity_id, p_before, p_after, p_reason);
$$;

-- Generic row-change audit trigger used by content tables.
-- TG_ARGV[0] = comma-separated list of operations to record (insert,update,delete).
create or replace function public.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ops text := coalesce(tg_argv[0], 'insert,update,delete');
  v_op  text := lower(tg_op);
begin
  if position(v_op in v_ops) = 0 then
    return coalesce(new, old);
  end if;

  if tg_op = 'DELETE' then
    perform public.write_audit(tg_table_name || '.delete', tg_table_name, old.id::text, to_jsonb(old), null);
    return old;
  elsif tg_op = 'UPDATE' then
    perform public.write_audit(tg_table_name || '.update', tg_table_name, new.id::text, to_jsonb(old), to_jsonb(new));
    return new;
  else
    perform public.write_audit(tg_table_name || '.create', tg_table_name, new.id::text, null, to_jsonb(new));
    return new;
  end if;
end;
$$;

-- Internal helpers are not callable through the API.
revoke execute on function public.write_audit(text, text, text, jsonb, jsonb, text) from public, anon, authenticated;
revoke execute on function public.audit_row_change() from public, anon, authenticated;
revoke execute on function public.prevent_audit_mutation() from public, anon, authenticated;
