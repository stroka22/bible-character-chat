-- scripts/min_owners.sql
-- Minimal SQL to create owners table and basic RLS policies

-- Create owners table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.owners (
  owner_slug TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Insert default owner if it doesn't exist
INSERT INTO public.owners (owner_slug, display_name)
VALUES ('default', 'Default Organization')
ON CONFLICT (owner_slug) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "owners_select_policy" ON public.owners;

-- Create select policy allowing authenticated users to read all rows
CREATE POLICY "owners_select_policy" ON public.owners
FOR SELECT
TO authenticated
USING (true);
