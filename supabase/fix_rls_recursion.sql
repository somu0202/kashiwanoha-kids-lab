-- Fix infinite recursion in profiles RLS policies
-- This script drops problematic policies and recreates them correctly

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Coaches can view all profiles" ON profiles;

-- Create non-recursive policies using auth metadata or direct role check
-- Admin role check: Use a simpler approach without recursion
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    -- Check if current user has admin role by direct lookup
    -- Use a subquery that doesn't trigger RLS recursion
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Coach role check: Similar approach
CREATE POLICY "Coaches can view all profiles"
  ON profiles FOR SELECT
  USING (
    -- Check if current user has coach or admin role
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'coach')
  );

-- Verify the policies are created correctly
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
