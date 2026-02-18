-- Marketing Materials table for the Marketing Vault
CREATE TABLE IF NOT EXISTS marketing_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('pdf', 'image', 'video', 'other')),
  -- For uploaded files
  file_url text,
  file_name text,
  file_size integer,
  -- For external links
  external_url text,
  -- Organization targeting
  is_global boolean DEFAULT true, -- Available to all org admins
  owner_slug text, -- If not global, which org owns this
  target_org_slugs text[] DEFAULT '{}', -- If not global, which orgs can see this
  -- Categorization
  category text DEFAULT 'general', -- general, social-media, print, partner, etc.
  tags text[] DEFAULT '{}',
  -- For business partner materials (super-admin only)
  is_partner_material boolean DEFAULT false,
  -- Metadata
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_marketing_materials_type ON marketing_materials(type);
CREATE INDEX IF NOT EXISTS idx_marketing_materials_is_global ON marketing_materials(is_global);
CREATE INDEX IF NOT EXISTS idx_marketing_materials_owner_slug ON marketing_materials(owner_slug);
CREATE INDEX IF NOT EXISTS idx_marketing_materials_is_partner ON marketing_materials(is_partner_material);
CREATE INDEX IF NOT EXISTS idx_marketing_materials_category ON marketing_materials(category);

-- RLS
ALTER TABLE marketing_materials ENABLE ROW LEVEL SECURITY;

-- Super admins (role = 'admin' with owner_slug = 'default' or 'faithtalkai') can do everything
CREATE POLICY "Super admins can manage all marketing materials"
  ON marketing_materials FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND p.role = 'admin'
      AND (p.owner_slug IS NULL OR p.owner_slug = 'default' OR p.owner_slug = 'faithtalkai')
    )
  );

-- Org admins can view global materials and materials targeted to their org
CREATE POLICY "Org admins can view assigned marketing materials"
  ON marketing_materials FOR SELECT
  TO authenticated
  USING (
    -- Must be an admin
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
    AND (
      -- Global materials (non-partner)
      (is_global = true AND is_partner_material = false)
      OR
      -- Materials targeted to their org
      EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid() 
        AND p.owner_slug = ANY(target_org_slugs)
      )
      OR
      -- Materials they own
      EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid() 
        AND p.owner_slug = owner_slug
      )
    )
  );

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_marketing_materials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS marketing_materials_updated_at ON marketing_materials;
CREATE TRIGGER marketing_materials_updated_at
  BEFORE UPDATE ON marketing_materials
  FOR EACH ROW
  EXECUTE FUNCTION update_marketing_materials_updated_at();

-- Create storage bucket for marketing materials if it doesn't exist
-- Note: Run this in Supabase dashboard or via supabase CLI
-- INSERT INTO storage.buckets (id, name, public) VALUES ('marketing', 'marketing', true);
