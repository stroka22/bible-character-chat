-- RPC function to get chat invite preview data
-- Uses SECURITY DEFINER to bypass RLS

CREATE OR REPLACE FUNCTION public.get_chat_invite_preview(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite record;
  v_chat record;
  v_character record;
  v_inviter record;
  v_participants jsonb := '[]'::jsonb;
  v_is_roundtable boolean := false;
  v_roundtable_topic text := null;
BEGIN
  -- Get the invite
  SELECT * INTO v_invite
  FROM chat_invites
  WHERE code = p_code
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Invite not found');
  END IF;
  
  -- Check validity
  IF v_invite.revoked THEN
    RETURN jsonb_build_object('error', 'This invite has been revoked');
  END IF;
  
  IF v_invite.expires_at IS NOT NULL AND v_invite.expires_at < now() THEN
    RETURN jsonb_build_object('error', 'This invite has expired');
  END IF;
  
  IF v_invite.max_uses IS NOT NULL AND v_invite.use_count >= v_invite.max_uses THEN
    RETURN jsonb_build_object('error', 'This invite has reached its maximum uses');
  END IF;
  
  -- Get the chat
  SELECT * INTO v_chat
  FROM chats
  WHERE id = v_invite.chat_id
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Conversation not found');
  END IF;
  
  -- Detect roundtable
  v_is_roundtable := v_chat.conversation_type = 'roundtable' OR 
    (v_chat.title IS NOT NULL AND v_chat.title LIKE 'Roundtable: %');
  
  IF v_is_roundtable AND v_chat.title LIKE 'Roundtable: %' THEN
    v_roundtable_topic := substring(v_chat.title FROM 13);
  END IF;
  
  -- Get character for regular chats
  IF NOT v_is_roundtable AND v_chat.character_id IS NOT NULL THEN
    SELECT id, name, avatar_url, short_biography INTO v_character
    FROM characters
    WHERE id = v_chat.character_id
    LIMIT 1;
  END IF;
  
  -- Get roundtable participants
  IF v_is_roundtable AND v_chat.participants IS NOT NULL THEN
    SELECT jsonb_agg(jsonb_build_object('id', c.id, 'name', c.name, 'avatar_url', c.avatar_url))
    INTO v_participants
    FROM characters c
    WHERE c.id = ANY(
      SELECT jsonb_array_elements_text(v_chat.participants)::uuid
    );
  END IF;
  
  -- Get inviter profile
  SELECT id, display_name INTO v_inviter
  FROM profiles
  WHERE id = v_invite.created_by
  LIMIT 1;
  
  RETURN jsonb_build_object(
    'inviteId', v_invite.id,
    'chatId', v_chat.id,
    'chatTitle', v_chat.title,
    'character', CASE WHEN v_character.id IS NOT NULL THEN
      jsonb_build_object('id', v_character.id, 'name', v_character.name, 'avatar_url', v_character.avatar_url, 'short_biography', v_character.short_biography)
    ELSE NULL END,
    'inviter', CASE WHEN v_inviter.id IS NOT NULL THEN
      jsonb_build_object('id', v_inviter.id, 'display_name', v_inviter.display_name)
    ELSE NULL END,
    'isRoundtable', v_is_roundtable,
    'roundtableTopic', v_roundtable_topic,
    'participants', COALESCE(v_participants, '[]'::jsonb)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_chat_invite_preview(text) TO anon, authenticated;
