-- Check what's in both tables
SELECT 'barangay_household_updates' as table_name, COUNT(*) as count FROM public.barangay_household_updates
UNION ALL
SELECT 'barangay_households' as table_name, COUNT(*) as count FROM public.barangay_households;

-- Show sample data from updates
SELECT municipality, COUNT(*) FROM public.barangay_household_updates GROUP BY municipality ORDER BY municipality;

-- Show sample data from households
SELECT municipality, COUNT(*) FROM public.barangay_households GROUP BY municipality ORDER BY municipality;
