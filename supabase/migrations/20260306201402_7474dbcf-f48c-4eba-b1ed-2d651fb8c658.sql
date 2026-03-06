
-- Fix invitation_codes SELECT policy: change from public to admin-only
DROP POLICY IF EXISTS "Anyone can read invitation_codes" ON public.invitation_codes;
CREATE POLICY "Admins can read invitation_codes" ON public.invitation_codes
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
