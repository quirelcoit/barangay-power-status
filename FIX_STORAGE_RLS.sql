-- Fix Storage RLS Policies for report-photos bucket
-- Run this in Supabase SQL Editor

-- First, check existing storage policies (optional, for debugging)
-- SELECT * FROM storage.objects WHERE bucket_id = 'report-photos' LIMIT 5;

-- Drop existing policies if they exist (optional cleanup)
-- drop policy if exists "Allow public uploads" on storage.objects;
-- drop policy if exists "Allow public reads" on storage.objects;
-- drop policy if exists "Allow public deletes" on storage.objects;

-- Create policies for report-photos bucket
-- Allow anonymous users to upload files to report-photos bucket
create policy "Allow public uploads to report-photos"
on storage.objects
for insert
to anon
with check (bucket_id = 'report-photos');

-- Allow anonymous users to view files in report-photos bucket
create policy "Allow public reads from report-photos"
on storage.objects
for select
to anon
using (bucket_id = 'report-photos');

-- Allow authenticated admin staff to delete files from report-photos bucket
create policy "Allow staff deletes from report-photos"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'report-photos'
  AND exists(select 1 from public.staff_profiles sp where sp.uid = auth.uid())
);

-- Verify policies were created
SELECT policy_name, roles, operation, CASE WHEN has_insert THEN 'INSERT' ELSE '' END as permissions
FROM storage.policies
WHERE bucket_id = 'report-photos';
