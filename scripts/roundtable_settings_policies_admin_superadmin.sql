-- =================================================================
-- Roundtable Settings RLS Policies
-- =================================================================
-- Defines Row Level Security policies for the roundtable_settings table
-- Allows admins and superadmins to manage settings, while allowing all users to read

-- Drop existing policies if they exist (to avoid conflicts on re-run)
DROP POLICY IF EXISTS "roundtable_settings_select_policy" ON roundtable_settings;
DROP POLICY IF EXISTS "roundtable_settings_insert_policy" ON roundtable_settings;
DROP POLICY IF EXISTS "roundtable_settings_update_policy" ON roundtable_settings;
DROP POLICY IF EXISTS "roundtable_settings_delete_policy" ON roundtable_settings;

-- SELECT: Allow any user (including anonymous) to read settings
CREATE POLICY "roundtable_settings_select_policy" ON roundtable_settings
  FOR SELECT
  USING (true);

-- INSERT: Only admin or superadmin can insert new settings
CREATE POLICY "roundtable_settings_insert_policy" ON roundtable_settings
  FOR INSERT
  WITH CHECK (
    coalesce((auth.jwt() ->> 'role'), '') IN ('admin', 'superadmin')
  );

-- UPDATE: Only admin or superadmin can update settings
CREATE POLICY "roundtable_settings_update_policy" ON roundtable_settings
  FOR UPDATE
  USING (
    coalesce((auth.jwt() ->> 'role'), '') IN ('admin', 'superadmin')
  );

-- DELETE: Only superadmin can delete settings (stricter)
CREATE POLICY "roundtable_settings_delete_policy" ON roundtable_settings
  FOR DELETE
  USING (
    coalesce((auth.jwt() ->> 'role'), '') = 'superadmin'
  );

-- Add explanatory comment
COMMENT ON TABLE roundtable_settings IS 'Table for storing roundtable configuration with RLS: read=all, write=admin+superadmin, delete=superadmin';
