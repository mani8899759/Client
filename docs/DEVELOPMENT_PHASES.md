# Development Phases

All eight phases were implemented in one pass on a single shared architecture, schema and design system.

| Phase | Scope | Status | Key files |
|---|---|---|---|
| 01 Foundation | Next.js 16 + TS strict + Tailwind v4, tokens, components, Supabase clients, migration 0001, docs | Done | `styles/globals.css`, `components/*`, `lib/*`, `0001_foundation.sql` |
| 02 Homepage | Header, hero, countdown, welcome, previews, CTA, footer, motion | Done | `app/(public)/page.tsx`, `components/home/*` |
| 03 Story, events, locations | Timeline, events + detail, invitations, venues | Done | `story`, `events`, `locations` pages, `0002_content.sql` |
| 04 Gallery | Categories, masonry, lightbox, slideshow, video, progressive loading, storage | Done | `components/gallery/*`, `0006_storage.sql` |
| 05 Registration | Form, validation, normalisation, duplicates, idempotency, confirmation | Done | `register`, `api/registration`, `0003_participants.sql` |
| 06 QR + lucky draw | Common QR, verify flow, check-ins, CSPRNG draw, public winners | Done | `verify`, `api/verification`, `api/admin/qr`, `0004_lucky_draw.sql` |
| 07 Admin | Auth, all management modules, audit log, settings | Done | `app/admin/*`, `0005_admin_operations.sql` |
| 08 Integration | Tests, security review, responsive QA, build, docs | Done locally — see FINAL_PROJECT_REPORT.md for what was and was not verified | `tests/*`, `docs/*` |

Deployment to Vercel/Supabase has **not** been performed; it requires the owner's accounts (see ENVIRONMENT_SETUP.md).
