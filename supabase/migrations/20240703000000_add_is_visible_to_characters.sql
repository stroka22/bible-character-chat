-- Add is_visible column to the characters table
-- This column controls whether a character is visible to regular users.
-- It defaults to TRUE for backward compatibility with existing characters.
ALTER TABLE characters
ADD COLUMN is_visible BOOLEAN DEFAULT TRUE;
