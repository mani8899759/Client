-- Confirmed Reception Event and Venue Setup
-- Venue 1: Eco Villagio Resorts, Kandukuru, Telangana (Wedding Ceremony venue)
-- Venue 2: 'P' Conventions, Visakhapatnam, Andhra Pradesh (Reception venue)
-- Event: Reception on December 15, 2026, 12:00 PM onwards

UPDATE public.venues
SET address = 'Kandukuru',
    city = 'Kandukuru',
    state = 'Telangana',
    country = 'India'
WHERE id = 'e1000000-0000-0000-0000-000000000001';

INSERT INTO public.venues (
    id, name, address, city, state, country, latitude, longitude, google_maps_url
) VALUES (
    'e2000000-0000-0000-0000-000000000002',
    '''P'' Conventions',
    'Visakhapatnam',
    'Visakhapatnam',
    'Andhra Pradesh',
    'India',
    17.686800,
    83.218500,
    'https://maps.google.com/?q=P+Conventions+Visakhapatnam'
)
ON CONFLICT (id) DO UPDATE SET
    name = excluded.name,
    address = excluded.address,
    city = excluded.city,
    state = excluded.state,
    country = excluded.country,
    latitude = excluded.latitude,
    longitude = excluded.longitude,
    google_maps_url = excluded.google_maps_url;

UPDATE public.events
SET name = 'Reception',
    event_type = 'reception',
    event_date = '2026-12-15',
    start_time = '12:00:00',
    time_label = '12:00 PM onwards',
    venue_id = 'e2000000-0000-0000-0000-000000000002',
    is_published = true,
    sort_order = 60
WHERE slug = 'reception';

UPDATE public.events
SET is_published = false
WHERE slug in ('wedding-reception', 'pre-wedding-celebration', 'wedding-dinner-reception', 'post-wedding-celebration');

UPDATE public.wedding_settings
SET secondary_image_path = '/images/venues/eco-villagio-resorts.webp',
    secondary_image_alt = 'Eco Villagio Resorts wedding venue';
