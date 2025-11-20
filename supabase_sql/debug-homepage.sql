-- Check what's in barangay_updates for Aglipay
SELECT barangay_id, barangay_name, power_status, is_published, created_at
FROM public.barangay_updates
WHERE municipality = 'Aglipay'
ORDER BY created_at DESC
LIMIT 20;

-- Check what's in barangay_household_updates for Aglipay
SELECT barangay_id, barangay_name, total_households, restored_households, updated_at
FROM public.barangay_household_updates
WHERE municipality = 'Aglipay' AND restored_households > 0
ORDER BY updated_at DESC;

-- Check what the homepage query would return for Aglipay barangays
SELECT b.id, b.name, b.municipality
FROM public.barangays b
WHERE b.municipality = 'Aglipay' AND b.is_active = true
ORDER BY b.name;

-- Check latest power status per barangay
SELECT DISTINCT ON (barangay_id) 
  barangay_id, 
  barangay_name, 
  power_status,
  created_at
FROM public.barangay_updates
WHERE municipality = 'Aglipay'
ORDER BY barangay_id, created_at DESC;
