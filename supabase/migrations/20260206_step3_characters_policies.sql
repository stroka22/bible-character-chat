-- STEP 3: Update RLS policies on characters table
-- Run this AFTER step 2

-- Drop existing policies
DROP POLICY IF EXISTS "Characters are viewable by everyone" ON characters;
DROP POLICY IF EXISTS "Admins can insert characters" ON characters;
DROP POLICY IF EXISTS "Admins can update characters" ON characters;
DROP POLICY IF EXISTS "Admins can delete characters" ON characters;
DROP POLICY IF EXISTS "Users can insert characters for their org" ON characters;
DROP POLICY IF EXISTS "Users can update characters for their org" ON characters;
DROP POLICY IF EXISTS "Users can delete their org characters" ON characters;

-- Everyone can view characters (app filters by owner_slug)
CREATE POLICY "Characters are viewable by everyone" ON characters
  FOR SELECT USING (true);

-- Admins can insert characters for their own org
CREATE POLICY "Users can insert characters for their org" ON characters
  FOR INSERT WITH CHECK (
    (
      public.current_user_role() IN ('admin', 'superadmin')
      AND owner_slug IS NOT DISTINCT FROM COALESCE(public.current_user_owner_slug(), 'default')
    )
    OR public.current_user_role() = 'superadmin'
  );

-- Admins can update characters for their own org
CREATE POLICY "Users can update characters for their org" ON characters
  FOR UPDATE USING (
    (
      public.current_user_role() IN ('admin', 'superadmin')
      AND owner_slug IS NOT DISTINCT FROM COALESCE(public.current_user_owner_slug(), 'default')
    )
    OR public.current_user_role() = 'superadmin'
  );

-- Admins can delete characters for their own org (not default)
CREATE POLICY "Users can delete their org characters" ON characters
  FOR DELETE USING (
    (
      public.current_user_role() IN ('admin', 'superadmin')
      AND owner_slug IS NOT DISTINCT FROM COALESCE(public.current_user_owner_slug(), 'default')
      AND owner_slug != 'default'
    )
    OR public.current_user_role() = 'superadmin'
  );
