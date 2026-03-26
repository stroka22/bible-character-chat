-- Allow anyone to select chat_invites by code for preview purposes
-- This is needed so invitees can view the invite before redeeming

DO $$
BEGIN
  -- Check if policy exists and drop it if so
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'chat_invites' AND policyname = 'Chat invites select by code'
  ) THEN
    DROP POLICY "Chat invites select by code" ON public.chat_invites;
  END IF;
END $$;

-- Create policy to allow authenticated users to select invites by code
CREATE POLICY "Chat invites select by code" ON public.chat_invites
  FOR SELECT TO authenticated
  USING (true);

-- Also allow anon to view invites (for preview before login)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'chat_invites' AND policyname = 'Chat invites select by anon'
  ) THEN
    DROP POLICY "Chat invites select by anon" ON public.chat_invites;
  END IF;
END $$;

CREATE POLICY "Chat invites select by anon" ON public.chat_invites
  FOR SELECT TO anon
  USING (true);
