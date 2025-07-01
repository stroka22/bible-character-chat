-- Extend characters table with new fields for Admin Panel
-- Migration: 20250618_extend_characters

ALTER TABLE characters
ADD COLUMN feature_image_url TEXT,
ADD COLUMN short_biography TEXT,
ADD COLUMN bible_book TEXT,
ADD COLUMN scriptural_context TEXT,
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL;

-- Create trigger to automatically update updated_at for characters table
CREATE TRIGGER update_characters_updated_at
BEFORE UPDATE ON characters
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Optional: Update existing character data with default values for new columns
-- This is useful if you have existing data and want to ensure non-nullability
-- For now, we'll leave them nullable as per the prompt, but this is a common next step.
