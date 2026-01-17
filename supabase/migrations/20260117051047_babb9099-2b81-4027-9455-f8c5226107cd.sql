-- Create storage bucket for interview prep document uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('interview-prep-docs', 'interview-prep-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files
CREATE POLICY "Users can upload interview prep docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'interview-prep-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to read their own files
CREATE POLICY "Users can read their own interview prep docs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'interview-prep-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own interview prep docs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'interview-prep-docs' AND auth.uid()::text = (storage.foldername(name))[1]);