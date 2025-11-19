-- Apply Nagtipunan Overrides for 5 Barangays
-- These barangays will have 0 total households but still count as energized for barangay-level stats
-- Affected barangays: Guino, La Conwap, Mataddi, Matmad, Old Gumiad

-- 1) Add override_energized column if it doesn't exist
ALTER TABLE public.barangay_household_overrides
  ADD COLUMN IF NOT EXISTS override_energized boolean DEFAULT false;

-- 2) Insert/update overrides for the 5 Nagtipunan barangays
-- Sets override_total_households = 0 and override_energized = true
WITH target AS (
  SELECT id AS barangay_id, municipality, name
  FROM public.barangays
  WHERE municipality = 'NAGTIPUNAN'
    AND name IN ('Guino', 'La Conwap', 'Mataddi', 'Matmad', 'Old Gumiad')
)
INSERT INTO public.barangay_household_overrides (barangay_id, override_total_households, override_energized, updated_at)
SELECT barangay_id, 0, true, now()
FROM target
ON CONFLICT (barangay_id) DO UPDATE
  SET override_total_households = EXCLUDED.override_total_households,
      override_energized = EXCLUDED.override_energized,
      updated_at = EXCLUDED.updated_at;

-- 3) Recreate barangay_household_status view to include override_energized
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

-- 4) Recreate household_status view (sums totals from barangay_household_status)
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

-- 5) Recreate municipality_status view to count override_energized OR restored_households > 0
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

-- Verification queries (run these after the above to confirm)
-- Check the 5 barangays have override_total_households = 0 and override_energized = true
-- SELECT bh.name, bho.override_total_households, bho.override_energized
-- FROM public.barangays bh
-- JOIN public.barangay_household_overrides bho ON bh.id = bho.barangay_id
-- WHERE bh.municipality = 'NAGTIPUNAN' 
--   AND bh.name IN ('Guino', 'La Conwap', 'Mataddi', 'Matmad', 'Old Gumiad');

-- Check household_status for Nagtipunan (total should be reduced)
-- SELECT * FROM public.household_status WHERE municipality = 'NAGTIPUNAN';

-- Check municipality_status for Nagtipunan (energized count should include the 5 barangays)
-- SELECT * FROM public.municipality_status WHERE municipality = 'NAGTIPUNAN';
