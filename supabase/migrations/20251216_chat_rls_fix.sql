-- Fix RLS recursion: avoid selecting from chats inside a function used by chats RLS
-- Creates a JSON-based helper and rewires policies to use it

-- 1) Helper: check membership from provided participants JSONB (no table reads)
create or replace function public.chat_has_participant_json(p_participants jsonb, p_user_id uuid)
returns boolean
language sql
immutable
as $$
  select exists (
    select 1
    from jsonb_array_elements(coalesce(p_participants, '[]'::jsonb)) as e
    where nullif(e->>'id','')::uuid = p_user_id
  );
$$;

-- 2) Update chats SELECT policy to use the JSON helper
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'chats' AND policyname = 'Chats viewable by participants'
  ) THEN
    drop policy "Chats viewable by participants" on public.chats;
  END IF;
END $$;

create policy "Chats viewable by participants" on public.chats
  for select using (
    user_id = auth.uid() OR public.chat_has_participant_json(participants, auth.uid())
  );

-- 3) Update chat_messages policies to reference participants JSON directly
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'chat_messages' AND policyname = 'Messages readable by participants'
  ) THEN
    drop policy "Messages readable by participants" on public.chat_messages;
  END IF;
END $$;

create policy "Messages readable by participants" on public.chat_messages
  for select using (
    exists (
      select 1 from public.chats c
      where c.id = chat_messages.chat_id
        and (c.user_id = auth.uid() or public.chat_has_participant_json(c.participants, auth.uid()))
    )
  );

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'chat_messages' AND policyname = 'Messages insertable by participants'
  ) THEN
    drop policy "Messages insertable by participants" on public.chat_messages;
  END IF;
END $$;

create policy "Messages insertable by participants" on public.chat_messages
  for insert with check (
    exists (
      select 1 from public.chats c
      where c.id = chat_messages.chat_id
        and (c.user_id = auth.uid() or public.chat_has_participant_json(c.participants, auth.uid()))
    )
  );

-- 4) Optional: keep old function name but rewire to non-recursive behavior (for any callers)
create or replace function public.chat_has_participant(p_chat_id uuid, p_user_id uuid)
returns boolean
language sql
stable
as $$
  select public.chat_has_participant_json((select participants from public.chats where id = p_chat_id), p_user_id);
$$;

