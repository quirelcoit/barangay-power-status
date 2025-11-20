-- Check the EXACT names of Nagtipunan barangays in the database
SELECT id, name, municipality 
FROM public.barangays 
WHERE municipality LIKE '%NAGTIPUNAN%'
ORDER BY name;
