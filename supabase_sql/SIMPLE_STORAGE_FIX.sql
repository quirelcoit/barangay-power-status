-- Simple Storage RLS Check and Fix
-- Run this in Supabase SQL Editor

-- Check if storage.objects table has RLS enabled
-- If not, enable it first
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Try a simpler policy format - just allow all for now to test
DROP POLICY IF EXISTS "Allow public uploads to report-photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads from report-photos" ON storage.objects;

-- Simple: Allow anyone to upload to report-photos
CREATE POLICY "Allow uploads"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'report-photos');

-- Simple: Allow anyone to read from report-photos
CREATE POLICY "Allow reads"
ON storage.objects
FOR SELECT
USING (bucket_id = 'report-photos');

-- Done - this should allow photo uploads now
