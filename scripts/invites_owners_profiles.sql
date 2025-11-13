-- invites_owners_profiles.sql
-- Sets up the database structure for multi-tenant organization, invite codes, and user profiles
-- This script is idempotent and can be run multiple times

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create owners table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.owners (
  owner_slug TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create default owner if it doesn't exist
INSERT INTO public.owners (owner_slug, display_name, created_by)
SELECT 'default', 'Default Organization', id
FROM auth.users
ORDER BY created_at ASC
LIMIT 1
ON CONFLICT (owner_slug) DO NOTHING;

-- Create invites table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  owner_slug TEXT REFERENCES public.owners(owner_slug) NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  expires_at TIMESTAMPTZ,
  max_uses INTEGER DEFAULT 1 CHECK (max_uses > 0),
  use_count INTEGER DEFAULT 0 CHECK (use_count >= 0),
  used_at TIMESTAMPTZ,
  used_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create or update profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add columns to profiles table if they don't exist
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('superadmin', 'admin', 'user')) DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS owner_slug TEXT REFERENCES public.owners(owner_slug),
  ADD COLUMN IF NOT EXISTS referred_by_user_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS signup_source TEXT CHECK (signup_source IN ('public', 'owner_invite', 'admin_invite')) DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables
DROP TRIGGER IF EXISTS update_owners_updated_at ON public.owners;
CREATE TRIGGER update_owners_updated_at
BEFORE UPDATE ON public.owners
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_invites_updated_at ON public.invites;
CREATE TRIGGER update_invites_updated_at
BEFORE UPDATE ON public.invites
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Profiles select policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles insert policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;

DROP POLICY IF EXISTS "Owners select policy" ON public.owners;
DROP POLICY IF EXISTS "Owners insert policy" ON public.owners;
DROP POLICY IF EXISTS "Owners update policy" ON public.owners;

DROP POLICY IF EXISTS "Invites select policy" ON public.invites;
DROP POLICY IF EXISTS "Invites insert policy" ON public.invites;
DROP POLICY IF EXISTS "Invites update policy" ON public.invites;

-- Create RLS policies for profiles
-- SELECT: user can see own row; admins can see profiles with same owner_slug; superadmin can see all
CREATE POLICY "Profiles select policy" ON public.profiles
FOR SELECT USING (
  auth.uid() = id OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin' OR
  (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' AND
    (SELECT owner_slug FROM public.profiles WHERE id = auth.uid()) = owner_slug
  )
);

-- INSERT: authenticated user can insert own row only
CREATE POLICY "Profiles insert policy" ON public.profiles
FOR INSERT WITH CHECK (
  auth.uid() = id
);

-- UPDATE: user can update own row (excluding role/owner_slug changes), 
-- admins can update users within same owner_slug (excluding setting role='superadmin'), 
-- superadmin can update any row
CREATE POLICY "Profiles update policy" ON public.profiles
FOR UPDATE USING (
  auth.uid() = id OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin' OR
  (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' AND
    (SELECT owner_slug FROM public.profiles WHERE id = auth.uid()) = owner_slug AND
    NEW.role != 'superadmin'
  )
) WITH CHECK (
  auth.uid() = id OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin' OR
  (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' AND
    (SELECT owner_slug FROM public.profiles WHERE id = auth.uid()) = owner_slug AND
    NEW.role != 'superadmin'
  )
);

-- Create RLS policies for owners
-- SELECT: true (public readable)
CREATE POLICY "Owners select policy" ON public.owners
FOR SELECT USING (true);

-- INSERT/UPDATE: authenticated and either superadmin, or admin whose profiles.owner_slug equals NEW.owner_slug
CREATE POLICY "Owners insert policy" ON public.owners
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin' OR
    (
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' AND
      (SELECT owner_slug FROM public.profiles WHERE id = auth.uid()) = owner_slug
    )
  )
);

CREATE POLICY "Owners update policy" ON public.owners
FOR UPDATE USING (
  auth.role() = 'authenticated' AND (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin' OR
    (
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' AND
      (SELECT owner_slug FROM public.profiles WHERE id = auth.uid()) = owner_slug
    )
  )
) WITH CHECK (
  auth.role() = 'authenticated' AND (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin' OR
    (
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' AND
      (SELECT owner_slug FROM public.profiles WHERE id = auth.uid()) = owner_slug
    )
  )
);

