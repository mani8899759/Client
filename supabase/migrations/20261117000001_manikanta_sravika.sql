-- Migration: 20261117000001_manikanta_sravika.sql
-- Updates client wedding details for Manikanta & Sravika from Gudla's Wedding Invitation PDF

-- 1. Upsert Venues: Eco Villagio Resorts (Hyderabad/Kandukuru) and 'P' Conventions (Visakhapatnam)
insert into public.venues (id, name, address, city, state, country, latitude, longitude, google_maps_url, notes)
values
  (
    'e1000000-0000-0000-0000-000000000001',
    'Eco Villagio Resorts',
    'S.No. 132, Gummada Vally, Kandukuru, Telangana',
    'Hyderabad',
    'Telangana',
    'India',
    17.067800,
    78.498300,
    'https://www.google.com/maps/search/?api=1&query=Eco+Villagio+Resorts+Kandukuru+Telangana+Hyderabad+501506',
    'Wedding ceremony venue — S.No. 132, Gummada Vally, Kandukuru, Hyderabad - 501506'
  ),
  (
    'e2000000-0000-0000-0000-000000000002',
    '''P'' Conventions',
    'Kailasapuram, Backside Port Stadium, Narasimha Nagar',
    'Visakhapatnam',
    'Andhra Pradesh',
    'India',
    17.738000,
    83.301500,
    'https://www.google.com/maps/search/?api=1&query=P+Conventions+Kailasapuram+Port+Stadium+Visakhapatnam',
    'Reception venue — Kailasapuram, Backside Port Stadium, Narasimha Nagar, Visakhapatnam'
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

-- 2. Unpublish placeholder pre-wedding events so only confirmed events appear
update public.events
set is_published = false
where slug in ('engagement', 'mehndi', 'haldi', 'sangeet', 'pre-wedding-celebration', 'post-wedding-celebration');

-- 3. Update Wedding Ceremony event for Dec 13, 2026 at 08:08 AM IST
update public.events
set
  name = 'Wedding Ceremony',
  event_type = 'wedding',
  event_date = '2026-12-13',
  start_time = '08:08:00',
  end_time = null,
  time_period = 'morning',
  time_label = '08:08 AM (Muhurtham)',
  venue_id = 'e1000000-0000-0000-0000-000000000001',
  dress_code = 'Traditional South Indian Festive',
  short_description = 'The auspicious Muhurtham ceremony uniting Manikanta and Sravika with the blessings of family and elders.',
  description = 'With the blessings of our families and elders, Chy. Neela Manikanta and Chy. La. Sow. Lakshmi Sravika begin their sacred new life together on Sunday, 13th December 2026 at 08:08 AM (Muhurtham) at Eco Villagio Resorts, Kandukuru, Hyderabad.',
  sort_order = 10,
  is_published = true
where slug = 'wedding-ceremony';

-- 4. Upsert Wedding Reception event for Dec 15, 2026 from 12:00 Noon onwards
insert into public.events (
  slug, event_type, name, event_date, start_time, time_period, time_label,
  venue_id, dress_code, short_description, description, sort_order, is_published
)
values (
  'wedding-reception',
  'reception',
  'Wedding Reception',
  '2026-12-15',
  '12:00:00',
  'afternoon',
  '12:00 Noon onwards',
  'e2000000-0000-0000-0000-000000000002',
  'Traditional / Festive Formal',
  'A celebratory afternoon with family and friends to honour Manikanta & Sravika.',
  'Sri Gudla Venu Venkata Parameswara Reddy and Smt. Nagendra Lakshmi solicit your gracious presence and blessings on the joyous occasion of the wedding reception of Manikanta & Sravika on Tuesday, 15th December 2026 from 12:00 noon onwards at ''P'' Conventions, Visakhapatnam.',
  20,
  true
)
on conflict (slug) do update set
  event_type = excluded.event_type,
  name = excluded.name,
  event_date = excluded.event_date,
  start_time = excluded.start_time,
  time_period = excluded.time_period,
  time_label = excluded.time_label,
  venue_id = excluded.venue_id,
  dress_code = excluded.dress_code,
  short_description = excluded.short_description,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_published = true;

-- 5. Update central wedding settings with Manikanta & Sravika details
update public.wedding_settings
set
  bride_name = 'Sravika',
  groom_name = 'Manikanta',
  monogram = 'M & S',
  wedding_date = '2026-12-13T02:38:00+00:00',
  wedding_time_confirmed = true,
  timezone = 'Asia/Kolkata',
  website_title = 'Manikanta & Sravika',
  website_subtitle = 'Gudla''s Wedding Invitation',
  hero_heading = 'Are getting married',
  hero_subheading = 'With the blessings of our families, we invite you to celebrate the beginning of our forever.',
  hero_image_alt = 'Manikanta & Sravika Wedding Celebration',
  welcome_title = 'Welcome to Gudla''s Wedding Invitation',
  welcome_message = 'Sri Gudla Venu Venkata Parameswara Reddy and Smt. Nagendra Lakshmi solicit your gracious presence with family and friends on the auspicious occasion of the marriage of their son, Chy. Neela Manikanta, with Chy. La. Sow. Lakshmi Sravika, youngest daughter of Smt. Padakanti Saroja and late Bhrahma Chari of Aminpur, Hyderabad.' || E'\n\n' || 'Your presence and blessings will make our celebrations complete.',
  invitation_cover_heading = 'Gudla''s Wedding Invitation',
  invitation_cover_subheading = 'We Are Getting Married',
  invitation_intro_heading = 'With the Blessings of Our Families',
  invitation_intro_message = 'Sri Gudla Venu Venkata Parameswara Reddy and Smt. Nagendra Lakshmi solicit your gracious presence with family and friends on the auspicious occasion of the marriage of their son, Chy. Neela Manikanta, with Chy. La. Sow. Lakshmi Sravika, youngest daughter of Smt. Padakanti Saroja and late Bhrahma Chari of Aminpur, Hyderabad.',
  invitation_family_names = 'Gudla & Padakanti Families',
  invitation_closing_heading = 'Your Gracious Presence Means the World to Us',
  invitation_closing_message = 'Sri Gudla Venu Venkata Parameswara Reddy, Smt. Nagendra Lakshmi, and family solicit your gracious presence and blessings on this joyous occasion.',
  invitation_whatsapp_message = 'You''re warmly invited to celebrate the wedding of Manikanta & Sravika on Sunday, December 13, 2026 at 08:08 AM. We look forward to celebrating with you!',
  invitation_pdf_path = '/documents/gudlas-wedding-invitation.pdf',
  contact_name = 'Sri GVVP Reddy / Smt. Nagendra Lakshmi',
  contact_phone = '+91 9848657487, +91 9550475579',
  story_intro = 'Every beautiful journey begins with a sacred blessing. Cherished memories and milestones of Manikanta and Sravika as two lives and families unite.',
  story_closing = 'We cannot wait to celebrate our wedding and begin this new chapter together with you on December 13, 2026.'
where id = true;

-- 6. Update Live Stream details
update public.live_streams
set
  title = 'Manikanta & Sravika Wedding Ceremony Live',
  description = 'Join us live as Manikanta and Sravika tie the knot at Eco Villagio Resorts, Kandukuru, Hyderabad.',
  scheduled_at = '2026-12-13T02:38:00+00:00';
