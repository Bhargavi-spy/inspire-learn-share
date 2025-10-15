-- Create user_sessions table to track login/logout times
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  login_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  logout_at TIMESTAMP WITH TIME ZONE,
  time_spent_minutes INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN logout_at IS NOT NULL 
      THEN EXTRACT(EPOCH FROM (logout_at - login_at)) / 60
      ELSE NULL
    END
  ) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Admin can view all sessions
CREATE POLICY "Admins can view all sessions"
ON public.user_sessions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::user_role));

-- Users can insert their own sessions
CREATE POLICY "Users can insert their own sessions"
ON public.user_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update their own sessions"
ON public.user_sessions
FOR UPDATE
USING (auth.uid() = user_id);

-- Add RLS policies for admin to view all data
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admins can view all videos"
ON public.videos
FOR SELECT
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admins can view all live sessions"
ON public.live_sessions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admins can view all invitations"
ON public.invitations
FOR SELECT
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admins can view all invitation responses"
ON public.invitation_responses
FOR SELECT
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admins can view all video likes"
ON public.video_likes
FOR SELECT
USING (has_role(auth.uid(), 'admin'::user_role));

-- Admins can delete videos
CREATE POLICY "Admins can delete videos"
ON public.videos
FOR DELETE
USING (has_role(auth.uid(), 'admin'::user_role));

-- Create index for faster queries
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_login_at ON public.user_sessions(login_at DESC);