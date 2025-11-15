-- Just populate barangay_households from barangay_household_updates
-- This assumes barangay_household_updates is already populated

DELETE FROM public.barangay_households;

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households)
SELECT DISTINCT ON (barangay_id)
  municipality,
  barangay_id,
  barangay_name,
  total_households
FROM public.barangay_household_updates
ORDER BY barangay_id, updated_at DESC;

-- Verify by municipality
SELECT municipality, COUNT(*) as barangay_count, SUM(total_households) as total_households
FROM public.barangay_households 
GROUP BY municipality 
ORDER BY municipality;

-- Grand totals
SELECT COUNT(*) as total_barangays, SUM(total_households) as total_households 
FROM public.barangay_households;

-- Check the view
SELECT * FROM public.barangay_household_status LIMIT 20;
