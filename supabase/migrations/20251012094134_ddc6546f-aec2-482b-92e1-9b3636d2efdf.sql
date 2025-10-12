-- Add new fields to profiles table for enhanced features
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS profile_image text,
ADD COLUMN IF NOT EXISTS theme_preference text DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark'));

-- Enable realtime for profiles table
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Enable realtime for invitations table  
ALTER PUBLICATION supabase_realtime ADD TABLE public.invitations;

-- Enable realtime for invitation_responses table
ALTER PUBLICATION supabase_realtime ADD TABLE public.invitation_responses;