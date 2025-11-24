-- Fix Security Definer View issue
-- Recreate the profiles_with_roles view to explicitly use SECURITY INVOKER
-- This ensures the view respects the querying user's RLS policies

DROP VIEW IF EXISTS public.profiles_with_roles;

CREATE VIEW public.profiles_with_roles 
WITH (security_invoker = true)
AS
SELECT 
  p.id,
  p.full_name,
  p.age,
  p.mobile_number,
  p.email,
  p.interests,
  p.coins,
  p.created_at,
  p.updated_at,
  p.school_name,
  p.school_email,
  p.description,
  p.profile_image,
  p.theme_preference,
  ur.role
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id;

-- Grant appropriate permissions
GRANT SELECT ON public.profiles_with_roles TO authenticated;