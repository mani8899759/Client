-- ═══════════════════════════════════════════════════════════════════════════
-- 0002 · Wedding content
-- Wedding settings, application settings, love story, venues, events,
-- gallery, live streams. Published rows are publicly readable; all writes
-- require an active administrator (RLS) and deletions are audited.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Wedding settings (singleton) ───────────────────────────────────────────
-- Every field that describes the couple is nullable: nothing is invented.
-- The public site renders clearly labelled placeholders until the owner fills
-- these in from Admin › Content.
create table public.wedding_settings (
  id                    boolean primary key default true check (id),
  bride_name            text check (bride_name is null or char_length(bride_name) <= 80),
  groom_name            text check (groom_name is null or char_length(groom_name) <= 80),
  monogram              text check (monogram is null or char_length(monogram) <= 12),
  wedding_date          timestamptz,
  wedding_end_at        timestamptz,
  timezone              text not null default 'Asia/Kolkata' check (char_length(timezone) <= 64),
  announcement          text check (announcement is null or char_length(announcement) <= 160),
  hero_heading          text check (hero_heading is null or char_length(hero_heading) <= 160),
  hero_subheading       text check (hero_subheading is null or char_length(hero_subheading) <= 400),
  hero_image_path       text,
  hero_image_alt        text check (hero_image_alt is null or char_length(hero_image_alt) <= 200),
  hero_video_path       text,
  welcome_title         text check (welcome_title is null or char_length(welcome_title) <= 160),
  welcome_message       text check (welcome_message is null or char_length(welcome_message) <= 2000),
  invitation_message    text check (invitation_message is null or char_length(invitation_message) <= 1000),
  welcome_image_path    text,
  welcome_image_alt     text check (welcome_image_alt is null or char_length(welcome_image_alt) <= 200),
  story_intro           text check (story_intro is null or char_length(story_intro) <= 2000),
  story_closing         text check (story_closing is null or char_length(story_closing) <= 2000),
  footer_note           text check (footer_note is null or char_length(footer_note) <= 400),
  contact_name          text check (contact_name is null or char_length(contact_name) <= 120),
  contact_phone         text check (contact_phone is null or char_length(contact_phone) <= 40),
  contact_email         text check (contact_email is null or char_length(contact_email) <= 254),
  social_links          jsonb not null default '[]'::jsonb check (jsonb_typeof(social_links) = 'array'),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  constraint wedding_end_after_start check (wedding_end_at is null or wedding_date is null or wedding_end_at > wedding_date)
);

create trigger wedding_settings_updated_at
  before update on public.wedding_settings
  for each row execute function public.set_updated_at();
create trigger wedding_settings_audit
  after update on public.wedding_settings
  for each row execute function public.audit_row_change('update');

alter table public.wedding_settings enable row level security;
create policy wedding_settings_public_read on public.wedding_settings
  for select to anon, authenticated using (true);
