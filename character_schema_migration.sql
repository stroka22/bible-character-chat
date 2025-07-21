-- Migration: Character Schema for Selection UI and Insights Panel
-- Created: 2025-07-08

-- Add columns for Character Selection UI
ALTER TABLE characters
    ADD COLUMN IF NOT EXISTS testament text CHECK (testament IN ('old','new')) DEFAULT 'old',
    ADD COLUMN IF NOT EXISTS bible_book text,
    ADD COLUMN IF NOT EXISTS "group" text,
    ADD COLUMN IF NOT EXISTS feature_image_url text;

-- Add columns for Character Insights Panel
ALTER TABLE characters
    ADD COLUMN IF NOT EXISTS timeline_period text,
    ADD COLUMN IF NOT EXISTS historical_context text,
    ADD COLUMN IF NOT EXISTS geographic_location text,
    ADD COLUMN IF NOT EXISTS key_scripture_references text,
    ADD COLUMN IF NOT EXISTS theological_significance text,
    ADD COLUMN IF NOT EXISTS relationships jsonb DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS study_questions text;

-- Ensure visibility toggle exists (if missing)
ALTER TABLE characters
    ADD COLUMN IF NOT EXISTS is_visible boolean DEFAULT true;

-- Create indexes for faster filtering
CREATE INDEX IF NOT EXISTS idx_characters_testament ON characters(testament);
CREATE INDEX IF NOT EXISTS idx_characters_bible_book ON characters(bible_book);
CREATE INDEX IF NOT EXISTS idx_characters_group ON characters("group");

-- Simple updated_at trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $func$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_characters_updated ON characters;

CREATE TRIGGER trg_characters_updated
BEFORE UPDATE ON characters
FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
