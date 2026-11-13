# Final Project Report — Priya & Arjun

## 0. Priya & Arjun update (second specification)
| Requirement | Status |
|---|---|
| Priya & Arjun everywhere (header, hero, footer, pages, SEO/OG metadata, admin) from central settings, editable | Done (migration 0007 seed + `src/config/wedding.ts` fallback) |
| December 1, 2026, Asia/Kolkata; date-only countdown to the start of the day; optional ceremony time | Done; verified in tests (`2026-11-30T18:30Z`) |
| Countdown: days/hours/minutes/seconds, every second, hydration-safe, “Today is the day!”, “The celebration has begun!”, never negative | Done (`countdown-math.ts` + tests) |
| Hero: names, “Are getting married”, date, invitation, Register Now + View Our Story, live countdown | Done |
| Homepage sections 1–11 incl. couple introduction and venue preview | Done |
| Registration open by default, no login needed, server-enforced open/close | Done |
| Confirmation “Welcome to the Celebration!” with side and QR instructions | Done |
| Verification enabled by default; common QR; no OTP | Done |
| Admin login: email/password, show/hide, validation, loading, generic error, champagne CTA, server-side profile check, rate limit, audit | Done |
| Forgot / reset password via Supabase Auth | Done (needs Redirect URL + SMTP configured — see setup) |
| Sidebar exactly as specified, incl. Homepage, Venues & Locations, Registrations, Gallery & Media | Done |
| Media manager: identify AI placeholders, replace with real photos, revert | Done (`/admin/media`, gallery AI badges/filter) |
| `is_ai_generated` / `is_placeholder` flags | Done (gallery rows + `static/ai` references) |
| **AI-generated images** | **Not generated.** No image-generation tool was available in this environment. The full pipeline is built (24 slots with prompts, import script → WebP, manifest, flagged gallery seed, automatic fallbacks, “Illustration” tags). Until images are imported, slots show labelled placeholders. |

## 1. Completed features
- **Public site:** editorial homepage (hero image/video, live countdown with started/completed states, welcome, story preview, events preview, gallery preview, live teaser, lucky-draw CTA), Our Story timeline, Events + event detail (invitation image/video, dress code, directions), Locations (multi-venue, maps link/embed), Gallery (configurable categories, photo/video filters, masonry with natural ratios, progressive loading, keyboard/swipe lightbox, slideshow, YouTube and uploaded video), Live (live/upcoming/replay), Lucky-draw winners announcement.
- **Guest participation:** Bride/Groom registration with client + server validation, Indian mobile normalisation, duplicate prevention (mobile and email, across sides), idempotent retries, honeypot, consent with timestamp and policy version, confirmation screen. Common-QR verification by registered mobile number — no OTP, no individual QR codes — with all specified result states.
- **Lucky draw:** server-side CSPRNG draw in one transaction, default 11 winners from verified participants (combined pool), configurable count and owner-only eligibility widening, rerun prevention, immutable results, audited void-and-redraw correction path, public announcement exposing only position, display name and side.
- **Admin:** Supabase Auth login (no sign-up), protected routes, overview with live statistics, content/homepage editor, love story, events and venues, gallery (bulk upload, YouTube links, categories, ordering, publish, featured), participants (search, filters, sorting, pagination, detail, audited corrections, owner-only side correction, cancel/reinstate, CSV and Excel export), QR & verification (QR display, PNG, print PDF, link, activate/deactivate, stats, verified/pending lists, manual verification with reason), lucky draw control, winners with gift status, live streams with manual status, settings, audit log.

## 2–3. Architecture and folder structure
See `docs/PROJECT_ARCHITECTURE.md` and `docs/ROUTE_STRUCTURE.md`.

## 4–7. Database, Supabase, RLS, storage
See `docs/DATABASE_SCHEMA.md`. Summary: RLS on every table; the anon role can read only published content and `app_settings`/`wedding_settings`; participants, check-ins, draws and winners have no anon privileges at all; writes go through admin RLS policies or `SECURITY DEFINER` functions that check the role and write the audit log. Storage buckets enforce MIME types and size limits; only admins can write.

## 8. API endpoints
`POST /api/registration`, `POST /api/verification`, `GET /api/public/gallery`, `GET /api/admin/qr`, `GET /api/admin/participants/export`, plus Server Actions for admin mutations.

## 9. Admin access setup
`docs/ENVIRONMENT_SETUP.md` §4–5 and `supabase/provision_admin.sql`.

## 10. Environment variables
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server only), `RATE_LIMIT_SALT` (server only). Template: `.env.example`.

