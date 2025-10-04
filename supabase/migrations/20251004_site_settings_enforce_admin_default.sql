-- Add enforce_admin_default flag to site_settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'site_settings' 
      AND column_name = 'enforce_admin_default'
  ) THEN
    ALTER TABLE public.site_settings
      ADD COLUMN enforce_admin_default boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- No RLS policy changes needed if SELECT is already allowed to anon
-- (the application reads this table with anon key and via same-origin proxy)
