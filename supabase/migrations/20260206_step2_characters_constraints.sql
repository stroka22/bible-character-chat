-- STEP 2: Update constraints on characters table
-- Run this AFTER step 1

-- Drop the old unique constraint on name only (if exists)
ALTER TABLE characters DROP CONSTRAINT IF EXISTS unique_character_name;

-- Add new unique constraint: name must be unique within each org
ALTER TABLE characters ADD CONSTRAINT unique_character_name_per_org UNIQUE (owner_slug, name);
