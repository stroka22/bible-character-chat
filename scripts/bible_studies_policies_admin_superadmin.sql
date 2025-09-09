-- =================================================================
-- Bible Studies RLS Policies (org-scoped admin, superadmin override)
-- =================================================================
-- Uses helper functions:
--   public.current_user_role()        -> 'user' | 'admin' | 'superadmin' | ...
--   public.current_user_owner_slug()  -> text owner slug for current user
--
-- Admins: limited to their owner_slug
-- Superadmins: full access
-- Public SELECT remains open for studies/lessons

-- Enable RLS defensively (safe if already enabled)
ALTER TABLE bible_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE bible_study_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_study_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_outlines ENABLE ROW LEVEL SECURITY;

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

-- INSERT: Admins within their org or superadmin
CREATE POLICY "bible_studies_insert_policy" ON bible_studies
  FOR INSERT
  WITH CHECK (
    public.current_user_role() IN ('admin','superadmin')
    AND (
      public.current_user_role() = 'superadmin' OR
      owner_slug IS NOT DISTINCT FROM public.current_user_owner_slug()
    )
  );

-- UPDATE: Admins within their org or superadmin
CREATE POLICY "bible_studies_update_policy" ON bible_studies
  FOR UPDATE
  USING (
    public.current_user_role() IN ('admin','superadmin')
    AND (
      public.current_user_role() = 'superadmin' OR
      owner_slug IS NOT DISTINCT FROM public.current_user_owner_slug()
    )
  )
  WITH CHECK (
    public.current_user_role() IN ('admin','superadmin')
    AND (
      public.current_user_role() = 'superadmin' OR
      owner_slug IS NOT DISTINCT FROM public.current_user_owner_slug()
    )
  );

-- DELETE: Admins can delete within their org; superadmin can delete any
CREATE POLICY "bible_studies_delete_policy" ON bible_studies
  FOR DELETE
  USING (
    public.current_user_role() = 'superadmin' OR (
      public.current_user_role() = 'admin' AND
      owner_slug IS NOT DISTINCT FROM public.current_user_owner_slug()
    )
  );

-- =================================================================
-- bible_study_lessons table policies (inherit permissions from parent study)
-- =================================================================
DROP POLICY IF EXISTS "bible_study_lessons_select_policy" ON bible_study_lessons;
DROP POLICY IF EXISTS "bible_study_lessons_insert_policy" ON bible_study_lessons;
DROP POLICY IF EXISTS "bible_study_lessons_update_policy" ON bible_study_lessons;
DROP POLICY IF EXISTS "bible_study_lessons_delete_policy" ON bible_study_lessons;

-- SELECT: Allow any user (including anonymous) to read lessons
CREATE POLICY "bible_study_lessons_select_policy" ON bible_study_lessons
  FOR SELECT
  USING (true);

-- INSERT: Admins within their org or superadmin, based on parent study
CREATE POLICY "bible_study_lessons_insert_policy" ON bible_study_lessons
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM bible_studies s
      WHERE s.id = bible_study_lessons.study_id
        AND (
          public.current_user_role() = 'superadmin' OR (
            public.current_user_role() = 'admin' AND
            s.owner_slug IS NOT DISTINCT FROM public.current_user_owner_slug()
          )
        )
    )
  );

-- UPDATE: Admins within their org or superadmin, based on parent study
CREATE POLICY "bible_study_lessons_update_policy" ON bible_study_lessons
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM bible_studies s
      WHERE s.id = bible_study_lessons.study_id
        AND (
          public.current_user_role() = 'superadmin' OR (
            public.current_user_role() = 'admin' AND
            s.owner_slug IS NOT DISTINCT FROM public.current_user_owner_slug()
          )
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM bible_studies s
      WHERE s.id = bible_study_lessons.study_id
        AND (
          public.current_user_role() = 'superadmin' OR (
            public.current_user_role() = 'admin' AND
            s.owner_slug IS NOT DISTINCT FROM public.current_user_owner_slug()
          )
        )
    )
  );

-- DELETE: Admins within their org or superadmin, based on parent study
CREATE POLICY "bible_study_lessons_delete_policy" ON bible_study_lessons
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM bible_studies s
      WHERE s.id = bible_study_lessons.study_id
        AND (
          public.current_user_role() = 'superadmin' OR (
            public.current_user_role() = 'admin' AND
            s.owner_slug IS NOT DISTINCT FROM public.current_user_owner_slug()
          )
        )
    )
  );

-- =================================================================
-- user_study_progress table policies
-- =================================================================
DROP POLICY IF EXISTS "user_study_progress_select_policy" ON user_study_progress;
DROP POLICY IF EXISTS "user_study_progress_insert_policy" ON user_study_progress;
DROP POLICY IF EXISTS "user_study_progress_update_policy" ON user_study_progress;
DROP POLICY IF EXISTS "user_study_progress_delete_policy" ON user_study_progress;

-- SELECT: Users can only see their own progress, admins/superadmins can see all
CREATE POLICY "user_study_progress_select_policy" ON user_study_progress
  FOR SELECT
  USING (
    (auth.uid() = user_id) OR 
    public.current_user_role() IN ('admin', 'superadmin')
  );

-- INSERT: Users can only insert their own progress
CREATE POLICY "user_study_progress_insert_policy" ON user_study_progress
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
  );

-- UPDATE: Users can only update their own progress, admins/superadmins can update any
CREATE POLICY "user_study_progress_update_policy" ON user_study_progress
  FOR UPDATE
  USING (
    (auth.uid() = user_id) OR 
    public.current_user_role() IN ('admin', 'superadmin')
  );

-- DELETE: Users can only delete their own progress, admins/superadmins can delete any
CREATE POLICY "user_study_progress_delete_policy" ON user_study_progress
  FOR DELETE
  USING (
    (auth.uid() = user_id) OR 
    public.current_user_role() IN ('admin', 'superadmin')
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
    public.current_user_role() IN ('admin', 'superadmin')
  );

-- INSERT: Only admin or superadmin can create outlines
CREATE POLICY "ai_outlines_insert_policy" ON ai_outlines
  FOR INSERT
  WITH CHECK (
    public.current_user_role() IN ('admin', 'superadmin')
  );

-- UPDATE: Only admin or superadmin can update outlines
CREATE POLICY "ai_outlines_update_policy" ON ai_outlines
  FOR UPDATE
  USING (
    public.current_user_role() IN ('admin', 'superadmin')
  );

-- DELETE: Admins and superadmins (mirroring studies delete behavior is optional; keep strict if desired)
CREATE POLICY "ai_outlines_delete_policy" ON ai_outlines
  FOR DELETE
  USING (
    public.current_user_role() IN ('admin', 'superadmin')
  );

-- Add explanatory comments
COMMENT ON TABLE bible_studies IS 'Bible studies with RLS: read=all, write=admin(superadmin override), delete=admin within org or superadmin';
COMMENT ON TABLE bible_study_lessons IS 'Lessons with RLS: read=all, write/delete=admin within org or superadmin via parent study';
COMMENT ON TABLE user_study_progress IS 'User study progress with RLS: read/write=own or admin/superadmin';
COMMENT ON TABLE ai_outlines IS 'AI-generated study outlines with RLS: admin/superadmin operations only';
