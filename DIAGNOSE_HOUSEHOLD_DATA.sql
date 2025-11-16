-- Diagnostic query to check actual household data in barangay_household_updates table
-- Run this in Supabase SQL editor to see what the views should be calculating

-- 1. Check latest household data per barangay (what the view should use)
SELECT 
  municipality,
  barangay_id,
  barangay_name,
  total_households,
  restored_households,
  updated_at
FROM (
  SELECT DISTINCT ON (barangay_id)
    municipality,
    barangay_id,
    barangay_name,
    total_households,
    restored_households,
    updated_at
  FROM barangay_household_updates
  ORDER BY barangay_id, updated_at DESC
) latest
ORDER BY municipality, barangay_name;

-- 2. Check totals per municipality (what household_status view should show)
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
  COUNT(*) as barangay_count,
  SUM(total_households) as total_households,
  SUM(restored_households) as energized_households,
  ROUND((SUM(restored_households)::numeric / SUM(total_households)::numeric) * 100, 2) as percent_energized
FROM latest_household_data
GROUP BY municipality
ORDER BY municipality;

-- 3. Check for duplicate entries (debugging)
SELECT 
  municipality,
  barangay_id,
  barangay_name,
  COUNT(*) as entry_count,
  array_agg(total_households ORDER BY updated_at DESC) as all_totals,
  array_agg(restored_households ORDER BY updated_at DESC) as all_restored
FROM barangay_household_updates
GROUP BY municipality, barangay_id, barangay_name
HAVING COUNT(*) > 1
ORDER BY municipality, barangay_name;

-- 4. Check what household_status view is currently showing
SELECT * FROM household_status ORDER BY municipality;
