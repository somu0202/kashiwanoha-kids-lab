-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'coach', 'parent')),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Children table
CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  birthdate DATE NOT NULL,
  grade TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Assessments table
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  coach_id UUID NOT NULL REFERENCES profiles(id),
  memo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- FMS (Fundamental Movement Skills) scores table - 7 basic movements
CREATE TABLE fms_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  run INT NOT NULL CHECK (run >= 1 AND run <= 5),
  balance_beam INT NOT NULL CHECK (balance_beam >= 1 AND balance_beam <= 5),
  jump INT NOT NULL CHECK (jump >= 1 AND jump <= 5),
  throw INT NOT NULL CHECK (throw >= 1 AND throw <= 5),
  catch INT NOT NULL CHECK (catch >= 1 AND catch <= 5),
  dribble INT NOT NULL CHECK (dribble >= 1 AND dribble <= 5),
  roll INT NOT NULL CHECK (roll >= 1 AND roll <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(assessment_id)
);

-- SMC (Sports Motor Competency) scores table
CREATE TABLE smc_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  shuttle_run_sec DECIMAL(5,2) CHECK (shuttle_run_sec >= 5.0 AND shuttle_run_sec <= 60.0),
  paper_ball_throw_m DECIMAL(5,2) CHECK (paper_ball_throw_m >= 0.1 AND paper_ball_throw_m <= 30.0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(assessment_id)
);

-- Shared links table for parent access
CREATE TABLE shared_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  one_time BOOLEAN NOT NULL DEFAULT FALSE,
  accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_children_owner ON children(owner_profile_id);
CREATE INDEX idx_assessments_child ON assessments(child_id);
CREATE INDEX idx_assessments_coach ON assessments(coach_id);
CREATE INDEX idx_assessments_date ON assessments(assessed_at DESC);
CREATE INDEX idx_shared_links_token ON shared_links(token);
CREATE INDEX idx_shared_links_expires ON shared_links(expires_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_children_updated_at BEFORE UPDATE ON children
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fms_scores_updated_at BEFORE UPDATE ON fms_scores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_smc_scores_updated_at BEFORE UPDATE ON smc_scores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shared_links_updated_at BEFORE UPDATE ON shared_links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE fms_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE smc_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_links ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Coaches can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'coach')
    )
  );

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Children policies
CREATE POLICY "Parents can view their own children"
  ON children FOR SELECT
  USING (owner_profile_id = auth.uid());

CREATE POLICY "Admins and coaches can view all children"
  ON children FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'coach')
    )
  );

CREATE POLICY "Admins and coaches can insert children"
  ON children FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'coach')
    )
  );

CREATE POLICY "Admins and coaches can update children"
  ON children FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'coach')
    )
  );

CREATE POLICY "Admins and coaches can delete children"
  ON children FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'coach')
    )
  );

-- Assessments policies
CREATE POLICY "Parents can view assessments of their children"
  ON assessments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = assessments.child_id 
        AND children.owner_profile_id = auth.uid()
    )
  );

CREATE POLICY "Admins and coaches can view all assessments"
  ON assessments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'coach')
    )
  );

CREATE POLICY "Coaches can insert assessments"
  ON assessments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'coach')
    )
  );

CREATE POLICY "Coaches can update assessments"
  ON assessments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'coach')
    )
  );

CREATE POLICY "Admins can delete assessments"
  ON assessments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- FMS scores policies
CREATE POLICY "Parents can view FMS scores of their children's assessments"
  ON fms_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assessments
      JOIN children ON children.id = assessments.child_id
      WHERE assessments.id = fms_scores.assessment_id 
        AND children.owner_profile_id = auth.uid()
    )
  );

CREATE POLICY "Admins and coaches can view all FMS scores"
  ON fms_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'coach')
    )
  );

CREATE POLICY "Coaches can insert FMS scores"
  ON fms_scores FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'coach')
    )
  );

CREATE POLICY "Coaches can update FMS scores"
  ON fms_scores FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'coach')
    )
  );

-- SMC scores policies
CREATE POLICY "Parents can view SMC scores of their children's assessments"
  ON smc_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assessments
      JOIN children ON children.id = assessments.child_id
      WHERE assessments.id = smc_scores.assessment_id 
        AND children.owner_profile_id = auth.uid()
    )
  );

CREATE POLICY "Admins and coaches can view all SMC scores"
  ON smc_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'coach')
    )
  );

CREATE POLICY "Coaches can insert SMC scores"
  ON smc_scores FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'coach')
    )
  );

CREATE POLICY "Coaches can update SMC scores"
  ON smc_scores FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'coach')
    )
  );

-- Shared links policies (accessible without authentication via token)
CREATE POLICY "Anyone can view shared links with valid token"
  ON shared_links FOR SELECT
  USING (true);

CREATE POLICY "Coaches can create shared links"
  ON shared_links FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'coach')
    )
  );

CREATE POLICY "Coaches can update shared links"
  ON shared_links FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'coach')
    )
  );

CREATE POLICY "Admins can delete shared links"
  ON shared_links FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
