-- Official wedding logo configuration columns on wedding_settings
ALTER TABLE wedding_settings
  ADD COLUMN IF NOT EXISTS logo_path text DEFAULT '/images/wedding-logo.webp',
  ADD COLUMN IF NOT EXISTS logo_header_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS logo_mobile_floating_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS logo_youtube_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS logo_header_size integer NOT NULL DEFAULT 28,
  ADD COLUMN IF NOT EXISTS logo_mobile_size integer NOT NULL DEFAULT 108,
  ADD COLUMN IF NOT EXISTS logo_mobile_bottom integer NOT NULL DEFAULT 16,
  ADD COLUMN IF NOT EXISTS logo_mobile_right integer NOT NULL DEFAULT 16;

UPDATE wedding_settings
SET logo_path = COALESCE(logo_path, '/images/wedding-logo.webp')
WHERE id = true;
