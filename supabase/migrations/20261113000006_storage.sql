-- ═══════════════════════════════════════════════════════════════════════════
-- 0006 · Storage
-- Two public-read buckets with server-enforced size and MIME limits.
-- Object paths: <purpose>/<yyyy>/<uuid>.<ext>, purposes:
--   hero · story · events · invitations · gallery
-- Only active administrators may upload, replace or delete objects.
-- Public buckets serve files by URL; object paths are random UUIDs and the
-- buckets are not listable by the public. Media is only *linked* from the
-- site once its database record is published.
-- ═══════════════════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('wedding-images', 'wedding-images', true, 15728640, array['image/jpeg', 'image/png', 'image/webp']),
  ('wedding-videos', 'wedding-videos', true, 52428800, array['video/mp4'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy wedding_media_admin_select on storage.objects
  for select to authenticated
  using (bucket_id in ('wedding-images', 'wedding-videos') and public.is_admin());

create policy wedding_media_admin_insert on storage.objects
  for insert to authenticated
  with check (bucket_id in ('wedding-images', 'wedding-videos') and public.is_admin());

create policy wedding_media_admin_update on storage.objects
  for update to authenticated
  using (bucket_id in ('wedding-images', 'wedding-videos') and public.is_admin())
  with check (bucket_id in ('wedding-images', 'wedding-videos') and public.is_admin());

create policy wedding_media_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id in ('wedding-images', 'wedding-videos') and public.is_admin());
