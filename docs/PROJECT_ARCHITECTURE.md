# Project Architecture

One Next.js 16 (App Router) application on Vercel, backed by one Supabase project (PostgreSQL, Auth, Storage). No other infrastructure.

```
Browser ──► Next.js (Vercel)
             ├─ Public pages (Server Components, ISR 30–60 s)  ──anon key──►  RLS: published rows only
             ├─ /api/registration, /api/verification          ──service role──► SECURITY DEFINER functions
             ├─ /api/public/gallery (progressive loading)      ──anon key
             ├─ /admin/* (Server Components + Server Actions)  ──user session──► RLS is_admin() + audited functions
             └─ /api/admin/* (QR PNG/PDF, participant export)  ──user session
Admin browser ──► Supabase Storage (direct upload, storage RLS: admins only)
```

## Folder structure
```
src/
  app/
    (public)/            homepage, story, events, events/[slug], gallery, locations,
                         register, verify, lucky-draw/winners, live
    admin/login          sign-in (no public sign-up)
    admin/(dashboard)/   overview, content, story, events, gallery, live, participants,
                         participants/[id], verification, lucky-draw, winners, settings, audit
    api/                 public/gallery · registration · verification · admin/qr · admin/participants/export
  components/            layout, navigation, typography, buttons, forms, cards, media, gallery,
                         events, countdown, home, motion, feedback, admin
  lib/                   env, supabase (public/server/service/browser clients), auth, admin (action
                         helpers, CRUD, media cleanup), validation, security, storage, utils
  services/              content (public reads), admin (participants, audit labels)
  styles/globals.css     design tokens + typography utilities
  types/database.ts      row types
  config/site.ts         navigation, labels, placeholders
  proxy.ts               session refresh + /admin redirect (Next 16 “proxy”, formerly middleware)
supabase/migrations/     0001 foundation · 0002 content · 0003 participants · 0004 lucky draw ·
                         0005 admin operations · 0006 storage
tests/                   unit/ and db/ (PGlite)
```

## Key decisions
- **Privileged logic lives in the database.** Registration, verification, the draw, manual verification and participant corrections are PL/pgSQL functions that check the caller and write the audit log in the same transaction. Uniqueness and one-check-in-per-guest are database constraints, so concurrency is handled by PostgreSQL rather than application code.
- **Three Supabase clients.** Cookie-less anon client for cacheable public reads; a session client for admin pages/actions (RLS applies as the signed-in admin); a service-role client used only by the two public write endpoints, which have no anon-executable equivalent.
- **Defence in depth for admin.** `proxy.ts` redirects anonymous users → `requireAdminPage()/requireAdmin()` re-verify with `auth.getUser()` and `admin_profiles` → RLS policies and function checks enforce it again.
- **Media.** Admins upload directly from the browser to Storage (avoids Vercel's request size limit); bucket MIME/size limits are enforced by Supabase. Records store `bucket/purpose/yyyy/uuid.ext`; replaced/deleted files are cleaned up.
- **Content freshness.** Public pages use ISR; every admin mutation calls `revalidatePath('/', 'layout')` so changes appear immediately.
- **Rate limiting** is a database fixed-window counter (`consume_rate_limit`) — works across serverless instances, no Redis.

## Global states
Loading (`admin/(dashboard)/loading.tsx`, gallery skeletons), empty (`EmptyState`), errors (`(public)/error.tsx`, `admin/(dashboard)/error.tsx`, `global-error.tsx`), not found (`not-found.tsx`), unauthorised (redirect to `/admin/login`, “no access” notice for non-admin accounts), form validation (field-level messages from shared zod schemas, server-side re-validation), network failure (registration retries once with an idempotency key; clear offline message).
