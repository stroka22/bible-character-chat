-- Harden RLS policies for public.profiles
-- Context: remove permissive policies and scope inserts/updates/deletes properly

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop overly-permissive policies if present
DROP POLICY IF EXISTS profiles_insert ON public.profiles;
DROP POLICY IF EXISTS profiles_update ON public.profiles;
DROP POLICY IF EXISTS profiles_delete ON public.profiles;

-- Insert: allow authenticated users to create only their own profile row
CREATE POLICY profiles_insert_self
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Update: self can update own row
CREATE POLICY profiles_update_self
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Update: admins can update rows within their owner scope
CREATE POLICY profiles_update_admin_org
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  public.current_user_role() = 'admin'
  AND owner_slug IS NOT DISTINCT FROM public.current_user_owner_slug()
)
WITH CHECK (
  public.current_user_role() = 'admin'
  AND owner_slug IS NOT DISTINCT FROM public.current_user_owner_slug()
);

-- Update/Delete: superadmin unrestricted
CREATE POLICY profiles_update_superadmin
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.current_user_role() = 'superadmin')
WITH CHECK (public.current_user_role() = 'superadmin');

CREATE POLICY profiles_delete_superadmin
ON public.profiles
FOR DELETE
TO authenticated
USING (public.current_user_role() = 'superadmin');
