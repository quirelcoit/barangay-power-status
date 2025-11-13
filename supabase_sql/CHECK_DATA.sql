-- VERIFY ACTUAL DATA IN TABLE

-- Check ALL barangays (ignore is_active)
SELECT COUNT(*) as total_all FROM public.barangays;

-- Check only is_active = true
SELECT COUNT(*) as total_active_true FROM public.barangays WHERE is_active = true;

-- Check only is_active = false
SELECT COUNT(*) as total_active_false FROM public.barangays WHERE is_active = false;

-- Check NULL values for is_active
SELECT COUNT(*) as total_active_null FROM public.barangays WHERE is_active IS NULL;

-- Show first 10 rows with all columns
SELECT * FROM public.barangays LIMIT 10;

-- Show structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'barangays';
