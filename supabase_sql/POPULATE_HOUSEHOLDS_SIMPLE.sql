-- Step 1: Clear both tables
DELETE FROM public.barangay_household_updates;
DELETE FROM public.barangay_households;

-- Step 2: Insert all barangays from the barangays table into barangay_household_updates
INSERT INTO public.barangay_household_updates (municipality, barangay_id, barangay_name, total_households, restored_households, as_of_time)
SELECT 
  b.municipality,
  b.id,
  b.name,
  300,  -- total_households: default 300 per barangay
  0,  -- restored_households: starts at 0
  now()
FROM public.barangays b
ORDER BY b.municipality, b.name;

-- Step 3: Now populate barangay_households from barangay_household_updates
INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households)
SELECT DISTINCT ON (barangay_id)
  municipality,
  barangay_id,
  barangay_name,
  total_households
FROM public.barangay_household_updates
ORDER BY barangay_id, updated_at DESC;

-- Step 4: Verify by municipality
SELECT municipality, COUNT(*) as barangay_count, SUM(total_households) as total_households
FROM public.barangay_households 
GROUP BY municipality 
ORDER BY municipality;

-- Step 5: Grand totals
SELECT COUNT(*) as total_barangays, SUM(total_households) as total_households 
FROM public.barangay_households;
