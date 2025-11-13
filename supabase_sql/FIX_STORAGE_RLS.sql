-- Fix Storage RLS Policies for report-photos bucket
-- Run this in Supabase SQL Editor

-- Drop existing policies if they exist (optional cleanup)
DROP POLICY IF EXISTS "Allow public uploads to report-photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads from report-photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow staff deletes from report-photos" ON storage.objects;

-- Create policies for report-photos bucket

-- 1. Allow anonymous users to upload files to report-photos bucket
CREATE POLICY "Allow public uploads to report-photos"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'report-photos');

-- 2. Allow anonymous users to view files in report-photos bucket
CREATE POLICY "Allow public reads from report-photos"
ON storage.objects
FOR SELECT
TO anon
USING (bucket_id = 'report-photos');

-- 3. Allow authenticated admin staff to delete files from report-photos bucket
CREATE POLICY "Allow staff deletes from report-photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'report-photos'
  AND EXISTS(SELECT 1 FROM public.staff_profiles sp WHERE sp.uid = auth.uid())
);

-- If all three policies were created successfully, the SQL will complete with no errors
-- Verify in Supabase Dashboard: Storage > report-photos bucket > Policies tab
-- You should see 3 policies listed there
