-- Fix 1: Create secure role-based authorization system
-- Create user_roles table to prevent privilege escalation
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can view their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role user_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create trigger function to sync roles from profiles to user_roles on insert
CREATE OR REPLACE FUNCTION public.sync_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, NEW.role)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger to automatically sync roles
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_role();

-- Migrate existing roles to user_roles table
INSERT INTO public.user_roles (user_id, role)
SELECT id, role FROM public.profiles
ON CONFLICT (user_id, role) DO NOTHING;

-- Fix 2: Restrict profile data access to authenticated users only
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Students can view senior profiles (needed for video functionality)
CREATE POLICY "Students can view senior profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  role = 'senior' AND 
  public.has_role(auth.uid(), 'student')
);

-- Seniors can view student profiles (needed to see who liked their videos)
CREATE POLICY "Seniors can view student profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  role = 'student' AND 
  public.has_role(auth.uid(), 'senior')
);

-- Schools can view all profiles (needed for invitation responses)
CREATE POLICY "Schools can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'school'));

-- Prevent users from changing their role
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update own profile except role"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND
  role = (SELECT role FROM public.profiles WHERE id = auth.uid())
);

-- Update RLS policies to use has_role() function instead of checking profiles table
-- Videos table policies
DROP POLICY IF EXISTS "Seniors can create videos" ON public.videos;
CREATE POLICY "Seniors can create videos"
ON public.videos FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'senior') AND 
  senior_id = auth.uid()
);

-- Live sessions policies
DROP POLICY IF EXISTS "Seniors can create live sessions" ON public.live_sessions;
CREATE POLICY "Seniors can create live sessions"
ON public.live_sessions FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'senior') AND 
  senior_id = auth.uid()
);

-- Invitations policies
DROP POLICY IF EXISTS "Schools can create invitations" ON public.invitations;
CREATE POLICY "Schools can create invitations"
ON public.invitations FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'school'));

-- Invitation responses policies
DROP POLICY IF EXISTS "Seniors can create their own responses" ON public.invitation_responses;
CREATE POLICY "Seniors can create their own responses"
ON public.invitation_responses FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'senior') AND 
  senior_id = auth.uid()
);

-- Video likes policies
DROP POLICY IF EXISTS "Students can create likes" ON public.video_likes;
CREATE POLICY "Students can create likes"
ON public.video_likes FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'student') AND 
  student_id = auth.uid()
);

-- Fix 3: Restrict invitation responses to authenticated users
DROP POLICY IF EXISTS "Everyone can view invitation responses" ON public.invitation_responses;

CREATE POLICY "Seniors can view own responses"
ON public.invitation_responses FOR SELECT
TO authenticated
USING (senior_id = auth.uid());

CREATE POLICY "Schools can view responses to their invitations"
ON public.invitation_responses FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.invitations
    WHERE invitations.id = invitation_responses.invitation_id
    AND invitations.school_id = auth.uid()
  )
);