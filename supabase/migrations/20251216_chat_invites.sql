-- Chat Invites: schema, policies, helper functions, and tier_settings invite controls
-- Date: 2025-12-16

-- Ensure helper updated_at trigger exists (defined in earlier migrations)
-- create or replace function public.set_updated_at() ... assumed present

-- 1) tier_settings: create if missing, then add invite_settings JSONB
create table if not exists public.tier_settings (
  owner_slug text primary key,
  free_message_limit integer not null default 5,
  free_character_limit integer not null default 10,
  free_characters jsonb not null default '[]'::jsonb,
  free_character_names jsonb not null default '[]'::jsonb,
  premium_roundtable_gates jsonb not null default '{}'::jsonb,
  premium_study_ids jsonb not null default '[]'::jsonb,
  invite_settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Keep updated_at fresh
drop trigger if exists tier_settings_set_updated_at on public.tier_settings;
create trigger tier_settings_set_updated_at
before update on public.tier_settings
for each row execute function public.set_updated_at();

alter table public.tier_settings enable row level security;

-- Read for everyone (anon + authenticated)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tier_settings' AND policyname = 'tier_settings_select_all'
  ) THEN
    create policy tier_settings_select_all on public.tier_settings
      for select using ( true );
  END IF;
END $$;

-- Insert/update restricted to admins or superadmin
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tier_settings' AND policyname = 'tier_settings_insert_admin'
  ) THEN
    create policy tier_settings_insert_admin on public.tier_settings
      for insert to authenticated
      with check (
        public.current_user_role() in ('admin','superadmin')
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tier_settings' AND policyname = 'tier_settings_update_admin'
  ) THEN
    create policy tier_settings_update_admin on public.tier_settings
      for update to authenticated
      using (
        public.current_user_role() in ('admin','superadmin')
      )
      with check (
        public.current_user_role() in ('admin','superadmin')
      );
  END IF;
END $$;

-- 2) Helper function to detect participant membership in chats.participants JSONB
create or replace function public.chat_has_participant(p_chat_id uuid, p_user_id uuid)
returns boolean
language plpgsql
stable
as $$
declare
  v boolean;
begin
  select exists (
    select 1
    from public.chats c,
         lateral jsonb_array_elements(coalesce(c.participants, '[]'::jsonb)) as e
    where c.id = p_chat_id
      and ((e->>'id')::uuid is not null and (e->>'id')::uuid = p_user_id)
  ) into v;
  return coalesce(v, false);
end;
$$;

-- 3) Extend RLS: allow participants to read chats and read/insert chat_messages
-- Chats: SELECT when owner OR participant
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'chats' AND policyname = 'Chats viewable by participants'
  ) THEN
    create policy "Chats viewable by participants" on public.chats
      for select using (
        user_id = auth.uid() OR public.chat_has_participant(id, auth.uid())
      );
  END IF;
END $$;

-- Chat messages: SELECT when owner OR participant in parent chat
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'chat_messages' AND policyname = 'Messages readable by participants'
  ) THEN
    create policy "Messages readable by participants" on public.chat_messages
      for select using (
        exists (
          select 1 from public.chats c
          where c.id = chat_messages.chat_id
            and (c.user_id = auth.uid() or public.chat_has_participant(c.id, auth.uid()))
        )
      );
  END IF;
END $$;

-- Chat messages: INSERT when owner OR participant in parent chat
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'chat_messages' AND policyname = 'Messages insertable by participants'
  ) THEN
    create policy "Messages insertable by participants" on public.chat_messages
      for insert with check (
        exists (
          select 1 from public.chats c
          where c.id = chat_messages.chat_id
            and (c.user_id = auth.uid() or public.chat_has_participant(c.id, auth.uid()))
        )
      );
  END IF;
END $$;

