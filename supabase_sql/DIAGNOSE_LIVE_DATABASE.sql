-- DIAGNOSTIC QUERIES FOR LIVE DATABASE
-- Run these in Supabase SQL Editor to check current state

-- ============================================================================
-- CHECK 1: What municipalities exist in barangays table?
-- ============================================================================
SELECT 'CHECK 1: Municipality names in barangays table' as info;
SELECT DISTINCT municipality, COUNT(*) as barangay_count
FROM public.barangays
GROUP BY municipality
ORDER BY municipality;

-- ============================================================================
-- CHECK 2: What data is in barangay_households table?
-- ============================================================================
SELECT 'CHECK 2: Data in barangay_households table' as info;
SELECT municipality, COUNT(*) as count, MIN(total_households) as min_hh, MAX(total_households) as max_hh
FROM public.barangay_households
GROUP BY municipality
ORDER BY municipality;

-- ============================================================================
-- CHECK 3: Sample DIFFUN data from barangay_households
-- ============================================================================
SELECT 'CHECK 3: Sample DIFFUN barangays from barangay_households' as info;
SELECT municipality, barangay_name, total_households
FROM public.barangay_households
WHERE municipality LIKE '%DIFFUN%' OR municipality LIKE '%Diffun%'
ORDER BY barangay_name
LIMIT 10;

-- ============================================================================
-- CHECK 4: What does the view return for DIFFUN?
-- ============================================================================
SELECT 'CHECK 4: What barangay_household_status view returns for DIFFUN' as info;
SELECT municipality, barangay_name, total_households, baseline_total_households
FROM public.barangay_household_status
WHERE municipality LIKE '%DIFFUN%' OR municipality LIKE '%Diffun%'
ORDER BY barangay_name
LIMIT 10;

-- ============================================================================
-- CHECK 5: How many rows showing 300 default?
-- ============================================================================
SELECT 'CHECK 5: Count of barangays with 300 total_households' as info;
SELECT municipality, COUNT(*) as count_300
FROM public.barangay_households
WHERE total_households = 300
GROUP BY municipality
ORDER BY municipality;

-- ============================================================================
-- CHECK 6: Check barangay_household_updates table
-- ============================================================================
SELECT 'CHECK 6: Data in barangay_household_updates table' as info;
SELECT municipality, COUNT(*) as count, MIN(total_households) as min_hh, MAX(total_households) as max_hh
FROM public.barangay_household_updates
GROUP BY municipality
ORDER BY municipality;

-- ============================================================================
-- CHECK 7: Check if RUN_NOW_IN_SUPABASE.sql was ever executed
-- ============================================================================
SELECT 'CHECK 7: Looking for expected DIFFUN values (155, 1820, 562, 768)' as info;
SELECT barangay_name, total_households
FROM public.barangay_households
WHERE municipality LIKE '%DIFFUN%'
AND barangay_name IN ('AKLAN VILLAGE', 'ANDRES BONIFACIO', 'AURORA EAST (POB.)', 'AURORA WEST (POB.)')
ORDER BY barangay_name;
