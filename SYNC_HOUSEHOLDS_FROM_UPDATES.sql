-- Sync barangay_households from existing barangay_household_updates
-- This uses the actual data that's already in your barangay_household_updates table

-- Step 1: Clear old barangay_households data
DELETE FROM public.barangay_households;

-- Step 2: Insert from barangay_household_updates (get unique barangays with their total_households)
INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households)
SELECT DISTINCT ON (barangay_id)
  bhu.municipality,
  bhu.barangay_id,
  bhu.barangay_name,
  bhu.total_households
FROM public.barangay_household_updates bhu
ORDER BY bhu.barangay_id, bhu.updated_at DESC;

-- Step 3: Verify results
SELECT municipality, COUNT(*) as barangay_count, SUM(total_households) as total_households
FROM public.barangay_households 
GROUP BY municipality 
ORDER BY municipality;

-- Step 4: Show grand totals
SELECT COUNT(*) as total_barangays, SUM(total_households) as total_households 
FROM public.barangay_households;

-- Step 5: Verify data in the view
SELECT * FROM public.barangay_household_status LIMIT 10;
