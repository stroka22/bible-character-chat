-- =================================================================
-- Roundtable Settings Table
-- =================================================================
-- Stores per-organization configuration for the Roundtable feature
-- Allows admins to set defaults, limits, and locks for roundtable sessions

-- Create the table
CREATE TABLE IF NOT EXISTS roundtable_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_slug TEXT NOT NULL UNIQUE,
  defaults JSONB NOT NULL DEFAULT '{}'::jsonb,
  limits JSONB NOT NULL DEFAULT '{}'::jsonb,
  locks JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add index on owner_slug for faster lookups
CREATE INDEX IF NOT EXISTS roundtable_settings_owner_slug_idx ON roundtable_settings (owner_slug);

-- Create function for updating the updated_at timestamp
CREATE OR REPLACE FUNCTION update_roundtable_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row update
DROP TRIGGER IF EXISTS update_roundtable_settings_updated_at ON roundtable_settings;
CREATE TRIGGER update_roundtable_settings_updated_at
BEFORE UPDATE ON roundtable_settings
FOR EACH ROW
EXECUTE FUNCTION update_roundtable_settings_updated_at();

-- Enable Row Level Security
ALTER TABLE roundtable_settings ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies are defined in a separate file
COMMENT ON TABLE roundtable_settings IS 'Stores per-organization configuration for the Roundtable feature';
