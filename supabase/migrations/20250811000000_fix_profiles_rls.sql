-- Migration: Fix profiles RLS policies and add superadmin role
-- This migration:
-- 1. Ensures 'superadmin' exists on enum user_role
-- 2. Aligns profile for the superadmin email
-- 3. Creates helper functions with SECURITY DEFINER
-- 4. Enables RLS and sets select policies on public.profiles

-- 1) Ensure 'superadmin' exists on enum user_role
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'user_role' AND e.enumlabel = 'superadmin'
  ) THEN
    ALTER TYPE public.user_role ADD VALUE 'superadmin';
  END IF;
END $$;

-- 2) Align profile for the superadmin email
DO $$
DECLARE v_uid uuid;
BEGIN
  SELECT id INTO v_uid FROM auth.users WHERE email = 'stroka22@yahoo.com';
  IF v_uid IS NULL THEN
    RAISE NOTICE 'Auth user not found for email';
  ELSE
    INSERT INTO public.profiles (id, email, role)
    VALUES (v_uid, 'stroka22@yahoo.com', 'superadmin')
    ON CONFLICT (id) DO UPDATE
      SET email = EXCLUDED.email,
          role = 'superadmin';
    UPDATE public.profiles p
      SET id = v_uid
    WHERE lower(p.email) = lower('stroka22@yahoo.com') AND p.id <> v_uid;
  END IF;
END $$;

-- 3) Create helper functions with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid;
  r text;
  jwt_email text;
BEGIN
  uid := auth.uid();
  IF uid IS NOT NULL THEN
    SELECT role::text INTO r FROM public.profiles WHERE id = uid LIMIT 1;
    IF r IS NOT NULL THEN RETURN r; END IF;
  END IF;
  SELECT (current_setting('request.jwt.claims', true)::jsonb ->> 'email') INTO jwt_email;
  IF jwt_email IS NOT NULL THEN
    SELECT role::text INTO r FROM public.profiles WHERE lower(email) = lower(jwt_email) LIMIT 1;
  END IF;
  RETURN r;
END$$;

CREATE OR REPLACE FUNCTION public.current_user_owner_slug()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid;
  v text;
  jwt_email text;
BEGIN
  uid := auth.uid();
  IF uid IS NOT NULL THEN
    SELECT owner_slug INTO v FROM public.profiles WHERE id = uid LIMIT 1;
    IF v IS NOT NULL THEN RETURN v; END IF;
  END IF;
  SELECT (current_setting('request.jwt.claims', true)::jsonb ->> 'email') INTO jwt_email;
  IF jwt_email IS NOT NULL THEN
    SELECT owner_slug INTO v FROM public.profiles WHERE lower(email) = lower(jwt_email) LIMIT 1;
  END IF;
  RETURN v;
END$$;

GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_owner_slug() TO authenticated;

-- 4) Enable RLS and set select policies on public.profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_self ON public.profiles;
CREATE POLICY profiles_select_self
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

DROP POLICY IF EXISTS profiles_select_superadmin ON public.profiles;
CREATE POLICY profiles_select_superadmin
ON public.profiles
FOR SELECT
TO authenticated
USING (public.current_user_role() = 'superadmin');

DROP POLICY IF EXISTS profiles_select_admin_org ON public.profiles;
CREATE POLICY profiles_select_admin_org
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.current_user_role() = 'admin'
  AND owner_slug IS NOT DISTINCT FROM public.current_user_owner_slug()
);
