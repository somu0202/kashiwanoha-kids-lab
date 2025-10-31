-- Fix infinite recursion in profiles RLS policies
-- Solution: Use SECURITY DEFINER function to bypass RLS when checking roles

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Coaches can view all profiles" ON profiles;

-- Create a security definer function to get user role without triggering RLS
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid());
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION auth.user_role() TO authenticated;

-- Recreate policies using the security definer function
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (auth.user_role() = 'admin');

CREATE POLICY "Coaches can view all profiles"
  ON profiles FOR SELECT
  USING (auth.user_role() IN ('admin', 'coach'));

-- Verify the function and policies
SELECT routine_name, routine_type, security_type 
FROM information_schema.routines 
WHERE routine_schema = 'auth' AND routine_name = 'user_role';

SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
