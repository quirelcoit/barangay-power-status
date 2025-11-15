-- EMERGENCY FIX: Manually insert energized status for Aglipay barangays with household restoration data
-- Run this directly in Supabase SQL Editor NOW

INSERT INTO public.barangay_updates (municipality, barangay_id, barangay_name, headline, power_status, is_published, updated_by)
SELECT 
  'Aglipay' as municipality,
  b.id as barangay_id,
  b.name as barangay_name,
  'Power restored to ' || b.name as headline,
  'energized' as power_status,
  true as is_published,
  (SELECT id FROM auth.users LIMIT 1) as updated_by
FROM public.barangays b
WHERE b.municipality = 'Aglipay'
  AND b.name IN (
    'Dungo (Osmeña)',
    'Ligaya',
    'Palacian',
    'Pinaripad Norte',
    'Pinaripad Sur',
    'Progreso (Pob.)',
    'San Leonardo',
    'Victoria',
    'Villa Santiago',
    'Villa Ventura'
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.barangay_updates bu
    WHERE bu.barangay_id = b.id
      AND bu.power_status = 'energized'
      AND bu.is_published = true
  );

-- Verify the inserts
SELECT COUNT(*) as energized_count
FROM public.barangay_updates
WHERE municipality = 'Aglipay' 
  AND power_status = 'energized'
  AND is_published = true;
