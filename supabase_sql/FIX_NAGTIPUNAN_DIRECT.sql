-- DIRECT FIX: Update barangay_households table for Nagtipunan barangays
-- This is what actually worked - updating the data directly, not using overrides

-- Step 1: Check current data
SELECT 'Current Nagtipunan barangay_households:' as info;
SELECT barangay_name, total_households 
FROM public.barangay_households 
WHERE municipality LIKE '%NAGTIPUNAN%'
ORDER BY barangay_name;

-- Step 2: Update the 4 barangays to 0 (Matmad is already 0)
-- Using LIKE to match barangay names flexibly
UPDATE public.barangay_households
SET total_households = 0, updated_at = now()
WHERE municipality LIKE '%NAGTIPUNAN%'
  AND (
    barangay_name LIKE '%Guino%' OR
    barangay_name LIKE '%La Conwap%' OR
    barangay_name LIKE '%Mataddi%' OR
    barangay_name LIKE '%Old Gumiad%'
  );

-- Step 3: Also update barangay_household_updates to match
UPDATE public.barangay_household_updates
SET total_households = 0, updated_at = now()
WHERE municipality LIKE '%NAGTIPUNAN%'
  AND (
    barangay_name LIKE '%Guino%' OR
    barangay_name LIKE '%La Conwap%' OR
    barangay_name LIKE '%Mataddi%' OR
    barangay_name LIKE '%Old Gumiad%'
  );

-- Step 4: Now add the override_energized logic
-- First add the column
ALTER TABLE public.barangay_household_overrides
  ADD COLUMN IF NOT EXISTS override_energized boolean DEFAULT false;

-- Insert overrides for the 5 barangays to mark them as energized
WITH target AS (
  SELECT id AS barangay_id
  FROM public.barangays
  WHERE municipality LIKE '%NAGTIPUNAN%'
    AND (
      name LIKE '%Guino%' OR
      name LIKE '%La Conwap%' OR
      name LIKE '%Mataddi%' OR
      name LIKE '%Matmad%' OR
      name LIKE '%Old Gumiad%'
    )
)
INSERT INTO public.barangay_household_overrides (barangay_id, override_total_households, override_energized, updated_at)
SELECT barangay_id, 0, true, now()
FROM target
ON CONFLICT (barangay_id) DO UPDATE
  SET override_total_households = EXCLUDED.override_total_households,
      override_energized = EXCLUDED.override_energized,
      updated_at = EXCLUDED.updated_at;

-- Step 5: Update the views (only if they don't already have override_energized support)
DROP VIEW IF EXISTS public.barangay_household_status CASCADE;
CREATE VIEW public.barangay_household_status AS
WITH ranked_updates AS (
  SELECT 
    id, municipality, barangay_id, barangay_name, total_households,
    restored_households, as_of_time, updated_at,
    ROW_NUMBER() OVER (PARTITION BY barangay_id ORDER BY updated_at DESC, id DESC) as rn
  FROM public.barangay_household_updates
  WHERE is_published = true
)
SELECT 
  bh.municipality,
  bh.barangay_id,
  bh.barangay_name,
  COALESCE(bho.override_total_households, bh.total_households) as total_households,
  bho.override_total_households as manual_total_households,
  bh.total_households as baseline_total_households,
  COALESCE(bhu.restored_households, 0) as restored_households,
  COALESCE(bho.override_total_households, bh.total_households) - COALESCE(bhu.restored_households, 0) as for_restoration_households,
  CASE 
    WHEN COALESCE(bho.override_total_households, bh.total_households) > 0 
    THEN ROUND((COALESCE(bhu.restored_households, 0)::numeric / COALESCE(bho.override_total_households, bh.total_households)::numeric) * 100, 2)
    ELSE 0 
  END as percent_restored,
  COALESCE(bho.override_energized, false) as override_energized,
  bhu.as_of_time,
  bhu.updated_at as last_updated
FROM public.barangay_households bh
LEFT JOIN (SELECT * FROM ranked_updates WHERE rn = 1) bhu ON bh.barangay_id = bhu.barangay_id
LEFT JOIN public.barangay_household_overrides bho ON bh.barangay_id = bho.barangay_id
ORDER BY bh.municipality, bh.barangay_name;

DROP VIEW IF EXISTS public.household_status;
CREATE VIEW public.household_status AS
SELECT 
  municipality,
  SUM(total_households) as total_households,
  SUM(restored_households) as energized_households,
  CASE 
    WHEN SUM(total_households) > 0 
    THEN ROUND((SUM(restored_households)::numeric / SUM(total_households)::numeric) * 100, 2)
    ELSE 0 
  END as percent_energized,
  MAX(last_updated) as as_of_time,
  MAX(last_updated) as updated_at
FROM public.barangay_household_status
GROUP BY municipality;

DROP VIEW IF EXISTS public.municipality_status;
CREATE VIEW public.municipality_status AS
WITH barangay_counts AS (
  SELECT 
    b.municipality,
    COUNT(DISTINCT b.id) as total_barangays,
    COUNT(DISTINCT CASE 
      WHEN COALESCE(bhs.override_energized, false) = true 
        OR COALESCE(bhs.restored_households, 0) > 0 
      THEN b.id 
    END) as energized_barangays,
    0 as partial_barangays,
    COUNT(DISTINCT CASE 
      WHEN COALESCE(bhs.override_energized, false) = false 
        AND COALESCE(bhs.restored_households, 0) = 0 
      THEN b.id 
    END) as no_power_barangays,
    MAX(bhs.last_updated) as as_of_time,
    MAX(bhs.last_updated) as last_updated
  FROM barangays b
  LEFT JOIN barangay_household_status bhs ON b.id = bhs.barangay_id
  WHERE b.is_active = true
  GROUP BY b.municipality
)
SELECT 
  municipality,
  total_barangays,
  energized_barangays,
  partial_barangays,
  no_power_barangays,
  CASE 
    WHEN total_barangays > 0 
    THEN ROUND((energized_barangays::numeric / total_barangays::numeric) * 100, 2)
    ELSE 0 
  END as percent_energized,
  as_of_time,
  last_updated
FROM barangay_counts;

-- VERIFICATION
SELECT '✅ Updated barangays (should show 0):' as status;
SELECT barangay_name, total_households 
FROM public.barangay_households 
WHERE municipality LIKE '%NAGTIPUNAN%'
  AND (
    barangay_name LIKE '%Guino%' OR
    barangay_name LIKE '%La Conwap%' OR
    barangay_name LIKE '%Mataddi%' OR
    barangay_name LIKE '%Matmad%' OR
    barangay_name LIKE '%Old Gumiad%'
  )
ORDER BY barangay_name;

SELECT '✅ Overrides created (should show 5 rows with override_energized = true):' as status;
SELECT b.name, bho.override_total_households, bho.override_energized
FROM public.barangays b
JOIN public.barangay_household_overrides bho ON b.id = bho.barangay_id
WHERE b.municipality LIKE '%NAGTIPUNAN%';

SELECT '✅ Municipality status (should show 16 total, 13 energized):' as status;
SELECT * FROM public.municipality_status WHERE municipality LIKE '%NAGTIPUNAN%';

SELECT '✅ All Nagtipunan barangays:' as status;
SELECT barangay_name, total_households, restored_households, override_energized
FROM public.barangay_household_status
WHERE municipality LIKE '%NAGTIPUNAN%'
ORDER BY barangay_name;