create policy wedding_settings_admin_update on public.wedding_settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- ── Application settings (singleton) ───────────────────────────────────────
create table public.app_settings (
  id                     boolean primary key default true check (id),
  registration_open      boolean not null default true,
  verification_enabled   boolean not null default false,
  winners_public         boolean not null default false,
  live_section_visible   boolean not null default true,
  consent_policy_version text not null default '2026-11-v1' check (char_length(consent_policy_version) between 1 and 40),
  consent_text           text not null default 'I agree that the wedding organisers may store my details to manage the wedding lucky draw and contact me if I win. My details will not be shared publicly.'
                         check (char_length(consent_text) between 10 and 1000),
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create trigger app_settings_updated_at
  before update on public.app_settings
  for each row execute function public.set_updated_at();

-- Named audit entries for operational switches (registration state, QR
-- verification activation, winner visibility, live visibility).
create or replace function public.audit_app_settings()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.registration_open is distinct from old.registration_open then
    perform public.write_audit(
      case when new.registration_open then 'registration.opened' else 'registration.closed' end,
      'app_settings', 'app_settings',
      jsonb_build_object('registration_open', old.registration_open),
      jsonb_build_object('registration_open', new.registration_open));
  end if;
  if new.verification_enabled is distinct from old.verification_enabled then
    perform public.write_audit(
      case when new.verification_enabled then 'verification.activated' else 'verification.deactivated' end,
      'app_settings', 'app_settings',
      jsonb_build_object('verification_enabled', old.verification_enabled),
      jsonb_build_object('verification_enabled', new.verification_enabled));
  end if;
  if new.winners_public is distinct from old.winners_public then
    perform public.write_audit(
      case when new.winners_public then 'winners.published' else 'winners.hidden' end,
      'app_settings', 'app_settings',
      jsonb_build_object('winners_public', old.winners_public),
      jsonb_build_object('winners_public', new.winners_public));
  end if;
  if new.live_section_visible is distinct from old.live_section_visible
     or new.consent_policy_version is distinct from old.consent_policy_version
     or new.consent_text is distinct from old.consent_text then
    perform public.write_audit('settings.update', 'app_settings', 'app_settings',
      jsonb_build_object('live_section_visible', old.live_section_visible,
                         'consent_policy_version', old.consent_policy_version),
      jsonb_build_object('live_section_visible', new.live_section_visible,
                         'consent_policy_version', new.consent_policy_version));
  end if;
  return new;
end;
$$;
revoke execute on function public.audit_app_settings() from public, anon, authenticated;

create trigger app_settings_audit
  after update on public.app_settings
  for each row execute function public.audit_app_settings();

alter table public.app_settings enable row level security;
create policy app_settings_public_read on public.app_settings
  for select to anon, authenticated using (true);
create policy app_settings_admin_update on public.app_settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- ── Love story ─────────────────────────────────────────────────────────────
create table public.story_entries (
  id                   uuid primary key default gen_random_uuid(),
  chapter              text check (chapter is null or char_length(chapter) <= 60),
  title                text not null check (char_length(btrim(title)) between 1 and 160),
  date_label           text check (date_label is null or char_length(date_label) <= 60),
  entry_date           date,
  description          text check (description is null or char_length(description) <= 4000),
  image_path           text,
  image_alt            text check (image_alt is null or char_length(image_alt) <= 200),
  secondary_image_path text,
  secondary_image_alt  text check (secondary_image_alt is null or char_length(secondary_image_alt) <= 200),
  sort_order           integer not null default 0,
  is_published         boolean not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index story_entries_order_idx on public.story_entries (sort_order, entry_date);

create trigger story_entries_updated_at before update on public.story_entries
  for each row execute function public.set_updated_at();
create trigger story_entries_audit after delete on public.story_entries
  for each row execute function public.audit_row_change('delete');

-- ── Venues ─────────────────────────────────────────────────────────────────
create table public.venues (
  id              uuid primary key default gen_random_uuid(),
  name            text not null check (char_length(btrim(name)) between 1 and 160),
  address         text check (address is null or char_length(address) <= 400),
  city            text check (city is null or char_length(city) <= 80),
  state           text check (state is null or char_length(state) <= 80),
  country         text check (country is null or char_length(country) <= 80),
  latitude        numeric(9, 6) check (latitude is null or latitude between -90 and 90),
  longitude       numeric(9, 6) check (longitude is null or longitude between -180 and 180),
  google_maps_url text check (google_maps_url is null or google_maps_url ~ '^https://'),
  notes           text check (notes is null or char_length(notes) <= 1000),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint venues_coordinates_pair check ((latitude is null) = (longitude is null))
);

create trigger venues_updated_at before update on public.venues
  for each row execute function public.set_updated_at();
create trigger venues_audit after delete on public.venues
  for each row execute function public.audit_row_change('delete');

-- ── Events ─────────────────────────────────────────────────────────────────
create table public.events (
  id                    uuid primary key default gen_random_uuid(),
  slug                  text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80),
  event_type            public.event_type not null default 'other',
  name                  text not null check (char_length(btrim(name)) between 1 and 120),
  short_description     text check (short_description is null or char_length(short_description) <= 300),
  description           text check (description is null or char_length(description) <= 5000),
  event_date            date,
  start_time            time,
  end_time              time,
  venue_id              uuid references public.venues (id) on delete set null,
  dress_code            text check (dress_code is null or char_length(dress_code) <= 200),
  image_path            text,
  image_alt             text check (image_alt is null or char_length(image_alt) <= 200),
  invitation_image_path text,
  invitation_video_path text,
  contact_info          text check (contact_info is null or char_length(contact_info) <= 300),
  sort_order            integer not null default 0,
  is_published          boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index events_order_idx on public.events (sort_order, event_date, start_time);
create index events_venue_idx on public.events (venue_id);

create trigger events_updated_at before update on public.events
  for each row execute function public.set_updated_at();
create trigger events_audit after delete on public.events
  for each row execute function public.audit_row_change('delete');

-- ── Gallery ────────────────────────────────────────────────────────────────
create table public.gallery_categories (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (char_length(btrim(name)) between 1 and 60),
  slug         text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 60),
  description  text check (description is null or char_length(description) <= 300),
  sort_order   integer not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger gallery_categories_updated_at before update on public.gallery_categories
  for each row execute function public.set_updated_at();
create trigger gallery_categories_audit after delete on public.gallery_categories
  for each row execute function public.audit_row_change('delete');

create table public.gallery_media (
  id             uuid primary key default gen_random_uuid(),
  category_id    uuid references public.gallery_categories (id) on delete set null,
  media_type     public.media_type not null,
  title          text check (title is null or char_length(title) <= 160),
  caption        text check (caption is null or char_length(caption) <= 600),
  alt_text       text check (alt_text is null or char_length(alt_text) <= 200),
  storage_path   text,
  thumbnail_path text,
  width          integer check (width is null or width > 0),
  height         integer check (height is null or height > 0),
  video_source   public.video_source,
  video_url      text check (video_url is null or video_url ~ '^https://'),
  is_featured    boolean not null default false,
  sort_order     integer not null default 0,
  is_published   boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint gallery_media_source_valid check (
    (media_type = 'photo' and storage_path is not null and video_source is null)
    or (media_type = 'video' and video_source = 'upload' and storage_path is not null)
    or (media_type = 'video' and video_source = 'youtube' and video_url is not null)
  )
);
create index gallery_media_listing_idx on public.gallery_media (is_published, sort_order, created_at desc);
create index gallery_media_category_idx on public.gallery_media (category_id);

create trigger gallery_media_updated_at before update on public.gallery_media
  for each row execute function public.set_updated_at();
create trigger gallery_media_audit after delete on public.gallery_media
  for each row execute function public.audit_row_change('delete');

-- ── Live streams ───────────────────────────────────────────────────────────
create table public.live_streams (
  id           uuid primary key default gen_random_uuid(),
  title        text not null check (char_length(btrim(title)) between 1 and 160),
  description  text check (description is null or char_length(description) <= 1000),
  event_id     uuid references public.events (id) on delete set null,
  youtube_url  text check (youtube_url is null or youtube_url ~ '^https://'),
  replay_url   text check (replay_url is null or replay_url ~ '^https://'),
  scheduled_at timestamptz,
  status       public.stream_status not null default 'upcoming',
  sort_order   integer not null default 0,
  is_published boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index live_streams_order_idx on public.live_streams (sort_order, scheduled_at);

create trigger live_streams_updated_at before update on public.live_streams
  for each row execute function public.set_updated_at();
create trigger live_streams_audit after insert or update or delete on public.live_streams
  for each row execute function public.audit_row_change('insert,update,delete');

-- ── RLS for publishable content ────────────────────────────────────────────
do $$
declare
  t text;
begin
  foreach t in array array['story_entries', 'events', 'gallery_categories', 'gallery_media', 'live_streams'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy %I on public.%I for select to anon, authenticated using (is_published or public.is_admin())', t || '_public_read', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (public.is_admin())', t || '_admin_insert', t);
    execute format('create policy %I on public.%I for update to authenticated using (public.is_admin()) with check (public.is_admin())', t || '_admin_update', t);
    execute format('create policy %I on public.%I for delete to authenticated using (public.is_admin())', t || '_admin_delete', t);
  end loop;
end;
$$;

-- Venues are public only when a published event uses them.
alter table public.venues enable row level security;
create policy venues_public_read on public.venues
  for select to anon, authenticated
  using (public.is_admin() or exists (
    select 1 from public.events e where e.venue_id = venues.id and e.is_published
  ));
create policy venues_admin_insert on public.venues
  for insert to authenticated with check (public.is_admin());
create policy venues_admin_update on public.venues
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy venues_admin_delete on public.venues
  for delete to authenticated using (public.is_admin());

-- ── Singleton rows (configuration, not business records) ───────────────────
insert into public.wedding_settings (id) values (true) on conflict (id) do nothing;
insert into public.app_settings (id) values (true) on conflict (id) do nothing;
