-- Seed Master for Manikanta & Sravika Wedding Website
-- Authoritative Venues, Events, Story Entries, and Settings

-- 1. Venues
insert into public.venues (id, name, address, city, state, country, latitude, longitude, google_maps_url, notes)
values
(
  'e1000000-0000-0000-0000-000000000001',
  'Eco Villagio Resorts',
  'Kandukuru',
  'Kandukuru',
  'Telangana',
  'India',
  17.062000,
  78.498000,
  'https://maps.google.com/?q=Eco+Villagio+Resorts+Kandukuru+Telangana',
  'Main wedding ceremony venue'
),
(
  'e2000000-0000-0000-0000-000000000002',
  '''P'' Conventions',
  'Visakhapatnam',
  'Visakhapatnam',
  'Andhra Pradesh',
  'India',
  17.686800,
  83.218500,
  'https://maps.google.com/?q=P+Conventions+Visakhapatnam',
  'Grand wedding reception venue'
)
on conflict (id) do update set
  name = excluded.name,
  address = excluded.address,
  city = excluded.city,
  state = excluded.state,
  country = excluded.country,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  google_maps_url = excluded.google_maps_url,
  notes = excluded.notes;

-- 2. Story Entries (4 Approved Milestones)
delete from public.story_entries;

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
);

-- 3. Events (6 Approved Celebrations)
delete from public.events;

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
  'e1000000-0000-0000-0000-000000000001',
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
  'e1000000-0000-0000-0000-000000000001',
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
  'e1000000-0000-0000-0000-000000000001',
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
  'Join us as we celebrate our new beginning with family, friends, joy and togetherness at ''P'' Conventions, Visakhapatnam.',
  'Join us as we celebrate our new beginning with family, friends, joy and togetherness at ''P'' Conventions, Visakhapatnam.',
  '2026-12-15',
  '12:00:00',
  null,
  'afternoon',
  '12:00 PM onwards',
  null,
  '/images/wedding-shoot/optimised/photo-12.webp',
  'Wedding Reception celebration imagery',
  'e2000000-0000-0000-0000-000000000002',
  60,
  true
);

-- 4. Website Settings for Manikanta & Sravika
update public.wedding_settings
set bride_name = 'Sravika',
    groom_name = 'Manikanta',
    website_title = 'Manikanta & Sravika — Wedding Celebrations',
    website_subtitle = 'December 13, 2026',
    welcome_title = 'Gudla & Padakanti Families',
    secondary_image_path = '/images/venues/eco-villagio-resorts.webp',
    secondary_image_alt = 'Eco Villagio Resorts wedding venue',
    hashtag = '#Kanmani',
    hashtag_title = 'Celebrate With Us',
    hashtag_message = 'Share your favourite moments from our celebrations with our wedding hashtag.',
    hashtag_homepage_visible = true,
    hashtag_invitation_visible = true
where id = true;
