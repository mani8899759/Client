# Route Structure

## Public
| Route | Rendering | Notes |
|---|---|---|
| `/` | ISR 60s | Hero, countdown, welcome, story preview, events preview, gallery preview, live teaser, lucky-draw CTA |
| `/story` | ISR 60s | Editorial timeline |
| `/events` | ISR 60s | Alternating event compositions + jump navigation |
| `/events/[slug]` | dynamic | Event detail, invitation image/video, directions; 404 for unknown/unpublished |
| `/gallery` | ISR 60s | Filters, masonry, progressive loading, lightbox + slideshow |
| `/locations` | ISR 60s | Venues with related events, directions, map when coordinates exist |
| `/register` | dynamic | Bride/Groom registration |
| `/verify` | dynamic, noindex | Common-QR landing page |
| `/lucky-draw` | redirect | → `/lucky-draw/winners` |
| `/lucky-draw/winners` | ISR 30s | Public announcement (safe fields only) |
| `/live` | ISR 30s | YouTube live / upcoming / replay |

## Admin (all dynamic, noindex, `private, no-store`)
Public auth screens: `/admin/login`, `/admin/forgot-password`, `/admin/auth/callback` (Supabase code exchange), `/admin/reset-password` (requires the session created by the callback).

Protected (sidebar order): `/admin` Dashboard · `/admin/content` Website Content · `/admin/homepage` Homepage · `/admin/story` Our Love Story · `/admin/events` Wedding Events · `/admin/venues` Venues & Locations · `/admin/gallery` + `/admin/media` Gallery & Media · `/admin/registrations` Registrations · `/admin/participants` (+ `/[id]`) Participants · `/admin/verification` QR & Verification · `/admin/lucky-draw` Lucky Draw · `/admin/winners` Winners · `/admin/live` Live Streaming · `/admin/settings` Settings · `/admin/audit` Audit Logs · Logout.

## API
| Endpoint | Auth | Purpose |
|---|---|---|
| `GET /api/public/gallery?offset&type&category` | public | Paged published media |
| `POST /api/registration` | public, same-origin, rate-limited | Register a participant |
| `POST /api/verification` | public, same-origin, rate-limited (IP + number) | Common-QR mobile verification |
| `GET /api/admin/qr?format=png\|pdf` | admin | Common QR as PNG or A4 print PDF |
| `GET /api/admin/participants/export?format=csv\|xlsx&…filters` | admin | Audited export |

Admin mutations are Server Actions co-located in `src/app/admin/(dashboard)/*/actions.ts`.
