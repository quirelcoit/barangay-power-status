-- UPDATE municipality_status AND household_status views to count from household restoration data
-- Run this in Supabase SQL editor

-- 1. Drop and recreate municipality_status view
DROP VIEW IF EXISTS municipality_status;

CREATE VIEW municipality_status AS
WITH latest_household_data AS (
  SELECT DISTINCT ON (barangay_id)
    municipality,
    barangay_id,
    restored_households,
    total_households,
    updated_at as as_of_time
  FROM barangay_household_updates
  ORDER BY barangay_id, updated_at DESC
),
municipality_counts AS (
  SELECT 
    b.municipality,
    COUNT(DISTINCT b.id) as total_barangays,
    COUNT(DISTINCT CASE WHEN h.restored_households > 0 THEN b.id END) as energized_barangays,
    0 as partial_barangays,
    COUNT(DISTINCT CASE WHEN h.restored_households = 0 OR h.restored_households IS NULL THEN b.id END) as no_power_barangays,
    MAX(h.as_of_time) as as_of_time,
    MAX(h.as_of_time) as last_updated
  FROM barangays b
  LEFT JOIN latest_household_data h ON b.id = h.barangay_id
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
    WHEN total_barangays > 0 THEN ROUND((energized_barangays::numeric / total_barangays::numeric) * 100, 2)
    ELSE 0 
  END as percent_energized,
  as_of_time,
  last_updated
FROM municipality_counts;

-- 2. Drop and recreate household_status view  
DROP VIEW IF EXISTS household_status;

CREATE VIEW household_status AS
WITH latest_household_data AS (
  SELECT DISTINCT ON (barangay_id)
    municipality,
    barangay_id,
    total_households,
    restored_households,
    updated_at
  FROM barangay_household_updates
  ORDER BY barangay_id, updated_at DESC
)
SELECT 
  municipality,
  SUM(total_households) as total_households,
  SUM(restored_households) as energized_households,
  CASE 
    WHEN SUM(total_households) > 0 
    THEN ROUND((SUM(restored_households)::numeric / SUM(total_households)::numeric) * 100, 2)
    ELSE 0 
  END as percent_energized,
  MAX(updated_at) as as_of_time,
  MAX(updated_at) as updated_at
FROM latest_household_data
GROUP BY municipality;
