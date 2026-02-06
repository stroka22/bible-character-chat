-- Add branding fields to site_settings for org customization

-- Logo URL (custom logo for the organization)
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Primary color (hex code, e.g., '#D97706' for amber-600)
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS primary_color TEXT;

-- Welcome message (shown on home page)
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS welcome_message TEXT;

-- Organization display name
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Custom tagline
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS tagline TEXT;
