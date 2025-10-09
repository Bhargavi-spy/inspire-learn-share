-- Add school_name and school_email to profiles table
ALTER TABLE public.profiles
ADD COLUMN school_name text,
ADD COLUMN school_email text;

-- Create invitation_responses table
CREATE TABLE public.invitation_responses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invitation_id uuid NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  senior_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('accepted', 'rejected')),
  responded_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(invitation_id, senior_id)
);

-- Enable RLS on invitation_responses
ALTER TABLE public.invitation_responses ENABLE ROW LEVEL SECURITY;

-- RLS policies for invitation_responses
CREATE POLICY "Everyone can view invitation responses"
ON public.invitation_responses
FOR SELECT
USING (true);

CREATE POLICY "Seniors can create their own responses"
ON public.invitation_responses
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'senior'
  ) AND senior_id = auth.uid()
);

CREATE POLICY "Seniors can update their own responses"
ON public.invitation_responses
FOR UPDATE
USING (senior_id = auth.uid());

CREATE POLICY "Seniors can delete their own responses"
ON public.invitation_responses
FOR DELETE
USING (senior_id = auth.uid());