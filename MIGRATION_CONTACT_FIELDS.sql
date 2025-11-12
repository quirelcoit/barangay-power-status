-- Database Migration: Split contact_hint into separate fields
-- Run this in Supabase SQL Editor

-- Add new contact fields
ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS contact_name TEXT DEFAULT NULL;

ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS contact_number TEXT DEFAULT NULL;

-- Optional: Migrate existing contact_hint data if any exists
-- (This will try to split on comma, colon, or just use the whole value as name)
UPDATE public.reports
SET 
  contact_name = CASE
    WHEN contact_hint LIKE '%Name:%' THEN 
      TRIM(SPLIT_PART(SPLIT_PART(contact_hint, 'Name:', 2), ',', 1))
    WHEN contact_hint LIKE '%,%' THEN
      TRIM(SPLIT_PART(contact_hint, ',', 1))
    ELSE contact_hint
  END,
  contact_number = CASE
    WHEN contact_hint LIKE '%Contact:%' THEN 
      TRIM(SPLIT_PART(contact_hint, 'Contact:', 2))
    WHEN contact_hint LIKE '%,%' THEN
      TRIM(SPLIT_PART(contact_hint, ',', 2))
    ELSE NULL
  END
WHERE contact_hint IS NOT NULL AND contact_hint != '';

-- Optional: Drop old contact_hint column (uncomment if you want to remove it)
-- ALTER TABLE public.reports DROP COLUMN contact_hint;

-- Add comments
COMMENT ON COLUMN public.reports.contact_name IS 
'Contact person name (admin-only). Not shown publicly.';

COMMENT ON COLUMN public.reports.contact_number IS 
'Contact phone number (admin-only). Not shown publicly.';

-- Verify the columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'reports' 
  AND column_name IN ('contact_hint', 'contact_name', 'contact_number')
ORDER BY column_name;
