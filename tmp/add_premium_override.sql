ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS premium_override boolean DEFAULT false;
UPDATE public.owners SET display_name = 'FaithTalkAI' WHERE owner_slug = 'default';