-- 4) Chat Invites table
create table if not exists public.chat_invites (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  chat_id uuid not null references public.chats(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz,
  max_uses integer,
  use_count integer not null default 0,
  revoked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists chat_invites_set_updated_at on public.chat_invites;
create trigger chat_invites_set_updated_at
before update on public.chat_invites
for each row execute function public.set_updated_at();

alter table public.chat_invites enable row level security;

-- Only owners of the chat can manage invites
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'chat_invites' AND policyname = 'Chat invites select by owner'
  ) THEN
    create policy "Chat invites select by owner" on public.chat_invites
      for select to authenticated using (
        exists (
          select 1 from public.chats c where c.id = chat_id and c.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'chat_invites' AND policyname = 'Chat invites insert by owner'
  ) THEN
    create policy "Chat invites insert by owner" on public.chat_invites
      for insert to authenticated with check (
        exists (
          select 1 from public.chats c where c.id = chat_id and c.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'chat_invites' AND policyname = 'Chat invites update by owner'
  ) THEN
    create policy "Chat invites update by owner" on public.chat_invites
      for update to authenticated using (
        exists (
          select 1 from public.chats c where c.id = chat_id and c.user_id = auth.uid()
        )
      ) with check (
        exists (
          select 1 from public.chats c where c.id = chat_id and c.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'chat_invites' AND policyname = 'Chat invites delete by owner'
  ) THEN
    create policy "Chat invites delete by owner" on public.chat_invites
      for delete to authenticated using (
        exists (
          select 1 from public.chats c where c.id = chat_id and c.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- 5) RPC: redeem_chat_invite
-- Adds the caller to chats.participants (as object {id, name}) when valid
-- Enforces org-tier invite_settings limits
create or replace function public.redeem_chat_invite(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_inv record;
  v_chat record;
  v_owner_profile record;
  v_owner_slug text;
  v_tier jsonb;
  v_invite jsonb;
  v_participants jsonb := '[]'::jsonb;
  v_already boolean := false;
  v_is_owner boolean := false;
  v_is_premium boolean := false; -- simple flag: treat premium if owner has any active status; fallback false
  v_max_total integer := 11; -- default
  v_exp_days integer := 30; -- default
  v_multiuse boolean := true; -- default
  v_now timestamptz := now();
  v_name text;
  v_new_count integer;
  v_total_after integer;
  v_resp jsonb;
begin
  if v_uid is null then
    return jsonb_build_object('success', false, 'error', 'Not authenticated');
  end if;

  select * into v_inv
  from public.chat_invites i
  where i.code = p_code and i.revoked = false
    and (i.expires_at is null or i.expires_at > v_now)
    and (i.max_uses is null or i.use_count < i.max_uses)
  limit 1;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Code invalid or expired');
  end if;

  select * into v_chat from public.chats c where c.id = v_inv.chat_id limit 1;
  if not found then
    return jsonb_build_object('success', false, 'error', 'Chat not found');
  end if;

  v_is_owner := v_chat.user_id = v_uid;
  if v_is_owner then
    -- owner redeeming: simply return success
    return jsonb_build_object('success', true, 'chat_id', v_chat.id);
  end if;

  -- owner profile (for owner_slug)
  select p.* into v_owner_profile from public.profiles p where p.id = v_chat.user_id limit 1;
  v_owner_slug := coalesce(v_owner_profile.owner_slug, 'default');

  -- read tier settings; defaults in case missing
  select ts.invite_settings into v_tier from public.tier_settings ts where ts.owner_slug = v_owner_slug;
  if v_tier is null then v_tier := '{}'::jsonb; end if;

  -- Determine premium/free lane; naive: use owner role or presence of stripe ids
  v_is_premium := coalesce((v_owner_profile.premium_override is true), false);

  -- compute limits
  v_max_total := coalesce((v_tier->>'max_chat_participants_'||case when v_is_premium then 'premium' else 'free' end)::int,
                          case when v_is_premium then 11 else 3 end);
  v_exp_days := coalesce((v_tier->>'invite_expiration_days_'||case when v_is_premium then 'premium' else 'free' end)::int,
                         case when v_is_premium then 30 else 7 end);
  v_multiuse := coalesce((v_tier->>'invite_multiuse_'||case when v_is_premium then 'premium' else 'free' end)::boolean,
                         case when v_is_premium then true else false end);

  -- participants array
  v_participants := coalesce(v_chat.participants, '[]'::jsonb);
  v_already := exists (
    select 1 from jsonb_array_elements(v_participants) as e
    where (e->>'id')::uuid = v_uid
  );
  if v_already then
    return jsonb_build_object('success', true, 'chat_id', v_chat.id);
  end if;

  -- total including owner
  v_total_after := (select coalesce(jsonb_array_length(v_participants),0)) + 1; -- + owner
  if v_total_after + 1 > v_max_total then
    return jsonb_build_object('success', false, 'error', 'Participant limit reached');
  end if;

  -- append participant object {id, name}
  select coalesce(p.display_name, p.email, left(cast(v_uid as text), 8)) into v_name from public.profiles p where p.id = v_uid;
  v_participants := v_participants || jsonb_build_array(jsonb_build_object('id', cast(v_uid as text), 'name', v_name));

  -- update chat
  update public.chats set participants = v_participants, updated_at = v_now where id = v_chat.id;

  -- increment uses
  v_new_count := v_inv.use_count + 1;
  update public.chat_invites set use_count = v_new_count where id = v_inv.id;

  -- if single-use, optionally revoke when reached
  if v_inv.max_uses is not null and v_new_count >= v_inv.max_uses then
    update public.chat_invites set revoked = true where id = v_inv.id;
  end if;

  v_resp := jsonb_build_object('success', true, 'chat_id', v_chat.id);
  return v_resp;
end;
$$;

grant execute on function public.redeem_chat_invite(text) to anon, authenticated;
