-- Remove storage policies for interview-prep-docs bucket
DROP POLICY IF EXISTS "Users can upload interview prep docs" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their interview prep docs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their interview prep docs" ON storage.objects;

-- Remove the storage bucket
DELETE FROM storage.objects WHERE bucket_id = 'interview-prep-docs';
DELETE FROM storage.buckets WHERE id = 'interview-prep-docs';