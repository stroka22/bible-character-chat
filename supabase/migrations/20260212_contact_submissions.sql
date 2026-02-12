-- Contact form submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'resolved', 'archived')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);

-- RLS policies
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Only service role can insert (from API)
CREATE POLICY "Service role can insert contact submissions"
  ON contact_submissions FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Authenticated admins can view/update
CREATE POLICY "Admins can view contact submissions"
  ON contact_submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can update contact submissions"
  ON contact_submissions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_contact_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS contact_submissions_updated_at ON contact_submissions;
CREATE TRIGGER contact_submissions_updated_at
  BEFORE UPDATE ON contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_submissions_updated_at();
