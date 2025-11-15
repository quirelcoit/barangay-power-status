-- SIMPLE FIX: Just populate the household tables from existing barangays
-- No need to touch the barangays table at all

-- Step 1: Clear old household data
DELETE FROM public.barangay_households;
DELETE FROM public.barangay_household_updates;

-- Step 2: Insert into barangay_household_updates from existing barangays
INSERT INTO public.barangay_household_updates (municipality, barangay_id, barangay_name, total_households, restored_households, as_of_time)
SELECT 
  b.municipality,
  b.id,
  b.name,
  300,  -- default 300 households per barangay
  0,    -- starts with 0 restored
  now()
FROM public.barangays b;

-- Step 3: Sync to barangay_households from the updates
INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households)
SELECT DISTINCT ON (barangay_id)
  municipality,
  barangay_id,
  barangay_name,
  total_households
FROM public.barangay_household_updates
ORDER BY barangay_id, updated_at DESC;

-- Step 4: VERIFY RESULTS
SELECT '=== Barangays by Municipality ===' as check;
SELECT municipality, COUNT(*) as barangay_count, SUM(total_households) as total_households
FROM public.barangay_households 
GROUP BY municipality 
ORDER BY municipality;

SELECT '=== Grand Totals ===' as check;
SELECT COUNT(*) as total_barangays, SUM(total_households) as total_households 
FROM public.barangay_households;

SELECT '=== Sample from SAN AGUSTIN, ISABELA ===' as check;
SELECT barangay_name, total_households 
FROM public.barangay_household_status 
WHERE municipality = 'SAN AGUSTIN, ISABELA'
ORDER BY barangay_name;
