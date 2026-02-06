-- Add owner_slug to characters table for org-specific customizations
-- Uses copy-on-write pattern: orgs see 'default' characters until they edit them

-- Add owner_slug column (default to 'default' for existing characters)
ALTER TABLE characters ADD COLUMN IF NOT EXISTS owner_slug TEXT NOT NULL DEFAULT 'default';

-- Add source_character_id to track which character this was copied from
ALTER TABLE characters ADD COLUMN IF NOT EXISTS source_character_id UUID REFERENCES characters(id) ON DELETE SET NULL;

-- Drop the old unique constraint on name only
ALTER TABLE characters DROP CONSTRAINT IF EXISTS unique_character_name;

-- Add new unique constraint: name must be unique within each org
ALTER TABLE characters ADD CONSTRAINT unique_character_name_per_org UNIQUE (owner_slug, name);

-- Index for faster org-based lookups
CREATE INDEX IF NOT EXISTS idx_characters_owner_slug ON characters(owner_slug);

-- Index for finding source characters
CREATE INDEX IF NOT EXISTS idx_characters_source ON characters(source_character_id);

-- Update RLS policies to allow org admins to manage their characters

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Characters are viewable by everyone" ON characters;
DROP POLICY IF EXISTS "Admins can insert characters" ON characters;
DROP POLICY IF EXISTS "Admins can update characters" ON characters;
DROP POLICY IF EXISTS "Admins can delete characters" ON characters;

-- Everyone can view characters (app filters by owner_slug)
CREATE POLICY "Characters are viewable by everyone" ON characters
  FOR SELECT USING (true);

-- Users can insert characters for their own org (admins only)
CREATE POLICY "Users can insert characters for their org" ON characters
  FOR INSERT WITH CHECK (
    (
      public.current_user_role() IN ('admin', 'superadmin')
      AND owner_slug IS NOT DISTINCT FROM COALESCE(public.current_user_owner_slug(), 'default')
    )
    OR public.current_user_role() = 'superadmin'
  );

-- Users can update characters for their own org (admins only)
CREATE POLICY "Users can update characters for their org" ON characters
  FOR UPDATE USING (
    (
      public.current_user_role() IN ('admin', 'superadmin')
      AND owner_slug IS NOT DISTINCT FROM COALESCE(public.current_user_owner_slug(), 'default')
    )
    OR public.current_user_role() = 'superadmin'
  );

-- Users can delete characters for their own org (not default, admins only)
CREATE POLICY "Users can delete their org characters" ON characters
  FOR DELETE USING (
    (
      public.current_user_role() IN ('admin', 'superadmin')
      AND owner_slug IS NOT DISTINCT FROM COALESCE(public.current_user_owner_slug(), 'default')
      AND owner_slug != 'default'
    )
    OR public.current_user_role() = 'superadmin'
  );
