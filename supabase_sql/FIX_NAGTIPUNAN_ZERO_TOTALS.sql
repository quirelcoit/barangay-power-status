-- Fix Nagtipunan barangays: allow zero household overrides but still count as energized
-- Run everything below in the Supabase SQL editor (single transaction not required)

-- 1) Relax the override constraint so zero totals are accepted
ALTER TABLE public.barangay_household_overrides
  DROP CONSTRAINT IF EXISTS barangay_household_overrides_override_total_households_check;

ALTER TABLE public.barangay_household_overrides
  ADD CONSTRAINT barangay_household_overrides_override_total_households_check
  CHECK (override_total_households >= 0);

-- 2) Make sure the energized flag column exists for manual tagging
ALTER TABLE public.barangay_household_overrides
  ADD COLUMN IF NOT EXISTS override_energized boolean DEFAULT false;

-- 3) Upsert overrides for the five Nagtipunan barangays
WITH target AS (
  SELECT id AS barangay_id
  FROM public.barangays
  WHERE municipality ILIKE '%Nagtipunan%'
    AND name IN ('Guino', 'La Conwap', 'Mataddi', 'Matmad', 'Old Gumiad')
)
INSERT INTO public.barangay_household_overrides (barangay_id, override_total_households, override_energized, updated_at)
SELECT barangay_id, 0, true, now()
FROM target
ON CONFLICT (barangay_id) DO UPDATE
  SET override_total_households = EXCLUDED.override_total_households,
      override_energized = EXCLUDED.override_energized,
      updated_at = EXCLUDED.updated_at;

-- 4) Recreate barangay_household_status view to avoid divide-by-zero and expose override flag
DROP VIEW IF EXISTS public.barangay_household_status CASCADE;
CREATE VIEW public.barangay_household_status AS
WITH ranked_updates AS (
  SELECT 
    id,
    municipality,
    barangay_id,
    barangay_name,
    total_households,
    restored_households,
    as_of_time,
    updated_at,
    ROW_NUMBER() OVER (PARTITION BY barangay_id ORDER BY updated_at DESC, id DESC) AS rn
  FROM public.barangay_household_updates
  WHERE is_published = true
)
SELECT 
  bh.municipality,
  bh.barangay_id,
  bh.barangay_name,
  COALESCE(bho.override_total_households, bh.total_households) AS total_households,
  bho.override_total_households AS manual_total_households,
  bh.total_households AS baseline_total_households,
  COALESCE(bhu.restored_households, 0) AS restored_households,
  COALESCE(bho.override_total_households, bh.total_households) - COALESCE(bhu.restored_households, 0) AS for_restoration_households,
  CASE 
    WHEN COALESCE(bho.override_total_households, bh.total_households) > 0 THEN
      ROUND((COALESCE(bhu.restored_households, 0)::numeric / COALESCE(bho.override_total_households, bh.total_households)::numeric) * 100, 2)
    ELSE 0
  END AS percent_restored,
  COALESCE(bho.override_energized, false) AS override_energized,
  bhu.as_of_time,
  bhu.updated_at AS last_updated
FROM public.barangay_households bh
LEFT JOIN (SELECT * FROM ranked_updates WHERE rn = 1) bhu ON bh.barangay_id = bhu.barangay_id
LEFT JOIN public.barangay_household_overrides bho ON bh.barangay_id = bho.barangay_id
ORDER BY bh.municipality, bh.barangay_name;

-- 5) Recreate household_status (aggregated view)
DROP VIEW IF EXISTS public.household_status;
CREATE VIEW public.household_status AS
SELECT 
  municipality,
  SUM(total_households) AS total_households,
  SUM(restored_households) AS energized_households,
  CASE 
    WHEN SUM(total_households) > 0 THEN
      ROUND((SUM(restored_households)::numeric / NULLIF(SUM(total_households), 0)::numeric) * 100, 2)
    ELSE 0
  END AS percent_energized,
  MAX(last_updated) AS as_of_time,
  MAX(last_updated) AS updated_at
FROM public.barangay_household_status
GROUP BY municipality;

-- 6) Recreate municipality_status so override_energized counts as energized barangay
DROP VIEW IF EXISTS public.municipality_status;
CREATE VIEW public.municipality_status AS
WITH barangay_counts AS (
  SELECT 
    b.municipality,
    COUNT(DISTINCT b.id) AS total_barangays,
    COUNT(DISTINCT CASE 
      WHEN COALESCE(bhs.override_energized, false) = true 
        OR COALESCE(bhs.restored_households, 0) > 0 
      THEN b.id 
    END) AS energized_barangays,
    0 AS partial_barangays,
    COUNT(DISTINCT CASE 
      WHEN COALESCE(bhs.override_energized, false) = false 
        AND COALESCE(bhs.restored_households, 0) = 0 
      THEN b.id 
    END) AS no_power_barangays,
    MAX(bhs.last_updated) AS as_of_time,
    MAX(bhs.last_updated) AS last_updated
  FROM public.barangays b
  LEFT JOIN public.barangay_household_status bhs ON b.id = bhs.barangay_id
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
    WHEN total_barangays > 0 THEN
      ROUND((energized_barangays::numeric / total_barangays::numeric) * 100, 2)
    ELSE 0 
  END AS percent_energized,
  as_of_time,
  last_updated
FROM barangay_counts;

-- 7) Quick verification helpers
SELECT '✅ Overrides created (should show the five Nagtipunan barangays):' AS status;
SELECT b.name, b.municipality, bho.override_total_households, bho.override_energized
FROM public.barangays b
JOIN public.barangay_household_overrides bho ON b.id = bho.barangay_id
WHERE b.municipality ILIKE '%Nagtipunan%'
  AND b.name IN ('Guino', 'La Conwap', 'Mataddi', 'Matmad', 'Old Gumiad')
ORDER BY b.name;

SELECT '✅ Municipality rollup (expect 16 total / 13 energized):' AS status;
SELECT * FROM public.municipality_status WHERE municipality ILIKE '%Nagtipunan%';

SELECT '✅ Barangay detail snapshot:' AS status;
SELECT barangay_name, total_households, restored_households, override_energized
FROM public.barangay_household_status
WHERE municipality ILIKE '%Nagtipunan%'
ORDER BY barangay_name;
