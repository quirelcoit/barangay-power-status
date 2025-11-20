-- ============================================================================
-- DEBUG: Why does Aglipay show 9 energized instead of 10?
-- ============================================================================

-- 1. Check how many barangays have household restoration data for Aglipay
SELECT 'Aglipay barangays WITH household data:' as check;
SELECT COUNT(*) as count_with_household_data
FROM barangay_household_updates
WHERE municipality = 'Aglipay' AND restored_households > 0;

-- 2. Check how many are marked as energized in barangay_updates for Aglipay
SELECT 'Aglipay barangays marked ENERGIZED in barangay_updates:' as check;
SELECT COUNT(*) as count_energized
FROM barangay_updates bu
JOIN barangays b ON bu.barangay_id = b.id
WHERE b.municipality = 'Aglipay' 
  AND bu.power_status = 'energized' 
  AND bu.is_published = true;

-- 3. List which barangays have household data
SELECT 'Barangays WITH household restoration data:' as check;
SELECT barangay_name, restored_households, total_households
FROM barangay_household_updates
WHERE municipality = 'Aglipay' AND restored_households > 0
ORDER BY barangay_name;

-- 4. List which barangays are marked as energized
SELECT 'Barangays marked as ENERGIZED:' as check;
SELECT b.name as barangay_name, bu.headline, bu.created_at
FROM barangay_updates bu
JOIN barangays b ON bu.barangay_id = b.id
WHERE b.municipality = 'Aglipay' 
  AND bu.power_status = 'energized' 
  AND bu.is_published = true
ORDER BY b.name;

-- 5. Find which barangay has household data but is NOT marked energized
SELECT 'Barangays with household data but NOT energized:' as check;
SELECT bhu.barangay_name
FROM barangay_household_updates bhu
WHERE bhu.municipality = 'Aglipay' 
  AND bhu.restored_households > 0
  AND NOT EXISTS (
    SELECT 1 
    FROM barangay_updates bu
    WHERE bu.barangay_id = bhu.barangay_id
      AND bu.power_status = 'energized'
      AND bu.is_published = true
  )
ORDER BY bhu.barangay_name;
