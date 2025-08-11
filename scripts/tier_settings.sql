-- tier_settings.sql
-- Creates the tier_settings table with Row Level Security (RLS) policies
-- for multi-tenant tier settings management

-- Create the tier_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.tier_settings (
  owner_slug TEXT PRIMARY KEY,
  free_message_limit INTEGER NOT NULL DEFAULT 5,
  free_character_limit INTEGER NOT NULL DEFAULT 10,
  free_characters JSONB NOT NULL DEFAULT '[]',
  free_character_names JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add comment to the table
COMMENT ON TABLE public.tier_settings IS 'Stores account tier settings per owner slug for multi-tenant configuration';

-- Enable Row Level Security
ALTER TABLE public.tier_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (both anonymous and authenticated users)
CREATE POLICY tier_settings_select_policy
  ON public.tier_settings
  FOR SELECT
  USING (true);

-- Create policy for admin-only insert/update
-- This checks if the authenticated user has 'admin' role in the profiles table
CREATE POLICY tier_settings_insert_policy
  ON public.tier_settings
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin','superadmin')
    )
  );

CREATE POLICY tier_settings_update_policy
  ON public.tier_settings
  FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin','superadmin')
    )
  );

-- Create index on owner_slug for faster lookups
CREATE INDEX IF NOT EXISTS tier_settings_owner_slug_idx ON public.tier_settings (owner_slug);

-- Add default record for 'default' slug if it doesn't exist
INSERT INTO public.tier_settings (owner_slug)
VALUES ('default')
ON CONFLICT (owner_slug) DO NOTHING;
