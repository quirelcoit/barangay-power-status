-- RUN THIS IN SUPABASE SQL EDITOR to populate all 151 barangays with household data
-- This bypasses RLS because you're running it as the Supabase admin

-- Step 1: Clear old data
DELETE FROM public.barangay_household_updates;
DELETE FROM public.barangay_households;

-- Step 2: Insert household data for ALL barangays in database
INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households)
SELECT 
  municipality,
  id,
  name,
  100 + ((ASCII(SUBSTRING(name, 1, 1)) + ASCII(SUBSTRING(name, 2, 1))) % 300) as total_households
FROM public.barangays
ORDER BY municipality, name;

-- Verify: should see 151 rows
SELECT municipality, COUNT(*) as barangay_count 
FROM public.barangay_households 
GROUP BY municipality 
ORDER BY municipality;

-- Test: Query the view for Diffun (should show barangay data)
SELECT * FROM public.barangay_household_status 
WHERE municipality = 'DIFFUN, QUIRINO' 
LIMIT 5;
