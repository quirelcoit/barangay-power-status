-- Database Migration: Add Custom Location Support
-- Run this in Supabase SQL Editor to add custom_location field to reports table

-- Add custom_location column if it doesn't exist
ALTER TABLE public.reports 
ADD COLUMN custom_location TEXT DEFAULT NULL;

-- Make barangay_id optional (if not already)
-- Note: If you get an error "column barangay_id is already set to not null",
-- this is fine - the column is already set up correctly

-- Optional: Add a comment to document the field
COMMENT ON COLUMN public.reports.custom_location IS 
'For reports from barangays/sitios not in the predefined list. 
When this is filled, barangay_id should be NULL.
This allows users to report from locations not yet in the database.';

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'reports' 
  AND column_name IN ('barangay_id', 'custom_location');

-- Optional: Add an index for faster queries on custom_location
CREATE INDEX IF NOT EXISTS idx_reports_custom_location 
ON public.reports(custom_location);

-- Query to find all unique custom locations
SELECT DISTINCT custom_location 
FROM public.reports 
WHERE custom_location IS NOT NULL 
ORDER BY custom_location;
