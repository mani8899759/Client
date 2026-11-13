-- Development / first-run seed.
-- Contains configuration only: default gallery categories that the owner can
-- rename, reorder, unpublish or delete in Admin › Gallery.
-- No participants, couple details, venues or other business records are seeded.

insert into public.gallery_categories (name, slug, sort_order) values
  ('Pre-Wedding',      'pre-wedding',      10),
  ('Couple Portraits', 'couple-portraits', 20),
  ('Engagement',       'engagement',       30),
  ('Haldi',            'haldi',            40),
  ('Mehendi',          'mehendi',          50),
  ('Wedding',          'wedding',          60),
  ('Reception',        'reception',        70),
  ('Videos',           'videos',           80)
on conflict (slug) do nothing;
