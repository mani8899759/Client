-- ─────────────────────────────────────────────────────────────────────────────
-- Digital Invitation: Gopuram Ending Section & Live Stream Toggles
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.wedding_settings
  add column if not exists invitation_gopuram_enabled boolean default true,
  add column if not exists invitation_gopuram_image_path text default 'static/images/priyaa-arjun-invitation-gopuram.png',
  add column if not exists invitation_section_livestream boolean default true;
