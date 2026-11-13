# Environment Setup

## Requirements
- Node.js 20.9+ (developed on Node 24)
- A Supabase project (free tier is sufficient)
- A Vercel account for hosting

## 1. Install
```bash
npm install
cp .env.example .env.local   # then fill in the values below
```

## 2. Environment variables

| Variable | Exposure | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | Anon key: published content reads + admin auth (RLS-protected) |
| `NEXT_PUBLIC_SITE_URL` | public | Canonical URL, e.g. `https://ourwedding.in`. **Encoded in the common QR code** (`…/verify`) |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | Used only by `/api/registration` and `/api/verification` route handlers |
| `RATE_LIMIT_SALT` | **server only** | 32+ random characters; salts IP/mobile hashes used for rate limiting and abuse logs |

Never prefix the service-role key with `NEXT_PUBLIC_`. `src/lib/supabase/service.ts` imports `server-only`, so bundling it into client code fails the build. Never commit `.env*` files (already in `.gitignore`).

Without Supabase configured, the public site still renders with labelled placeholders, registration/verification show “unavailable”, and admin login explains what is missing.

## 3. Database
Apply the migrations in `supabase/migrations/` in filename order, then `supabase/seed.sql`:

- **Supabase CLI:** `supabase link --project-ref <ref>` then `supabase db push`, then run `seed.sql` in the SQL editor.
- **Dashboard only:** paste each migration file into SQL Editor in order, then `seed.sql`.

Migrations create all tables, constraints, indexes, RLS policies, database functions and the two storage buckets (`wedding-images`, `wedding-videos`).

## 4. Authentication settings (Supabase Dashboard)
- Authentication › Sign In / Providers › Email: enabled. **Disable “Allow new users to sign up”** — there is no public admin registration.
- Authentication › URL Configuration:
  - Site URL = `NEXT_PUBLIC_SITE_URL`
  - Redirect URLs: add `https://<your-domain>/admin/auth/callback` (and `http://localhost:3000/admin/auth/callback` for development). Password-reset links land here.
- Authentication › Emails: the built-in mailer is rate-limited; configure custom SMTP (Authentication › SMTP Settings) before relying on “Forgot password” in production.

## 5. Provision the first administrator
No default credentials exist in the code or repository.

1. Authentication › Users › **Add user**: the initial administrator's email and a strong password, tick *Auto confirm user*.
2. Edit the email and name in `supabase/provision_admin.sql` and run it in the SQL editor (role `owner`).
3. Sign in at `/admin/login`. The password can be changed at any time via **Forgot password** (Supabase sends a secure reset link → `/admin/reset-password`).

Sign-in verifies the Supabase session server-side *and* an active `admin_profiles` row; authenticated users without one are signed straight out. Sign-in attempts are rate-limited per IP; sign-ins, sign-outs and password changes are recorded in the audit log.

Roles: `owner` may execute/void the lucky draw, widen draw eligibility and correct a participant's side. `admin` can do everything else. Deactivate an admin with `update admin_profiles set is_active = false where user_id = '…'`.

## 6. Run
```bash
npm run dev          # http://localhost:3000
npm run check        # typecheck + lint + tests
npm run build && npm start
```

## 7. Deploy to Vercel
1. Import the repository in Vercel (framework preset: Next.js).
2. Add the five environment variables for Production (and Preview if used — preferably pointing at a separate staging Supabase project).
3. Add the production domain; Vercel provisions HTTPS automatically.
4. Set `NEXT_PUBLIC_SITE_URL` to the final domain **before printing the QR code**, redeploy, then download the PDF from Admin › QR & Verification.

## 8. AI illustrations
The site is designed to show AI-generated illustrations of a fictional couple until real photographs are uploaded. They are not included in the repository yet:

1. Generate the 24 images listed in `docs/AI_IMAGE_MANIFEST.md` (shared style + per-slot prompt, ratios given).
2. Save them in one folder, named after the slot (e.g. `hero.png`, `event-haldi.jpg`).
3. `npm run ai-assets:import -- <folder>` — converts to WebP in `public/images/ai/`, updates the manifest, writes `supabase/ai_gallery_seed.sql`.
4. Run `supabase/ai_gallery_seed.sql` in Supabase (flagged, replaceable gallery items), commit and redeploy.

Until then, every image slot shows a labelled placeholder. Uploading a real photograph in Admin › Homepage / Media / Events / Gallery always takes precedence.

## Tests
`npm test` runs unit tests and database tests. Database tests apply every migration to an in-process PostgreSQL (PGlite) with a small Supabase emulation (roles, `auth.uid()`, storage schema). They never touch a real project.
