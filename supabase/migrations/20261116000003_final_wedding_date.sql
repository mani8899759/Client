-- 20261116000003_final_wedding_date.sql
-- Set final confirmed wedding date to December 13, 2026 (Sunday, Morning).
-- Updates central wedding settings and the main wedding ceremony event row.

-- 1. Update wedding_settings with the final date
update public.wedding_settings
set
  wedding_date = '2026-12-12 18:30:00+00'::timestamptz, -- Midnight 2026-12-13 Asia/Kolkata (UTC+05:30)
  timezone = coalesce(timezone, 'Asia/Kolkata'),
  wedding_time_confirmed = false,
  hero_heading = coalesce(hero_heading, 'Are getting married'),
  invitation_whatsapp_message = 'You''re warmly invited to celebrate the wedding of Priya & Arjun on December 13, 2026. We would love to have you with us!';

-- 2. Update the main Wedding Ceremony event date and details
update public.events
set
  event_date = '2026-12-13',
  time_period = 'morning',
  time_label = 'Morning — Exact Muhurtham / ceremony time to be announced',
  is_published = true
where slug = 'wedding-ceremony';
