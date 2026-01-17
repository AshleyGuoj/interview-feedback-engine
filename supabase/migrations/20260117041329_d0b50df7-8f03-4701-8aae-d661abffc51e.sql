-- Create recent_activities table for tracking job-related events
CREATE TABLE public.recent_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'interview_scheduled', 'stage_completed', 'status_changed', 'offer_received', 'stage_updated'
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb, -- Store additional context like stage_name, old_status, new_status
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient querying
CREATE INDEX idx_recent_activities_user_id ON public.recent_activities(user_id);
CREATE INDEX idx_recent_activities_job_id ON public.recent_activities(job_id);
CREATE INDEX idx_recent_activities_created_at ON public.recent_activities(created_at DESC);

-- Enable RLS
ALTER TABLE public.recent_activities ENABLE ROW LEVEL SECURITY;

-- RLS policies for recent_activities
CREATE POLICY "Users can view their own activities"
ON public.recent_activities
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activities"
ON public.recent_activities
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activities"
ON public.recent_activities
FOR DELETE
USING (auth.uid() = user_id);