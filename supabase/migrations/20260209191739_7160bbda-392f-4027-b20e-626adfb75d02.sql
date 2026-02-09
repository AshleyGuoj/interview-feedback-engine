-- Invitation codes table
CREATE TABLE public.invitation_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  max_uses INTEGER NOT NULL DEFAULT 1,
  current_uses INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.invitation_codes ENABLE ROW LEVEL SECURITY;

-- Anyone can read codes (needed for validation during signup, but only code + validity)
-- We'll validate server-side in edge function for security
CREATE POLICY "Allow public read of invitation codes"
  ON public.invitation_codes
  FOR SELECT
  USING (true);

-- Only service role can insert/update/delete (admin managed)
-- No INSERT/UPDATE/DELETE policies = only service role can modify