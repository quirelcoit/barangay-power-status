-- Check what's currently in the database for Diffun
SELECT '=== Current barangays table for DIFFUN ===' as check;
SELECT id, name, municipality FROM public.barangays 
WHERE municipality = 'DIFFUN, QUIRINO' 
ORDER BY name;

SELECT '=== Current barangay_households for DIFFUN ===' as check;
SELECT barangay_name, total_households FROM public.barangay_households 
WHERE municipality = 'DIFFUN' OR municipality = 'DIFFUN, QUIRINO'
ORDER BY barangay_name;

SELECT '=== Current barangay_household_status for DIFFUN ===' as check;
SELECT barangay_name, total_households, baseline_total_households, manual_total_households FROM public.barangay_household_status 
WHERE municipality = 'DIFFUN' OR municipality = 'DIFFUN, QUIRINO'
ORDER BY barangay_name;

SELECT '=== Row count check ===' as check;
SELECT 
  (SELECT COUNT(*) FROM public.barangays WHERE municipality = 'DIFFUN, QUIRINO') as diffun_barangays_count,
  (SELECT COUNT(*) FROM public.barangay_households WHERE municipality = 'DIFFUN' OR municipality = 'DIFFUN, QUIRINO') as diffun_households_count;
