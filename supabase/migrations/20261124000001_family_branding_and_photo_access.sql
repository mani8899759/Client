-- ═══════════════════════════════════════════════════════════════════════════
-- Family Branding & Wedding Photo Access Section Integration
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.wedding_settings
  add column if not exists groom_family_name text default 'Gudla',
  add column if not exists bride_family_name text default 'Padakanti',
  add column if not exists family_heading text default 'Gudla & Padakanti Families',
  add column if not exists family_invitation_message text default 'Together with the blessings of our families, we cordially invite you to celebrate the wedding of Manikanta & Sravika.',
  add column if not exists photo_access_enabled boolean default true,
  add column if not exists photo_access_heading text default 'Your Wedding Memories',
  add column if not exists photo_access_subheading text default 'Relive the Beautiful Moments',
  add column if not exists photo_access_description text default 'Be part of our celebration all over again. Explore the beautiful photographs captured during our wedding celebrations and find the memories you shared with us.',
  add column if not exists photo_access_url text default 'https://snapdiaries.ve.ai/gallery/manikanta-sravika',
  add column if not exists photo_access_cta_label text default 'View Wedding Photos',
  add column if not exists photo_access_supporting_text text default 'Access the complete wedding photo collection through our official photo gallery.',
  add column if not exists photo_access_qr_visible boolean default true;

-- Update existing row with default values
update public.wedding_settings
set
  groom_family_name = coalesce(groom_family_name, 'Gudla'),
  bride_family_name = coalesce(bride_family_name, 'Padakanti'),
  family_heading = coalesce(family_heading, 'Gudla & Padakanti Families'),
  family_invitation_message = coalesce(family_invitation_message, 'Together with the blessings of our families, we cordially invite you to celebrate the wedding of Manikanta & Sravika.'),
  photo_access_enabled = coalesce(photo_access_enabled, true),
  photo_access_heading = coalesce(photo_access_heading, 'Your Wedding Memories'),
  photo_access_subheading = coalesce(photo_access_subheading, 'Relive the Beautiful Moments'),
  photo_access_description = coalesce(photo_access_description, 'Be part of our celebration all over again. Explore the beautiful photographs captured during our wedding celebrations and find the memories you shared with us.'),
  photo_access_url = coalesce(photo_access_url, 'https://snapdiaries.ve.ai/gallery/manikanta-sravika'),
  photo_access_cta_label = coalesce(photo_access_cta_label, 'View Wedding Photos'),
  photo_access_supporting_text = coalesce(photo_access_supporting_text, 'Access the complete wedding photo collection through our official photo gallery.'),
  photo_access_qr_visible = coalesce(photo_access_qr_visible, true)
where id = true;
