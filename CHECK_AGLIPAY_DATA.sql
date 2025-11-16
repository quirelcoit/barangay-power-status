-- Find out EXACTLY what's in the database for Aglipay
SELECT 
  barangay_id,
  barangay_name,
  restored_households,
  total_households,
  updated_at
FROM barangay_household_updates
WHERE municipality = 'Aglipay'
ORDER BY barangay_name, updated_at DESC;

-- Count ALL rows for Aglipay
SELECT COUNT(*) as total_rows
FROM barangay_household_updates
WHERE municipality = 'Aglipay';

-- Count unique barangays (total)
SELECT COUNT(DISTINCT barangay_id) as unique_barangays
FROM barangay_household_updates
WHERE municipality = 'Aglipay';

-- Count unique barangays with restored > 0
SELECT COUNT(DISTINCT barangay_id) as energized_count
FROM barangay_household_updates
WHERE municipality = 'Aglipay' AND restored_households > 0;

-- Find duplicates
SELECT barangay_id, barangay_name, COUNT(*) as duplicate_count
FROM barangay_household_updates
WHERE municipality = 'Aglipay'
GROUP BY barangay_id, barangay_name
HAVING COUNT(*) > 1;