## 11. Testing results (performed locally)
| Check | Result |
|---|---|
| `tsc --noEmit` (strict, `noUncheckedIndexedAccess`) | Pass, 0 errors |
| `eslint .` (next core-web-vitals + typescript) | Pass, 0 errors / 0 warnings (123 files) |
| `vitest` — unit tests (normalisation, validation, timezones, YouTube parsing, CSV injection, media validation, countdown phases for 1 Dec 2026 IST) | Pass |
| `vitest` — 36 database tests: all 7 migrations applied to PGlite (PostgreSQL 17) with Supabase emulation, incl. Priya & Arjun seed, auth audit, AI gallery seed | Pass (81 tests total) |
| `next build` (production) | Pass, 31 routes |
| Smoke test of every public/admin route on the production server | Correct status codes (200 / 307 to login / 404) |
| Responsive sweep: public pages + admin auth screens at 360–1440 px | No horizontal overflow, no console errors |
| Client bundle scan for service-role key / privileged RPC names | None found |

Database tests cover: valid registration; duplicate mobile; duplicate email including cross-side; retried request id; concurrent duplicate submissions; invalid data at constraint level; registration closed; anon/non-admin cannot read participants or call privileged functions; verification disabled / verified / already verified / concurrent / not found / cancelled / closed after draw; audited manual verification; admin vs owner corrections; append-only audit log; draw with 0, 1, 11, >11 eligible and insufficient eligible; uniqueness and verified-only filtering; rerun prevention including concurrent execution; non-owner rejection; registration-open and stale-confirmation rejection; immutability; owner-only eligibility widening; public winner payload fields; gift status; void + redraw audit trail; CSPRNG distribution; content RLS and deletion audit.

**Not verified here (requires the owner's Supabase project):** live PostgREST/Auth/Storage round-trips — actual admin sign-in, the password-reset email flow, browser uploads to Storage, and the registration/verification endpoints against a real database. Journeys B–D and F in the spec therefore still need to be run once Supabase is connected. PGlite executes one connection at a time, so the concurrency tests exercise the SQL logic (row locks, unique constraints), not true parallel connections. Core Web Vitals / Lighthouse were not measured. No deployment was performed.

## 12. Security checklist
- [x] Service-role key server-only (`server-only` import; bundle scan clean)
- [x] Server-side authorisation on every admin page, action and route; RLS as second layer
- [x] Participants never exposed publicly; winners page returns safe fields only
- [x] Uploads: type/size validated client-side and enforced by bucket config; controlled paths
- [x] Input validation with shared zod schemas + database CHECK constraints
- [x] SQL injection: parameterised Supabase queries; search input sanitised for PostgREST filters
- [x] XSS: React escaping; the only raw HTML is the locally generated QR SVG
- [x] Rate limiting (IP, per-number) + logging of failed and throttled attempts
- [x] CSRF: Origin check on public POST endpoints; Server Actions' built-in origin check
- [x] Generic error messages; raw database errors never returned
- [x] Security headers: HSTS, X-Frame-Options/frame-ancestors, nosniff, Referrer-Policy, Permissions-Policy
- [x] Spreadsheet formula-injection protection in exports; exports audited
- [x] Draw integrity: single transaction, CSPRNG, one completed draw, immutable records

## 13. Performance observations
Public pages are statically generated with ISR (30–60 s) and revalidated on every admin change. Images go through `next/image` (AVIF/WebP, responsive `sizes`, lazy by default, priority only on the hero). The gallery loads 24 items per page with intersection-based loading. Fonts are self-hosted via `next/font`. Framer Motion is the only animation library.

## 14. Deployment instructions
`docs/ENVIRONMENT_SETUP.md` §3–7.

## 15. Known limitations
- **Accepted by the owner:** verification by mobile number without OTP means anyone who knows a guest's registered number could verify them. Mitigated by rate limits, generic responses and logging.
- Public Storage buckets serve files to anyone holding the URL. Unpublished media isn't linked anywhere, and its paths are random UUIDs, but the files themselves aren't access-controlled.
- Unlisted YouTube videos are not private.
- Stream status is set manually (no YouTube API integration).
- Rate limiting fails open if the database is unreachable, so guests are not locked out at the venue.
- Exports are capped at 20,000 rows; admin search uses `ILIKE` (fine for wedding-scale data).
- The draw requires registration to be closed first, by design.

## 16. Maintenance
- Change content in Admin; nothing about the couple is hard-coded.
- Schema changes: add a new numbered migration, never edit applied ones; extend `tests/db` alongside.
- Bump the consent policy version in Admin › Settings whenever the consent text changes.
- Backups: Supabase daily backups (enable Point-in-Time Recovery on a paid plan for the wedding week). Export participants (CSV) after the draw for an offline copy.
- Monitoring: Vercel runtime logs and Supabase logs. Server code logs error codes without personal data.
