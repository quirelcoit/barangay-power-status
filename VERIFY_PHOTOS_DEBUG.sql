-- Debug Script: Check if photos are being saved correctly
-- Run this in Supabase SQL Editor to diagnose photo issues

-- 1. Count total reports
SELECT COUNT(*) as total_reports FROM public.reports;

-- 2. Count reports with recent timestamps (submitted in last hour)
SELECT COUNT(*) as recent_reports 
FROM public.reports 
WHERE created_at > NOW() - INTERVAL '1 hour';

-- 3. Count total photos
SELECT COUNT(*) as total_photos FROM public.report_photos;

-- 4. Count recent photos
SELECT COUNT(*) as recent_photos 
FROM public.report_photos 
WHERE created_at > NOW() - INTERVAL '1 hour';

-- 5. Check recent reports with photo count
SELECT 
  r.id,
  r.category,
  r.barangay_id,
  r.custom_location,
  r.created_at,
  (SELECT COUNT(*) FROM public.report_photos WHERE report_id = r.id) as photo_count
FROM public.reports r
WHERE r.created_at > NOW() - INTERVAL '1 hour'
ORDER BY r.created_at DESC
LIMIT 10;

-- 6. Check report_photos table for recent entries
SELECT 
  rp.id,
  rp.report_id,
  rp.storage_path,
  rp.created_at,
  r.category,
  r.created_at as report_created_at
FROM public.report_photos rp
LEFT JOIN public.reports r ON rp.report_id = r.id
WHERE rp.created_at > NOW() - INTERVAL '1 hour'
ORDER BY rp.created_at DESC
LIMIT 10;

-- 7. Check for any photos without matching reports
SELECT 
  rp.id,
  rp.report_id,
  rp.storage_path,
  rp.created_at
FROM public.report_photos rp
WHERE rp.report_id NOT IN (SELECT id FROM public.reports)
LIMIT 10;

-- 8. Count photos by category
SELECT 
  r.category,
  COUNT(*) as photo_count
FROM public.report_photos rp
LEFT JOIN public.reports r ON rp.report_id = r.id
GROUP BY r.category
ORDER BY photo_count DESC;
