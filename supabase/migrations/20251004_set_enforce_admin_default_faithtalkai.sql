-- Ensure enforce_admin_default is true for production owner faithtalkai
-- Idempotent: will update existing row if present; no-op otherwise

DO $$
BEGIN
  -- Make sure column exists (in case migration order differs)
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

-- Set enforcement for FaithTalkAI org
UPDATE public.site_settings
   SET enforce_admin_default = true,
       updated_at = now()
 WHERE owner_slug = 'faithtalkai';
