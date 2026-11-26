-- 20261126000003_authoritative_invitation_content.sql
-- Authoritative Wedding Celebrations and Our Love Story content for Manikanta & Sravika

-- 1. Ensure Eco Villagio Resorts venue exists with verified details
insert into public.venues (
  id, name, address, city, state, country, latitude, longitude, google_maps_url
) values (
  'e1000000-0000-0000-0000-000000000001',
  'Eco Villagio Resorts',
  null,
  'Hyderabad',
  'Telangana',
  'India',
  17.385000,
  78.486700,
  'https://maps.google.com/?q=Eco+Villagio+Resorts'
)
on conflict (id) do update set
  name = excluded.name,
  city = excluded.city,
  state = excluded.state,
  country = excluded.country,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  google_maps_url = excluded.google_maps_url;

-- 2. Unpublish any old outdated placeholder events
update public.events
set is_published = false
where slug not in ('engagement', 'mehndi', 'haldi', 'sangeet', 'wedding-ceremony', 'reception')
  and is_published = true;

-- 3. Idempotently upsert the 6 approved wedding events
insert into public.events (
  slug, event_type, name, short_description, description,
  event_date, start_time, end_time, time_period, time_label,
  dress_code, image_path, image_alt, venue_id, sort_order, is_published
) values
(
  'engagement',
  'engagement',
  'Engagement Ceremony',
  'A beautiful beginning to our wedding celebrations, bringing our families together to share a special milestone filled with happiness and blessings.',
  'A beautiful beginning to our wedding celebrations, bringing our families together to share a special milestone filled with happiness and blessings.',
  '2026-12-04',
  null,
  null,
  null,
  'To be announced',
  null,
  '/images/wedding-shoot/optimised/photo-02.webp',
  'Engagement Ceremony celebration imagery',
  null,
  10,
  true
),
(
  'mehndi',
  'mehendi',
  'Mehndi Ceremony',
  'An evening filled with beautiful Mehndi designs, music, laughter and joyful moments as our families and friends come together.',
  'An evening filled with beautiful Mehndi designs, music, laughter and joyful moments as our families and friends come together.',
  '2026-12-11',
  '19:00:00',
  null,
  'evening',
  '7:00 PM onwards',
  null,
  '/images/wedding-shoot/optimised/photo-07.webp',
  'Mehndi Ceremony celebration imagery',
  null,
  20,
  true
),
(
  'haldi',
  'haldi',
  'Haldi Ceremony',
  'A joyful traditional Haldi celebration filled with family moments, blessings, colours and happiness as we prepare for the wedding.',
  'A joyful traditional Haldi celebration filled with family moments, blessings, colours and happiness as we prepare for the wedding.',
  '2026-12-12',
  null,
  null,
  'morning',
  'Morning',
  null,
  '/images/wedding-shoot/optimised/photo-04.webp',
  'Haldi Ceremony celebration imagery',
  null,
  30,
  true
),
(
  'sangeet',
  'sangeet',
  'Sangeet Ceremony',
  'An evening of music, dance, performances and unforgettable celebrations with our families and loved ones.',
  'An evening of music, dance, performances and unforgettable celebrations with our families and loved ones.',
  '2026-12-12',
  null,
  null,
  'evening',
  'Evening',
  null,
  '/images/wedding-shoot/optimised/photo-09.webp',
  'Sangeet Ceremony celebration imagery',
  null,
  40,
  true
),
(
  'wedding-ceremony',
  'wedding',
  'Wedding Ceremony',
  'The most special day of our journey, as Manikanta and Sravika begin their new life together with the blessings of their families.',
  'The most special day of our journey, as Manikanta and Sravika begin their new life together with the blessings of their families.',
  '2026-12-13',
  '08:08:00',
  null,
  'morning',
  '08:08 AM (Muhurtham)',
  'Traditional Festive',
  '/images/wedding-shoot/optimised/photo-10.webp',
  'Wedding Ceremony celebration imagery',
  'e1000000-0000-0000-0000-000000000001',
  50,
  true
),
(
  'reception',
  'reception',
  'Reception',
  'Join us as we celebrate our new beginning with family, friends, joy and togetherness.',
  'Join us as we celebrate our new beginning with family, friends, joy and togetherness.',
  null,
  null,
  null,
  null,
  'To be confirmed',
  null,
  '/images/wedding-shoot/optimised/photo-12.webp',
  'Wedding Reception celebration imagery',
  null,
  60,
  true
)
on conflict (slug) do update set
  event_type = excluded.event_type,
  name = excluded.name,
  short_description = excluded.short_description,
  description = excluded.description,
  event_date = excluded.event_date,
  start_time = excluded.start_time,
  end_time = excluded.end_time,
  time_period = excluded.time_period,
  time_label = excluded.time_label,
  dress_code = excluded.dress_code,
  image_path = excluded.image_path,
  image_alt = excluded.image_alt,
  venue_id = excluded.venue_id,
  sort_order = excluded.sort_order,
  is_published = true;

-- 4. Unpublish any old sample/placeholder story entries
update public.story_entries
set is_published = false
where id not in (
  '10000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000004'
) and title in (
  'Every Story Has a Beginning',
  'The Little Moments',
  'A Promise for Forever',
  'Counting Down to Our Big Day',
  'A New Chapter Begins'
);

-- 5. Idempotently upsert the 4 approved story milestones
insert into public.story_entries (
  id, chapter, title, date_label, entry_date, description,
  image_path, image_alt, sort_order, is_published
) values
(
  '10000000-0000-0000-0000-000000000001',
  'Our Beginning',
  'A Beautiful Beginning',
  'Our Beginning',
  null,
  'Every beautiful journey begins with a special moment. Our story is a collection of memories, meaningful moments and the people who made this journey special.',
  '/images/wedding-shoot/optimised/photo-01.webp',
  'Manikanta & Sravika — A Beautiful Beginning',
  10,
  true
),
(
  '10000000-0000-0000-0000-000000000002',
  'Shared Memories',
  'Moments That Became Memories',
  'Shared Memories',
  null,
  'Every photograph holds a memory, every moment becomes a story, and every step brings us closer to a beautiful new beginning.',
  '/images/wedding-shoot/optimised/photo-03.webp',
  'Manikanta & Sravika — Moments That Became Memories',
  20,
  true
),
(
  '10000000-0000-0000-0000-000000000003',
  'A Special Bond',
  'A Celebration of Togetherness',
  'A Special Bond',
  null,
  'With the love and blessings of our families, we look forward to celebrating this beautiful journey with everyone who has been part of our lives.',
  '/images/wedding-shoot/optimised/photo-08.webp',
  'Manikanta & Sravika — A Celebration of Togetherness',
  30,
  true
),
(
  '10000000-0000-0000-0000-000000000004',
  'Our New Beginning',
  'Forever Begins',
  'December 13, 2026',
  '2026-12-13',
  'On December 13, 2026, we begin a new chapter together. We cannot wait to share this special day with our family, friends and loved ones.',
  '/images/wedding-shoot/optimised/photo-11.webp',
  'Manikanta & Sravika — Forever Begins',
  40,
  true
)
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  date_label = excluded.date_label,
  entry_date = excluded.entry_date,
  description = excluded.description,
  image_path = excluded.image_path,
  image_alt = excluded.image_alt,
  sort_order = excluded.sort_order,
  is_published = true;
