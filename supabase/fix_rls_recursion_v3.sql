-- Fix infinite recursion in profiles RLS policies
-- Solution: Use SECURITY DEFINER function in public schema

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Coaches can view all profiles" ON profiles;

-- Create a security definer function to get user role without triggering RLS
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = user_id);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO anon;

-- Recreate policies using the security definer function
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Coaches can view all profiles"
  ON profiles FOR SELECT
  USING (public.get_user_role(auth.uid()) IN ('admin', 'coach'));

-- Verify the function and policies
SELECT routine_name, routine_schema, routine_type, security_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_name = 'get_user_role';

SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
