-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('school', 'senior', 'student');

-- Create enum for senior interests
CREATE TYPE public.senior_interest AS ENUM (
  'Art', 
  'Farming', 
  'Organic Farming', 
  'Education', 
  'Crafts', 
  'Stitching', 
  'Storytelling', 
  'Cooking', 
  'Gardening'
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  mobile_number TEXT NOT NULL,
  email TEXT NOT NULL,
  role public.user_role NOT NULL,
  interests public.senior_interest[] DEFAULT '{}',
  coins INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create invitations table
CREATE TABLE public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create videos table
CREATE TABLE public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  senior_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  likes INTEGER DEFAULT 0,
  watch_time_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create video likes table (to track who liked what)
CREATE TABLE public.video_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(video_id, student_id)
);

-- Create live sessions table
CREATE TABLE public.live_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  senior_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  youtube_live_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Invitations policies
CREATE POLICY "Everyone can view invitations" ON public.invitations
  FOR SELECT USING (true);

CREATE POLICY "Schools can create invitations" ON public.invitations
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'school')
  );

CREATE POLICY "Schools can delete their own invitations" ON public.invitations
  FOR DELETE USING (school_id = auth.uid());

-- Videos policies
CREATE POLICY "Everyone can view videos" ON public.videos
  FOR SELECT USING (true);

CREATE POLICY "Seniors can create videos" ON public.videos
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'senior')
    AND senior_id = auth.uid()
  );

CREATE POLICY "Seniors can delete their own videos" ON public.videos
  FOR DELETE USING (senior_id = auth.uid());

CREATE POLICY "Seniors can update their own videos" ON public.videos
  FOR UPDATE USING (senior_id = auth.uid());

-- Video likes policies
CREATE POLICY "Everyone can view video likes" ON public.video_likes
  FOR SELECT USING (true);

CREATE POLICY "Students can create likes" ON public.video_likes
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'student')
    AND student_id = auth.uid()
  );

CREATE POLICY "Students can delete their own likes" ON public.video_likes
  FOR DELETE USING (student_id = auth.uid());

-- Live sessions policies
CREATE POLICY "Everyone can view live sessions" ON public.live_sessions
  FOR SELECT USING (true);

CREATE POLICY "Seniors can create live sessions" ON public.live_sessions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'senior')
    AND senior_id = auth.uid()
  );

CREATE POLICY "Seniors can update their own live sessions" ON public.live_sessions
  FOR UPDATE USING (senior_id = auth.uid());

CREATE POLICY "Seniors can delete their own live sessions" ON public.live_sessions
  FOR DELETE USING (senior_id = auth.uid());

-- Function to update profile updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profile_updated_at();

-- Function to update senior coins when video is liked
CREATE OR REPLACE FUNCTION public.update_coins_on_like()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Add 1 coin for like
    UPDATE public.profiles
    SET coins = coins + 1
    WHERE id = (SELECT senior_id FROM public.videos WHERE id = NEW.video_id);
    
    -- Update video likes count
    UPDATE public.videos
    SET likes = likes + 1
    WHERE id = NEW.video_id;
  ELSIF TG_OP = 'DELETE' THEN
    -- Remove 1 coin for unlike
    UPDATE public.profiles
    SET coins = GREATEST(coins - 1, 0)
    WHERE id = (SELECT senior_id FROM public.videos WHERE id = OLD.video_id);
    
    -- Update video likes count
    UPDATE public.videos
    SET likes = GREATEST(likes - 1, 0)
    WHERE id = OLD.video_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for coin updates on likes
CREATE TRIGGER update_coins_on_video_like
  AFTER INSERT OR DELETE ON public.video_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_coins_on_like();