-- =================================================================
-- Bible Studies RLS Policies
-- =================================================================
-- Defines Row Level Security policies for Bible Studies feature tables
-- Allows admins and superadmins to manage studies, while allowing all users to read

-- =================================================================
-- bible_studies table policies
-- =================================================================
DROP POLICY IF EXISTS "bible_studies_select_policy" ON bible_studies;
DROP POLICY IF EXISTS "bible_studies_insert_policy" ON bible_studies;
DROP POLICY IF EXISTS "bible_studies_update_policy" ON bible_studies;
DROP POLICY IF EXISTS "bible_studies_delete_policy" ON bible_studies;

-- SELECT: Allow any user (including anonymous) to read studies
CREATE POLICY "bible_studies_select_policy" ON bible_studies
  FOR SELECT
  USING (true);

-- INSERT: Only admin or superadmin can insert new studies
CREATE POLICY "bible_studies_insert_policy" ON bible_studies
  FOR INSERT
  WITH CHECK (
    coalesce((auth.jwt() ->> 'role'), '') IN ('admin', 'superadmin')
  );

-- UPDATE: Only admin or superadmin can update studies
CREATE POLICY "bible_studies_update_policy" ON bible_studies
  FOR UPDATE
  USING (
    coalesce((auth.jwt() ->> 'role'), '') IN ('admin', 'superadmin')
  );

-- DELETE: Only superadmin can delete studies (stricter)
CREATE POLICY "bible_studies_delete_policy" ON bible_studies
  FOR DELETE
  USING (
    coalesce((auth.jwt() ->> 'role'), '') = 'superadmin'
  );

-- =================================================================
-- bible_study_lessons table policies
-- =================================================================
DROP POLICY IF EXISTS "bible_study_lessons_select_policy" ON bible_study_lessons;
DROP POLICY IF EXISTS "bible_study_lessons_insert_policy" ON bible_study_lessons;
DROP POLICY IF EXISTS "bible_study_lessons_update_policy" ON bible_study_lessons;
DROP POLICY IF EXISTS "bible_study_lessons_delete_policy" ON bible_study_lessons;

-- SELECT: Allow any user (including anonymous) to read lessons
CREATE POLICY "bible_study_lessons_select_policy" ON bible_study_lessons
  FOR SELECT
  USING (true);

-- INSERT: Only admin or superadmin can insert new lessons
CREATE POLICY "bible_study_lessons_insert_policy" ON bible_study_lessons
  FOR INSERT
  WITH CHECK (
    coalesce((auth.jwt() ->> 'role'), '') IN ('admin', 'superadmin')
  );

-- UPDATE: Only admin or superadmin can update lessons
CREATE POLICY "bible_study_lessons_update_policy" ON bible_study_lessons
  FOR UPDATE
  USING (
    coalesce((auth.jwt() ->> 'role'), '') IN ('admin', 'superadmin')
  );

-- DELETE: Only superadmin can delete lessons (stricter)
CREATE POLICY "bible_study_lessons_delete_policy" ON bible_study_lessons
  FOR DELETE
  USING (
    coalesce((auth.jwt() ->> 'role'), '') = 'superadmin'
  );

-- =================================================================
-- user_study_progress table policies
-- =================================================================
DROP POLICY IF EXISTS "user_study_progress_select_policy" ON user_study_progress;
DROP POLICY IF EXISTS "user_study_progress_insert_policy" ON user_study_progress;
DROP POLICY IF EXISTS "user_study_progress_update_policy" ON user_study_progress;
DROP POLICY IF EXISTS "user_study_progress_delete_policy" ON user_study_progress;

-- SELECT: Users can only see their own progress, admins can see all
CREATE POLICY "user_study_progress_select_policy" ON user_study_progress
  FOR SELECT
  USING (
    (auth.uid() = user_id) OR 
    coalesce((auth.jwt() ->> 'role'), '') IN ('admin', 'superadmin')
  );

-- INSERT: Users can only insert their own progress
CREATE POLICY "user_study_progress_insert_policy" ON user_study_progress
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
  );

-- UPDATE: Users can only update their own progress, admins can update any
CREATE POLICY "user_study_progress_update_policy" ON user_study_progress
  FOR UPDATE
  USING (
    (auth.uid() = user_id) OR 
    coalesce((auth.jwt() ->> 'role'), '') IN ('admin', 'superadmin')
  );

-- DELETE: Users can only delete their own progress, admins can delete any
CREATE POLICY "user_study_progress_delete_policy" ON user_study_progress
  FOR DELETE
  USING (
    (auth.uid() = user_id) OR 
    coalesce((auth.jwt() ->> 'role'), '') IN ('admin', 'superadmin')
  );

-- =================================================================
-- ai_outlines table policies (admin-only)
-- =================================================================
DROP POLICY IF EXISTS "ai_outlines_select_policy" ON ai_outlines;
DROP POLICY IF EXISTS "ai_outlines_insert_policy" ON ai_outlines;
DROP POLICY IF EXISTS "ai_outlines_update_policy" ON ai_outlines;
DROP POLICY IF EXISTS "ai_outlines_delete_policy" ON ai_outlines;

-- SELECT: Only admin or superadmin can view outlines
CREATE POLICY "ai_outlines_select_policy" ON ai_outlines
  FOR SELECT
  USING (
    coalesce((auth.jwt() ->> 'role'), '') IN ('admin', 'superadmin')
  );

-- INSERT: Only admin or superadmin can create outlines
CREATE POLICY "ai_outlines_insert_policy" ON ai_outlines
  FOR INSERT
  WITH CHECK (
    coalesce((auth.jwt() ->> 'role'), '') IN ('admin', 'superadmin')
  );

-- UPDATE: Only admin or superadmin can update outlines
CREATE POLICY "ai_outlines_update_policy" ON ai_outlines
  FOR UPDATE
  USING (
    coalesce((auth.jwt() ->> 'role'), '') IN ('admin', 'superadmin')
  );

-- DELETE: Only superadmin can delete outlines (stricter)
CREATE POLICY "ai_outlines_delete_policy" ON ai_outlines
  FOR DELETE
  USING (
    coalesce((auth.jwt() ->> 'role'), '') = 'superadmin'
  );

-- Add explanatory comments
COMMENT ON TABLE bible_studies IS 'Bible studies with RLS: read=all, write=admin+superadmin, delete=superadmin';
COMMENT ON TABLE bible_study_lessons IS 'Bible study lessons with RLS: read=all, write=admin+superadmin, delete=superadmin';
COMMENT ON TABLE user_study_progress IS 'User study progress with RLS: read/write=own or admin, delete=own or admin';
COMMENT ON TABLE ai_outlines IS 'AI-generated study outlines with RLS: all operations=admin+superadmin only';