-- Create RLS policies for invites
-- SELECT: superadmin sees all; admin sees invites with same owner_slug as their profile
CREATE POLICY "Invites select policy" ON public.invites
FOR SELECT USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin' OR
  (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' AND
    (SELECT owner_slug FROM public.profiles WHERE id = auth.uid()) = owner_slug
  )
);

-- INSERT: admin can create invites for their owner_slug; superadmin for any
CREATE POLICY "Invites insert policy" ON public.invites
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin' OR
    (
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' AND
      (SELECT owner_slug FROM public.profiles WHERE id = auth.uid()) = owner_slug
    )
  )
);

-- UPDATE: admin can update invites for their owner_slug; superadmin any
CREATE POLICY "Invites update policy" ON public.invites
FOR UPDATE USING (
  auth.role() = 'authenticated' AND (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin' OR
    (
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' AND
      (SELECT owner_slug FROM public.profiles WHERE id = auth.uid()) = owner_slug
    )
  )
) WITH CHECK (
  auth.role() = 'authenticated' AND (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin' OR
    (
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' AND
      (SELECT owner_slug FROM public.profiles WHERE id = auth.uid()) = owner_slug
    )
  )
);

-- Create redeem_invite RPC function
CREATE OR REPLACE FUNCTION public.redeem_invite(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite RECORD;
  v_user_id UUID;
  v_result JSONB;
  v_now TIMESTAMPTZ := now();
BEGIN
  -- Check if user is authenticated
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Authentication required');
  END IF;

  -- Find valid invite
  SELECT * INTO v_invite
  FROM public.invites
  WHERE code = p_code
    AND (expires_at IS NULL OR expires_at > v_now)
    AND (max_uses IS NULL OR use_count < max_uses);

  IF v_invite IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired invite code');
  END IF;

  -- Upsert profile if missing
  INSERT INTO public.profiles (id, email, role, owner_slug, referred_by_user_id, signup_source)
  SELECT 
    v_user_id,
    (SELECT email FROM auth.users WHERE id = v_user_id),
    CASE WHEN v_invite.role = 'admin' THEN 'admin' ELSE 'user' END,
    v_invite.owner_slug,
    v_invite.created_by,
    'admin_invite'
  ON CONFLICT (id) DO UPDATE SET
    role = CASE 
      WHEN v_invite.role = 'admin' THEN 'admin' 
      ELSE profiles.role -- Keep existing role if not being promoted to admin
    END,
    owner_slug = v_invite.owner_slug,
    referred_by_user_id = v_invite.created_by,
    signup_source = 'admin_invite',
    updated_at = v_now;

  -- Update invite usage
  UPDATE public.invites
  SET use_count = use_count + 1,
      used_at = CASE WHEN max_uses - use_count = 1 THEN v_now ELSE used_at END,
      used_by = CASE WHEN max_uses - use_count = 1 THEN v_user_id ELSE used_by END
  WHERE id = v_invite.id;

  -- Return success with role and owner_slug
  RETURN jsonb_build_object(
    'success', true,
    'role', CASE WHEN v_invite.role = 'admin' THEN 'admin' ELSE 'user' END,
    'owner_slug', v_invite.owner_slug
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Grant execute permission on redeem_invite function to authenticated users
GRANT EXECUTE ON FUNCTION public.redeem_invite TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_owner_slug_idx ON public.profiles (owner_slug);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles (role);
CREATE INDEX IF NOT EXISTS invites_code_idx ON public.invites (code);
CREATE INDEX IF NOT EXISTS invites_owner_slug_idx ON public.invites (owner_slug);

-- Add comment to tables for documentation
COMMENT ON TABLE public.owners IS 'Organizations or churches that own a set of characters and users';
COMMENT ON TABLE public.invites IS 'Invitation codes for adding users to organizations with specific roles';
COMMENT ON TABLE public.profiles IS 'Extended user profiles with role and organization information';
COMMENT ON FUNCTION public.redeem_invite IS 'Redeems an invite code to join an organization with a specific role';
