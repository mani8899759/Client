-- ═══════════════════════════════════════════════════════════════════════════
-- 0007 · Priya & Arjun configuration, homepage fields, AI-image flags, auth audit
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Wedding settings: new homepage / identity fields ───────────────────────
alter table public.wedding_settings
  add column website_title          text check (website_title is null or char_length(website_title) <= 120),
  add column website_subtitle       text check (website_subtitle is null or char_length(website_subtitle) <= 120),
  -- false = date-only wedding: wedding_date is midnight (start of day) in the
  -- wedding timezone and the countdown targets the start of that day.
  add column wedding_time_confirmed boolean not null default false,
  add column cta_primary_label      text check (cta_primary_label is null or char_length(cta_primary_label) <= 40),
  add column cta_secondary_label    text check (cta_secondary_label is null or char_length(cta_secondary_label) <= 40),
  add column bride_intro            text check (bride_intro is null or char_length(bride_intro) <= 1000),
  add column groom_intro            text check (groom_intro is null or char_length(groom_intro) <= 1000),
  add column bride_image_path       text,
  add column bride_image_alt        text check (bride_image_alt is null or char_length(bride_image_alt) <= 200),
  add column groom_image_path       text,
  add column groom_image_alt        text check (groom_image_alt is null or char_length(groom_image_alt) <= 200),
  add column secondary_image_path   text,
  add column secondary_image_alt    text check (secondary_image_alt is null or char_length(secondary_image_alt) <= 200);

-- Owner-supplied wedding details. Only fills empty fields, so it never
-- overwrites content an administrator has already edited.
update public.wedding_settings
   set bride_name          = coalesce(bride_name, 'Priya'),
       groom_name          = coalesce(groom_name, 'Arjun'),
       website_title       = coalesce(website_title, 'Priya & Arjun'),
       website_subtitle    = coalesce(website_subtitle, 'Wedding Celebration'),
       timezone            = 'Asia/Kolkata',
       wedding_date        = coalesce(wedding_date, '2026-12-01 00:00:00+05:30'::timestamptz),
       hero_heading        = coalesce(hero_heading, 'Are getting married'),
       cta_primary_label   = coalesce(cta_primary_label, 'Register Now'),
       cta_secondary_label = coalesce(cta_secondary_label, 'View Our Story'),
       welcome_title       = coalesce(welcome_title, 'Welcome to our wedding celebration'),
       hero_subheading     = coalesce(hero_subheading, 'With joyful hearts, we invite you to celebrate the beginning of our forever.'),
       welcome_message     = coalesce(welcome_message, 'With the blessings of our families, we invite you to share in the joy of our wedding.' || chr(10) || chr(10) ||
                                                       'Here you will find the ceremonies, venues and everything you need for the celebrations. Your presence and blessings will make our day complete.')
 where id;

-- ── Registration and verification are open by default ──────────────────────
alter table public.app_settings alter column verification_enabled set default true;
update public.app_settings set verification_enabled = true where id and not verification_enabled;

-- ── Gallery: AI-illustration flags ─────────────────────────────────────────
alter table public.gallery_media
  add column is_ai_generated boolean not null default false,
  add column is_placeholder  boolean not null default false;
create index gallery_media_ai_idx on public.gallery_media (is_ai_generated) where is_ai_generated;

-- Static (repository-bundled) AI assets use "static/ai/<file>" references.
-- They are not Storage objects, so cleanup code ignores them.

-- ── Authentication audit events ────────────────────────────────────────────
create or replace function public.admin_log_auth_event(p_action text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = 'P0001';
  end if;
  if p_action not in ('auth.sign_in', 'auth.sign_out', 'auth.password_changed') then
    raise exception 'invalid' using errcode = 'P0001';
  end if;
  perform public.write_audit(p_action, 'admin', auth.uid()::text, null, null);
end;
$$;

revoke execute on function public.admin_log_auth_event(text) from public, anon;
grant execute on function public.admin_log_auth_event(text) to authenticated;
