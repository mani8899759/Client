-- Confirmed Reception Event and Venue Setup
-- Venue 1: Eco Villagio Resorts, Kandukuru, Telangana (Wedding Ceremony venue)
-- Venue 2: 'P' Conventions, Visakhapatnam, Andhra Pradesh (Reception venue)
-- Event: Reception on December 15, 2026, 12:00 PM onwards

UPDATE venues
SET address_line1 = 'Kandukuru',
    city = 'Kandukuru',
    state = 'Telangana',
    display_order = 1
WHERE id = 'e1000000-0000-0000-0000-000000000001';

INSERT INTO venues (
    id, name, slug, address_line1, city, state, postal_code, country,
    display_order, is_active
) VALUES (
    'e2000000-0000-0000-0000-000000000002',
    '''P'' Conventions',
    'p-conventions',
    'Visakhapatnam',
    'Visakhapatnam',
    'Andhra Pradesh',
    '530001',
    'India',
    2,
    true
)
ON CONFLICT (id) DO UPDATE SET
    name = '''P'' Conventions',
    address_line1 = 'Visakhapatnam',
    city = 'Visakhapatnam',
    state = 'Andhra Pradesh',
    display_order = 2,
    is_active = true;

UPDATE events
SET title = 'Reception',
    event_date = '2026-12-15',
    start_time = '12:00:00',
    time_label = '12:00 PM onwards',
    venue_id = 'e2000000-0000-0000-0000-000000000002',
    is_published = true,
    sort_order = 5
WHERE slug = 'reception';

UPDATE events
SET is_published = false
WHERE slug = 'wedding-reception';

UPDATE wedding_settings
SET secondary_image_path = '/images/venues/eco-villagio-resorts.webp',
    secondary_image_alt = 'Eco Villagio Resorts wedding venue';
