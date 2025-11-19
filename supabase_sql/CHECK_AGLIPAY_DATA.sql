-- SIMPLE: Show me all Aglipay barangays with their latest restored_households value
WITH latest_data AS (
  SELECT DISTINCT ON (barangay_id)
    barangay_id,
    barangay_name,
    restored_households,
    total_households,
    updated_at
  FROM barangay_household_updates
  WHERE municipality = 'Aglipay'
  ORDER BY barangay_id, updated_at DESC
)
SELECT 
  barangay_name,
  restored_households,
  total_households,
  CASE WHEN restored_households > 0 THEN '✅ ENERGIZED' ELSE '❌ NOT ENERGIZED' END as status
FROM latest_data
ORDER BY barangay_name;

-- Count energized
WITH latest_data AS (
  SELECT DISTINCT ON (barangay_id)
    barangay_id,
    restored_households
  FROM barangay_household_updates
  WHERE municipality = 'Aglipay'
  ORDER BY barangay_id, updated_at DESC
)
SELECT COUNT(*) as energized_count
FROM latest_data
WHERE restored_households > 0;
