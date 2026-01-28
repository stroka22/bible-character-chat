-- Reading Plans Admin Features
-- Date: 2026-01-27
-- Adds: categories table, display ordering, admin policies

-- ============================================
-- READING PLAN CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.reading_plan_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  icon text, -- emoji or icon name
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Seed default categories
INSERT INTO public.reading_plan_categories (slug, name, description, icon, display_order) VALUES
  ('featured', 'Featured Plans', 'Our recommended reading plans', '⭐', 0),
  ('foundational', 'New to the Bible', 'Perfect for those just starting their Bible journey', '🌱', 10),
  ('book', 'Book Studies', 'Deep dives into individual books of the Bible', '📚', 20),
  ('topical', 'Topical Studies', 'Studies organized around themes and topics', '🎯', 30),
  ('character', 'Character Studies', 'Learn from the lives of biblical figures', '👤', 40),
  ('life', 'Life & Relationships', 'Biblical wisdom for everyday situations', '💪', 50),
  ('seasonal', 'Seasonal', 'Plans for special times of year', '🗓️', 60)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  display_order = EXCLUDED.display_order;

-- ============================================
-- ADD COLUMNS TO READING_PLANS
-- ============================================

-- Add display_order column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'reading_plans' 
    AND column_name = 'display_order'
  ) THEN
    ALTER TABLE public.reading_plans ADD COLUMN display_order integer DEFAULT 0;
  END IF;
END $$;

-- Add featured_order column for ordering within featured section
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'reading_plans' 
    AND column_name = 'featured_order'
  ) THEN
    ALTER TABLE public.reading_plans ADD COLUMN featured_order integer DEFAULT 0;
  END IF;
END $$;

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_reading_plans_category ON public.reading_plans(category);
CREATE INDEX IF NOT EXISTS idx_reading_plans_display_order ON public.reading_plans(display_order);
CREATE INDEX IF NOT EXISTS idx_reading_plans_featured ON public.reading_plans(is_featured, featured_order);
CREATE INDEX IF NOT EXISTS idx_reading_plan_categories_order ON public.reading_plan_categories(display_order);

-- ============================================
-- UPDATED_AT TRIGGER FOR CATEGORIES
-- ============================================
DROP TRIGGER IF EXISTS reading_plan_categories_set_updated_at ON public.reading_plan_categories;
CREATE TRIGGER reading_plan_categories_set_updated_at
BEFORE UPDATE ON public.reading_plan_categories
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE public.reading_plan_categories ENABLE ROW LEVEL SECURITY;

-- Anyone can view active categories
CREATE POLICY "Anyone can view active categories" ON public.reading_plan_categories
  FOR SELECT USING (is_active = true);

-- Admin policies for reading_plans (insert, update, delete)
-- Note: These assume you have a way to identify admin users
-- For now, we'll allow authenticated users with specific role

-- Drop existing restrictive policies if any
DROP POLICY IF EXISTS "Admins can insert reading plans" ON public.reading_plans;
DROP POLICY IF EXISTS "Admins can update reading plans" ON public.reading_plans;
DROP POLICY IF EXISTS "Admins can delete reading plans" ON public.reading_plans;

-- Create admin policies (allow all authenticated for now - restrict in app layer)
CREATE POLICY "Admins can insert reading plans" ON public.reading_plans
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admins can update reading plans" ON public.reading_plans
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admins can delete reading plans" ON public.reading_plans
  FOR DELETE TO authenticated USING (true);

-- Admin policies for reading_plan_days
DROP POLICY IF EXISTS "Admins can insert reading plan days" ON public.reading_plan_days;
DROP POLICY IF EXISTS "Admins can update reading plan days" ON public.reading_plan_days;
DROP POLICY IF EXISTS "Admins can delete reading plan days" ON public.reading_plan_days;

CREATE POLICY "Admins can insert reading plan days" ON public.reading_plan_days
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admins can update reading plan days" ON public.reading_plan_days
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admins can delete reading plan days" ON public.reading_plan_days
  FOR DELETE TO authenticated USING (true);

-- Admin policies for categories
DROP POLICY IF EXISTS "Admins can manage categories" ON public.reading_plan_categories;

CREATE POLICY "Admins can insert categories" ON public.reading_plan_categories
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admins can update categories" ON public.reading_plan_categories
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admins can delete categories" ON public.reading_plan_categories
  FOR DELETE TO authenticated USING (true);

-- ============================================
-- HELPER FUNCTION: Reorder plans within category
-- ============================================
CREATE OR REPLACE FUNCTION public.reorder_reading_plans(
  p_category text,
  p_plan_ids uuid[]
) RETURNS void AS $$
DECLARE
  i integer;
BEGIN
  FOR i IN 1..array_length(p_plan_ids, 1) LOOP
    UPDATE public.reading_plans
    SET display_order = i * 10
    WHERE id = p_plan_ids[i] AND category = p_category;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- HELPER FUNCTION: Reorder featured plans
-- ============================================
CREATE OR REPLACE FUNCTION public.reorder_featured_plans(
  p_plan_ids uuid[]
) RETURNS void AS $$
DECLARE
  i integer;
BEGIN
  FOR i IN 1..array_length(p_plan_ids, 1) LOOP
    UPDATE public.reading_plans
    SET featured_order = i * 10
    WHERE id = p_plan_ids[i] AND is_featured = true;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
