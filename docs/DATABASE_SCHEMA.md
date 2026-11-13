# Database Schema

Conventions: UUID primary keys (singletons use `id boolean = true`), `created_at`/`updated_at` (trigger-maintained), explicit status enums, CHECK constraints for lengths/formats, RLS enabled on every table.

## Tables

| Table | Purpose | Public access |
|---|---|---|
| `admin_profiles` | Admin accounts (`user_id` → `auth.users`, `role` owner/admin, `is_active`) | none |
| `audit_logs` | Append-only admin action log (admin_id, action, entity_type, entity_id, before/after, reason) | none; immutable via trigger |
| `wedding_settings` | Singleton: couple names, date, timezone, hero, welcome, story text, footer, contact, social links | read |
| `app_settings` | Singleton: registration_open, verification_enabled, winners_public, live_section_visible, consent text/version | read |
| `story_entries` | Love story timeline | read published |
| `venues` | Venue name, address, city/state/country, lat/lng, maps URL | read if used by a published event |
| `events` | Ceremonies; `venue_id` → venues; invitation image/video; dress code; order; published | read published |
| `gallery_categories` | Configurable gallery filters | read published |
| `gallery_media` | Photos (storage), videos (upload or YouTube), dimensions, featured, order, published | read published |
| `live_streams` | YouTube live/replay URLs, `event_id`, schedule, manual status upcoming/live/ended | read published |
| `participants` | Guest registrations (see below) | **none** |
| `checkins` | One per participant (`unique(participant_id)`), method `common_qr_mobile_match` or `admin_manual` | **none** |
| `lucky_draw_config` | Singleton: winner_count (default 11), eligibility_rule (default verified_only), event_id | none |
| `lucky_draws` | Immutable execution records incl. eligible snapshot; partial unique index allows one `completed` draw | none |
| `lucky_draw_winners` | draw_id, participant_id, winner_position, public_display_name, gift_status | none (public via function) |
| `rate_limit_buckets`, `security_events` | Abuse protection and logging | none |

### participants
`full_name`, `mobile_number`, `normalized_mobile` (`+91[6-9]XXXXXXXXX`, **unique**), `email`, `normalized_email` (lower-case, **unique**), `gender` (male/female), `address`, `side` (bride/groom), `consent` (must be true), `consent_timestamp`, `consent_policy_version`, `registration_status` (registered/cancelled), `verification_status` (pending/verified), `registration_request_id` (unique, idempotent retries), `registered_at`, `verified_at` (CHECK: set iff verified).

## Functions

| Function | Caller | Notes |
|---|---|---|
| `register_participant(...)` | service role | Checks registration open; unique violations → `duplicate`; request-id replay → same result |
| `verify_participant(mobile)` | service role | disabled / closed (draw done) / not_found / inactive / verified / already_verified; conditional UPDATE + unique check-in = exactly one success |
| `consume_rate_limit`, `log_security_event` | service role | |
| `execute_lucky_draw(expected_count, expected_rule)` | owner | Registration must be closed; config must match what was confirmed; CSPRNG (`gen_random_bytes`) partial Fisher–Yates; one transaction |
| `admin_void_draw(id, reason)` | owner | Only correction path; hides public result; keeps history |
| `admin_update_draw_config` | admin (rule change: owner) | Locked after a completed draw |
| `admin_update_winner` | admin | Gift status / display name / notes, audited |
| `admin_update_participant` | admin (side change: owner) | Audited; keeps uniqueness |
| `admin_manual_verify`, `admin_revert_verification`, `admin_set_registration_status` | admin | Reason required, audited, locked after the draw |
| `admin_dashboard_stats`, `admin_log_export` | admin | |
| `get_public_winners()` | anon | Only when `winners_public` and a completed draw exist; returns position, display name, side, date |

## Triggers
`set_updated_at` on all mutable tables · `audit_row_change` on content deletions and all live-stream changes · `audit_app_settings` names each switch change · immutability guards on `audit_logs`, `lucky_draws`, `lucky_draw_winners`.

## Migration 0007 — Priya & Arjun
- `wedding_settings` gains `website_title`, `website_subtitle`, `wedding_time_confirmed` (false = date-only wedding; countdown targets the start of the day), `cta_primary_label`, `cta_secondary_label`, bride/groom intros and images, `secondary_image_path`.
- Seeds (only into empty fields): Priya, Arjun, “Priya & Arjun — Wedding Celebration”, wedding date **2026-12-01 00:00 Asia/Kolkata** (`2026-11-30T18:30Z`), CTA labels, a generic welcome/invitation text.
- `app_settings.verification_enabled` defaults to **true**; `registration_open` was already true.
- `gallery_media.is_ai_generated`, `gallery_media.is_placeholder` flags.
- `admin_log_auth_event(action)` — audited sign-in / sign-out / password change.

Media references are either Storage paths (`wedding-images/…`) or bundled AI illustrations (`static/ai/<file>.webp`, served from `/public/images/ai`). Cleanup code never deletes `static/ai` files.

## Storage
Buckets `wedding-images` (JPG/PNG/WebP, 15 MB) and `wedding-videos` (MP4, 50 MB); public read by URL, writes restricted to active admins. Purposes: `hero`, `story`, `events`, `invitations`, `gallery`.
