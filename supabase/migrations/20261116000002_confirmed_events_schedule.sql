-- 20261116000002_confirmed_events_schedule.sql
-- Confirmed 5-event schedule for Priya & Arjun (December 2026)

-- 1. Add time_period and time_label columns to events table if not exists
alter table public.events add column if not exists time_period text;
alter table public.events add column if not exists time_label text;

-- 3. Unpublish old placeholder / generic events
update public.events
set is_published = false
where slug in ('pre-wedding-celebration', 'wedding-dinner-reception', 'post-wedding-celebration', 'wedding')
  and slug not in ('engagement', 'mehndi', 'haldi', 'sangeet', 'wedding-ceremony');

-- 4. Idempotently upsert the 5 confirmed events
insert into public.events (
  slug, event_type, name, short_description, description,
  event_date, start_time, end_time, time_period, time_label,
  dress_code, image_path, sort_order, is_published
) values
(
  'engagement',
  'engagement',
  'Engagement Ceremony',
  'A beautiful beginning to the wedding celebrations, bringing both families together to celebrate Priya and Arjun''s engagement.',
  'A beautiful beginning to the wedding celebrations, bringing both families together to celebrate Priya and Arjun''s engagement.',
  '2026-12-04',
  null,
  null,
  null,
  'Time to be announced',
  'Traditional / Festive Formal',
  'static/ai/engagement-celebration.webp',
  10,
  true
),
(
  'mehndi',
  'mehendi',
  'Mehndi Ceremony',
  'An evening filled with beautiful Mehndi designs, music, laughter and joyful moments as family and friends come together for the celebration.',
  'An evening filled with beautiful Mehndi designs, music, laughter and joyful moments as family and friends come together for the celebration.',
  '2026-12-11',
  '19:00:00',
  null,
  'evening',
  '7:00 PM onwards',
  'Festive / Vibrant Indian',
  'static/ai/mehendi-celebration.webp',
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
  'Morning — Exact timing to be announced',
  'Yellow / Traditional Festive',
  'static/ai/haldi-celebration.webp',
  30,
  true
),
(
  'sangeet',
  'sangeet',
  'Sangeet Ceremony',
  'An evening of music, dance, performances and unforgettable celebrations with family and friends.',
  'An evening of music, dance, performances and unforgettable celebrations with family and friends.',
  '2026-12-12',
  null,
  null,
  'evening',
  'Evening — Exact timing to be announced',
  'Glamorous Indian / Indo-Western',
  'static/ai/reception-celebration.webp',
  40,
  true
),
(
  'wedding-ceremony',
  'wedding',
  'Wedding Ceremony',
  'The most special day of our journey. With the blessings of our families and the presence of our loved ones, Priya and Arjun begin their new life together.',
  'The most special day of our journey. With the blessings of our families and the presence of our loved ones, Priya and Arjun begin their new life together.',
  '2026-12-13',
  null,
  null,
  'morning',
  'Morning — Exact Muhurtham / ceremony time to be announced',
  'Traditional South Indian Festive',
  'static/ai/wedding-ceremony.webp',
  50,
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
  dress_code = coalesce(events.dress_code, excluded.dress_code),
  image_path = coalesce(events.image_path, excluded.image_path),
  sort_order = excluded.sort_order,
  is_published = excluded.is_published;
