-- STEP 1: Add columns to characters table
-- Run this FIRST, then run step 2

-- Add owner_slug column (default to 'default' for existing characters)
ALTER TABLE characters ADD COLUMN IF NOT EXISTS owner_slug TEXT NOT NULL DEFAULT 'default';

-- Add source_character_id to track which character this was copied from
ALTER TABLE characters ADD COLUMN IF NOT EXISTS source_character_id UUID;

-- Index for faster org-based lookups
CREATE INDEX IF NOT EXISTS idx_characters_owner_slug ON characters(owner_slug);

-- Index for finding source characters
CREATE INDEX IF NOT EXISTS idx_characters_source ON characters(source_character_id);
