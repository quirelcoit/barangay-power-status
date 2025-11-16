-- UPDATE municipality_status view to count from household restoration data
-- Run this in Supabase SQL editor

-- First, let's see what the current view definition is
-- (This is just to check - you might need to recreate the view)

-- Drop and recreate the municipality_status view to use household data
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
    WHEN total_barangays > 0 THEN ROUND((energized_barangays::numeric / total_barangays::numeric) * 100, 1)
    ELSE 0 
  END as percent_energized,
  as_of_time,
  last_updated
FROM municipality_counts;
