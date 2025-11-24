-- CRITICAL SECURITY FIX: Remove role column from profiles table
-- Roles MUST only be stored in the dedicated user_roles table to prevent privilege escalation

-- Step 1: Drop RLS policies that depend on the role column
DROP POLICY IF EXISTS "Students can view senior profiles" ON public.profiles;
DROP POLICY IF EXISTS "Seniors can view student profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile except role" ON public.profiles;

-- Step 2: Remove the role column from profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- Step 3: Recreate RLS policies using user_roles table instead
CREATE POLICY "Students can view senior profiles"
ON public.profiles
FOR SELECT
USING (
  has_role(auth.uid(), 'student'::user_role)
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = profiles.id
    AND user_roles.role = 'senior'::user_role
  )
);

CREATE POLICY "Seniors can view student profiles"
ON public.profiles
FOR SELECT
USING (
  has_role(auth.uid(), 'senior'::user_role)
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = profiles.id
    AND user_roles.role = 'student'::user_role
  )
);

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Step 4: Create a view for display purposes that joins profiles with user_roles
CREATE OR REPLACE VIEW public.profiles_with_roles AS
SELECT 
  p.*,
  ur.role
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id;

-- Step 5: Grant appropriate permissions on the view
GRANT SELECT ON public.profiles_with_roles TO authenticated;

-- Note: All authorization checks MUST use the user_roles table, never the profiles table