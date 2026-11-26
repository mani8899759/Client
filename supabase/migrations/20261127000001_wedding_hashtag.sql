-- ═══════════════════════════════════════════════════════════════════════════
-- Official Wedding Hashtag Integration: #Kanmani
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.wedding_settings
  add column if not exists hashtag text default '#Kanmani',
  add column if not exists hashtag_title text default 'Celebrate With Us',
  add column if not exists hashtag_message text default 'Share your favourite moments from our celebrations with our wedding hashtag.',
  add column if not exists hashtag_homepage_visible boolean default true,
  add column if not exists hashtag_invitation_visible boolean default true;

-- Update existing row with default values
update public.wedding_settings
set
  hashtag = coalesce(hashtag, '#Kanmani'),
  hashtag_title = coalesce(hashtag_title, 'Celebrate With Us'),
  hashtag_message = coalesce(hashtag_message, 'Share your favourite moments from our celebrations with our wedding hashtag.'),
  hashtag_homepage_visible = coalesce(hashtag_homepage_visible, true),
  hashtag_invitation_visible = coalesce(hashtag_invitation_visible, true)
where id = true;
