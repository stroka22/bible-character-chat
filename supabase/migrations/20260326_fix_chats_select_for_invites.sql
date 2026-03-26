-- Allow anyone to select chats that have a valid (non-revoked, non-expired) invite
-- This is needed so invitees can preview the chat before joining

DO $$
BEGIN
  -- Drop if exists
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'chats' AND policyname = 'Chats select for invite preview'
  ) THEN
    DROP POLICY "Chats select for invite preview" ON public.chats;
  END IF;
END $$;

-- Create policy to allow selecting chats that have active invites
CREATE POLICY "Chats select for invite preview" ON public.chats
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_invites ci
      WHERE ci.chat_id = id
        AND ci.revoked = false
        AND (ci.expires_at IS NULL OR ci.expires_at > now())
        AND (ci.max_uses IS NULL OR ci.use_count < ci.max_uses)
    )
  );
