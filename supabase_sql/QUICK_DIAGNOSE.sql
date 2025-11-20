-- Quick diagnostic to identify barangay name issues
-- Run these queries in Supabase SQL Editor one at a time

-- 1. Check if DIFFUN barangays exist and their exact names
SELECT id, name, municipality FROM public.barangays WHERE municipality LIKE '%DIFFUN%' ORDER BY name;

-- 2. Check count of records in barangay_households table
SELECT COUNT(*) as total_rows, COUNT(DISTINCT municipality) as unique_municipalities FROM public.barangay_households;

-- 3. Check which municipalities have data in barangay_households
SELECT municipality, COUNT(*) as barangay_count FROM public.barangay_households GROUP BY municipality ORDER BY municipality;

-- 4. Try querying the view for DIFFUN
SELECT municipality, barangay_name, total_households, restored_households FROM public.barangay_household_status WHERE municipality = 'DIFFUN, QUIRINO' ORDER BY barangay_name;

-- 5. Check all municipalities in barangays table
SELECT DISTINCT municipality FROM public.barangays ORDER BY municipality;
