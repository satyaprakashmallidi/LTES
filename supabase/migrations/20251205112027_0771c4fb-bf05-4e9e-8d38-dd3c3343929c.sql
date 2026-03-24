-- Update storage policy to allow all uploads (since no auth yet)
DROP POLICY IF EXISTS "Allow authenticated users to upload reports" ON storage.objects;

CREATE POLICY "Allow all users to upload reports"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'job-reports');

CREATE POLICY "Allow all users to update reports"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'job-reports');