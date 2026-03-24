-- Create storage bucket for job reports
INSERT INTO storage.buckets (id, name, public)
VALUES ('job-reports', 'job-reports', true);

-- Allow authenticated users to upload reports
CREATE POLICY "Allow authenticated users to upload reports"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'job-reports');

-- Allow public read access to reports
CREATE POLICY "Allow public read access to reports"
ON storage.objects
FOR SELECT
USING (bucket_id = 'job-reports');