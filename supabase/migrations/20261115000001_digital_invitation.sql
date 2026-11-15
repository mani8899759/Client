-- ═══════════════════════════════════════════════════════════════════════════
-- Digital Wedding Invitation: Configuration, Content, Music & Section Toggles
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.wedding_settings
  add column if not exists invitation_cover_heading text default 'A Special Invitation',
  add column if not exists invitation_cover_subheading text default 'We''re Getting Married',
  add column if not exists invitation_cover_image_path text,
  add column if not exists invitation_intro_heading text default 'Together With Our Families',
  add column if not exists invitation_intro_message text default 'We warmly invite you to join us as we celebrate the beginning of our new journey together. Your presence will make our special day even more memorable.',
  add column if not exists invitation_family_names text,
  add column if not exists invitation_closing_heading text default 'Your Presence Would Mean the World to Us',
  add column if not exists invitation_closing_message text default 'We look forward to celebrating this special beginning with our family and friends. We would be delighted to have you with us.',
  add column if not exists invitation_whatsapp_message text default 'You''re warmly invited to celebrate the wedding of Priya & Arjun on December 1, 2026. We would love to have you with us!',
  add column if not exists invitation_music_path text,
  add column if not exists invitation_music_title text default 'Traditional Wedding Celebration Music',
  add column if not exists invitation_music_enabled boolean default true,
  add column if not exists invitation_music_volume numeric(3,2) default 0.70,
  add column if not exists invitation_auto_play_on_open boolean default true,
  add column if not exists invitation_section_countdown boolean default true,
  add column if not exists invitation_section_story boolean default true,
  add column if not exists invitation_section_events boolean default true,
  add column if not exists invitation_section_document boolean default true,
  add column if not exists invitation_section_gallery boolean default true,
  add column if not exists invitation_section_venues boolean default true,
  add column if not exists invitation_section_gift_draw boolean default true;

-- Update storage.buckets to allow audio MIME types in wedding-images
update storage.buckets
set allowed_mime_types = array[
  'image/jpeg', 'image/png', 'image/webp', 'application/pdf',
  'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/aac', 'audio/x-m4a', 'audio/mp4', 'audio/ogg'
],
file_size_limit = 26214400
where id = 'wedding-images';
