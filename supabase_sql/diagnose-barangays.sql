-- First, let's see what barangays actually exist in each municipality
-- This will help us understand the naming issues

-- San Agustin
SELECT name FROM public.barangays WHERE municipality = 'SAN AGUSTIN, ISABELA' ORDER BY name;

-- Diffun
SELECT name FROM public.barangays WHERE municipality = 'DIFFUN, QUIRINO' ORDER BY name;

-- Aglipay
SELECT name FROM public.barangays WHERE municipality = 'AGLIPAY, QUIRINO' ORDER BY name;

-- Cabarroguis
SELECT name FROM public.barangays WHERE municipality = 'CABARROGUIS, QUIRINO' ORDER BY name;

-- Maddela
SELECT name FROM public.barangays WHERE municipality = 'MADDELA, QUIRINO' ORDER BY name;

-- Nagtipunan
SELECT name FROM public.barangays WHERE municipality = 'NAGTIPUNAN, QUIRINO' ORDER BY name;

-- Saguday
SELECT name FROM public.barangays WHERE municipality = 'SAGUDAY, QUIRINO' ORDER BY name;
