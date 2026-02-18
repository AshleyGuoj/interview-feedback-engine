
-- Remove the overly permissive public read policy
DROP POLICY IF EXISTS "Allow public read of invitation codes" ON public.invitation_codes;
