-- Create parent_invitations table
CREATE TABLE IF NOT EXISTS parent_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES profiles(id),
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'expired')) DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT unique_pending_invitation UNIQUE (email, child_id, status)
);

-- Create index for faster lookups
CREATE INDEX idx_parent_invitations_token ON parent_invitations(token);
CREATE INDEX idx_parent_invitations_email ON parent_invitations(email);
CREATE INDEX idx_parent_invitations_child ON parent_invitations(child_id);
CREATE INDEX idx_parent_invitations_status ON parent_invitations(status);

-- Add trigger for updated_at (reuse existing function)
CREATE TRIGGER update_parent_invitations_updated_at
  BEFORE UPDATE ON parent_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE parent_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for parent_invitations

-- Admins can view all invitations
CREATE POLICY "Admins can view all invitations"
  ON parent_invitations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Coaches can view invitations they created
CREATE POLICY "Coaches can view their invitations"
  ON parent_invitations FOR SELECT
  USING (invited_by = auth.uid());

-- Admins and coaches can create invitations
CREATE POLICY "Admins and coaches can create invitations"
  ON parent_invitations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'coach')
    )
  );

-- Admins and invitation creators can update invitations
CREATE POLICY "Admins and creators can update invitations"
  ON parent_invitations FOR UPDATE
  USING (
    invited_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can delete invitations
CREATE POLICY "Admins can delete invitations"
  ON parent_invitations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Add parent-child relationship table
CREATE TABLE IF NOT EXISTS parent_child_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (parent_profile_id, child_id)
);

-- Create index for faster lookups
CREATE INDEX idx_parent_child_parent ON parent_child_relationships(parent_profile_id);
CREATE INDEX idx_parent_child_child ON parent_child_relationships(child_id);

-- Enable RLS
ALTER TABLE parent_child_relationships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for parent_child_relationships

-- Admins can view all relationships
CREATE POLICY "Admins can view all relationships"
  ON parent_child_relationships FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Parents can view their own relationships
CREATE POLICY "Parents can view their relationships"
  ON parent_child_relationships FOR SELECT
  USING (parent_profile_id = auth.uid());

-- Coaches can view relationships for children they assess
CREATE POLICY "Coaches can view related children"
  ON parent_child_relationships FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'coach'
    )
  );

-- Only admins can create relationships
CREATE POLICY "Only admins can create relationships"
  ON parent_child_relationships FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only admins can delete relationships
CREATE POLICY "Only admins can delete relationships"
  ON parent_child_relationships FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
