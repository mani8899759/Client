-- Provision an administrator.
-- 1. Supabase Dashboard › Authentication › Users › "Add user" (email + password,
--    tick "Auto confirm user"). Disable public sign-ups in
--    Authentication › Sign In / Providers so nobody can self-register.
-- 2. Replace the e-mail and name below and run this in the SQL editor.
--    Role 'owner' may execute/void the lucky draw, widen draw eligibility and
--    correct a participant's side. Role 'admin' can do everything else.

insert into public.admin_profiles (user_id, full_name, role)
select id, 'Full Name', 'owner'
from auth.users
where email = 'admin@example.com'
on conflict (user_id) do update set role = excluded.role, is_active = true;
