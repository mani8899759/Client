-- 1. Venues
insert into public.venues (id, name, address, city, state, country, latitude, longitude, google_maps_url, notes)
values (
  '11111111-1111-1111-1111-111111111111',
  'The Raj Palace Heritage Grand',
  'Amber Palace Road, Chokhi Dhani Enclave',
  'Jaipur',
  'Rajasthan',
  'India',
  26.9855,
  75.8513,
  'https://www.google.com/maps/dir/?api=1&destination=26.9855,75.8513',
  'Main palace lawns, ballroom and courtyard'
)
on conflict (id) do update
set name = excluded.name,
    address = excluded.address,
    city = excluded.city,
    state = excluded.state,
    latitude = excluded.latitude,
    longitude = excluded.longitude,
    google_maps_url = excluded.google_maps_url;

-- 2. Story entries (5 primary sections requested)
delete from public.story_entries;

insert into public.story_entries (chapter, title, date_label, description, image_path, image_alt, sort_order, is_published)
values
(
  'Chapter 01',
  'Every Story Has a Beginning',
  'How We Met',
  'Every beautiful journey begins with a simple moment. Our story began with an introduction that slowly turned into meaningful conversations and a connection that brought two families and two lives closer.',
  'static/ai/story-first-meeting.webp',
  'Quiet moment of introduction and conversation',
  10,
  true
),
(
  'Chapter 02',
  'The Little Moments',
  'Getting to Know Each Other',
  'With every conversation and every shared moment, we discovered more about each other. The simplest experiences became memories that made this journey even more special.',
  'static/ai/couple-prewedding.webp',
  'The couple sharing a walk at sunset',
  20,
  true
),
(
  'Chapter 03',
  'A Promise for Forever',
  'The Engagement',
  'An important milestone in our journey, the engagement brought our families together and marked the beginning of an exciting new chapter.',
  'static/ai/engagement-editorial.webp',
  'Detail of the engagement rings',
  30,
  true
),
(
  'Chapter 04',
  'Counting Down to Our Big Day',
  'The Pre-Wedding Journey',
  'As the wedding day approaches, we look forward to celebrating this wonderful occasion with our families, friends and everyone who has been part of our journey.',
  'static/ai/story-portrait.webp',
  'Priya and Arjun portrait at dusk',
  40,
  true
),
(
  'Chapter 05',
  'A New Chapter Begins',
  'December 13, 2026',
  'December 13, 2026, marks the beginning of a new chapter. We are excited to share this special occasion and create beautiful memories with the people who matter most.',
  'static/ai/wedding-ceremony.webp',
  'Sacred wedding ceremony beneath the mandap',
  50,
  true
);

-- 3. Five primary events
delete from public.events;

insert into public.events (
  slug, event_type, name, short_description, description,
  event_date, start_time, end_time, venue_id, dress_code,
  image_path, image_alt, sort_order, is_published
)
values
(
  'engagement',
  'engagement',
  'Engagement',
  'A special occasion bringing two families together.',
  'A special occasion bringing two families together to celebrate the beginning of a beautiful journey.',
  null,
  null,
  null,
  '11111111-1111-1111-1111-111111111111',
  'Festive Indian Formals',
  'static/ai/engagement-celebration.webp',
  'Engagement celebration with ivory florals',
  10,
  true
),
(
  'pre-wedding-celebration',
  'other',
  'Pre-Wedding Celebration',
  'Joyful moments, music and family celebration.',
  'A gathering filled with joyful moments, photographs, family celebrations and anticipation for the big day.',
  null,
  null,
  null,
  '11111111-1111-1111-1111-111111111111',
  'Vibrant Traditional Attire',
  'static/ai/couple-prewedding.webp',
  'Pre-wedding celebration and memories',
  20,
  true
),
(
  'wedding-ceremony',
  'wedding',
  'Wedding Ceremony',
  'The most special day as Priya & Arjun begin their journey.',
  'The most special day, as Priya and Arjun begin their new journey together surrounded by family and friends.',
  '2026-12-13',
  '18:00',
  '22:00',
  '11111111-1111-1111-1111-111111111111',
  'Traditional Royal Indian',
  'static/ai/wedding-ceremony.webp',
  'Sacred pheras and floral mandap',
  30,
  true
),
(
  'wedding-dinner-reception',
  'reception',
  'Wedding Dinner / Reception',
  'An evening of togetherness and delicious celebrations.',
  'An evening of togetherness, delicious food and celebrations with everyone who joins us for this special occasion.',
  null,
  null,
  null,
  '11111111-1111-1111-1111-111111111111',
  'Formal Evening Attire',
  'static/ai/reception-celebration.webp',
  'Candlelit wedding reception banquet',
  40,
  true
),
(
  'post-wedding-celebration',
  'other',
  'Post-Wedding Celebration',
  'Continuing the celebration with family and friends.',
  'Continuing the celebration with family, friends and beautiful memories from the wedding.',
  null,
  null,
  null,
  '11111111-1111-1111-1111-111111111111',
  'Elegant Contemporary Casuals',
  'static/ai/venue-courtyard.webp',
  'Palace courtyard celebration with lanterns',
  50,
  true
);

-- 4. Live Stream
delete from public.live_streams;

insert into public.live_streams (
  title, description, event_id, youtube_url, scheduled_at, status, sort_order, is_published
)
values (
  'Priya & Arjun Wedding Ceremony Live',
  'Join us live as Priya and Arjun tie the knot in Jaipur, Rajasthan.',
  (select id from public.events where slug = 'wedding-ceremony'),
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  '2026-12-13 18:00:00+05:30',
  'upcoming',
  10,
  true
);

-- 5. Update website settings for Priya & Arjun
update public.wedding_settings
set cta_primary_label = 'Win a Special Gift',
    cta_secondary_label = 'View Our Story',
    story_intro = 'Every beautiful journey begins with a simple moment. Here are the cherished memories and milestones leading up to our big day.',
    story_closing = 'We cannot wait to celebrate our love and begin this new chapter together with you on December 13, 2026.'
where id = true;
