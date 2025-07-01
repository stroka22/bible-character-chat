-- Create character_groups table
CREATE TABLE IF NOT EXISTS character_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,

  CONSTRAINT unique_group_name UNIQUE (name)
);

-- Create trigger to automatically update updated_at for character_groups table
CREATE TRIGGER update_character_groups_updated_at
BEFORE UPDATE ON character_groups
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create character_group_mappings table
CREATE TABLE IF NOT EXISTS character_group_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES character_groups(id) ON DELETE CASCADE NOT NULL,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,

  CONSTRAINT unique_group_character UNIQUE (group_id, character_id)
);

-- Create trigger to automatically update updated_at for character_group_mappings table
CREATE TRIGGER update_character_group_mappings_updated_at
BEFORE UPDATE ON character_group_mappings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for character_group_mappings
CREATE INDEX idx_group_mapping_group_id ON character_group_mappings (group_id);
CREATE INDEX idx_group_mapping_character_id ON character_group_mappings (character_id);
CREATE INDEX idx_group_mapping_sort_order ON character_group_mappings (sort_order);

-- Enable Row Level Security (RLS) on new tables
ALTER TABLE character_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_group_mappings ENABLE ROW LEVEL SECURITY;

-- RLS policies for character_groups table
-- Allow all users to view groups
CREATE POLICY "Character groups are viewable by all users" ON character_groups
  FOR SELECT USING (true);

-- Allow authenticated and anonymous users to create/update/delete groups (for development)
CREATE POLICY "Allow all inserts on character_groups" ON character_groups
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all updates on character_groups" ON character_groups
  FOR UPDATE USING (true);
CREATE POLICY "Allow all deletes on character_groups" ON character_groups
  FOR DELETE USING (true);

-- RLS policies for character_group_mappings table
-- Allow all users to view mappings
CREATE POLICY "Character group mappings are viewable by all users" ON character_group_mappings
  FOR SELECT USING (true);

-- Allow authenticated and anonymous users to create/update/delete mappings (for development)
CREATE POLICY "Allow all inserts on character_group_mappings" ON character_group_mappings
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all updates on character_group_mappings" ON character_group_mappings
  FOR UPDATE USING (true);
CREATE POLICY "Allow all deletes on character_group_mappings" ON character_group_mappings
  FOR DELETE USING (true);

-- Optional: Insert sample character groups
INSERT INTO character_groups (name, description, image_url, icon, sort_order)
VALUES
  ('Patriarchs', 'Founding fathers of the Israelite nation.', 'https://example.com/groups/patriarchs.jpg', 'users', 1),
  ('Prophets', 'Messengers of God who delivered divine messages.', 'https://example.com/groups/prophets.jpg', 'book-open', 2),
  ('Kings', 'Rulers of Israel and Judah.', 'https://example.com/groups/kings.jpg', 'crown', 3),
  ('Women of the Bible', 'Influential women from biblical narratives.', 'https://example.com/groups/women.jpg', 'female', 4),
  ('Apostles', 'The twelve disciples of Jesus and early church leaders.', 'https://example.com/groups/apostles.jpg', 'cross', 5);
