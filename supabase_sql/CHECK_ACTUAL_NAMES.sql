-- CHECK WHAT MUNICIPALITY AND BARANGAY NAMES ACTUALLY EXIST IN DATABASE
-- Run this to see the exact spelling and format

-- Check all municipalities in barangays table
SELECT 'All municipalities in barangays table:' as info;
SELECT DISTINCT municipality 
FROM public.barangays 
ORDER BY municipality;

-- Check DIFFUN barangays (all variations)
SELECT 'All barangays with DIFFUN in municipality name:' as info;
SELECT municipality, name 
FROM public.barangays 
WHERE municipality ILIKE '%diffun%'
ORDER BY name
LIMIT 20;

-- Check Cabarroguis barangays
SELECT 'All Cabarroguis barangays:' as info;
SELECT municipality, name 
FROM public.barangays 
WHERE municipality ILIKE '%cabarroguis%'
ORDER BY name
LIMIT 20;

-- Check what's in barangay_households after our insert
SELECT 'What got inserted into barangay_households:' as info;
SELECT municipality, barangay_name, total_households
FROM public.barangay_households
WHERE municipality ILIKE '%diffun%' OR municipality ILIKE '%cabarroguis%'
ORDER BY municipality, barangay_name
LIMIT 20;

-- Check for exact case-sensitive municipality matches
SELECT 'Checking exact municipality names:' as info;
SELECT DISTINCT 
  municipality,
  municipality = 'DIFFUN, QUIRINO' as matches_diffun_quirino,
  municipality = 'Diffun' as matches_diffun,
  municipality = 'CABARROGUIS' as matches_cabarroguis_upper,
  municipality = 'Cabarroguis' as matches_cabarroguis_proper
FROM public.barangays
ORDER BY municipality;
