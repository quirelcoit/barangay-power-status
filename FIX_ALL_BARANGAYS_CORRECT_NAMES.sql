-- ============================================================================
-- FIX BARANGAY HOUSEHOLD TOTALS - CORRECT MUNICIPALITY NAMES
-- This uses the ACTUAL municipality names from your database
-- ============================================================================

-- Clear existing data
DELETE FROM public.barangay_household_overrides;
DELETE FROM public.barangay_households;
DELETE FROM public.barangay_household_updates;

-- Insert with CORRECT municipality names matching your database
WITH provided_totals(municipality, barangay_name, total_households) AS (
  VALUES
    -- SAN AGUSTIN, ISABELA (18 barangays)
    ('SAN AGUSTIN, ISABELA','Bautista',247),
    ('SAN AGUSTIN, ISABELA','Calaocan',85),
    ('SAN AGUSTIN, ISABELA','Dabubu Grande',429),
    ('SAN AGUSTIN, ISABELA','Dabubu Pequeño',183),
    ('SAN AGUSTIN, ISABELA','Dappig',169),
    ('SAN AGUSTIN, ISABELA','Laoag',282),
    ('SAN AGUSTIN, ISABELA','Mapalad',362),
    ('SAN AGUSTIN, ISABELA','Palacian',325),
    ('SAN AGUSTIN, ISABELA','Panang',201),
    ('SAN AGUSTIN, ISABELA','Quimalabasa Norte',174),
    ('SAN AGUSTIN, ISABELA','Quimalabasa Sur',139),
    ('SAN AGUSTIN, ISABELA','Rang-ay',116),
    ('SAN AGUSTIN, ISABELA','Salay',256),
    ('SAN AGUSTIN, ISABELA','San Antonio',132),
    ('SAN AGUSTIN, ISABELA','Santo Niño',475),
    ('SAN AGUSTIN, ISABELA','Sinaoangan Norte',149),
    ('SAN AGUSTIN, ISABELA','Sinaoangan Sur',170),
    ('SAN AGUSTIN, ISABELA','Virgoneza',300),
    -- Aglipay (25 barangays)
    ('Aglipay','Alicia',252),
    ('Aglipay','Cabugao',116),
    ('Aglipay','Dagupan',310),
    ('Aglipay','Diodol',121),
    ('Aglipay','Dumabel',259),
    ('Aglipay','Dungo (Osmeña)',261),
    ('Aglipay','Guinalbin',251),
    ('Aglipay','Ligaya',514),
    ('Aglipay','Nagabgaban',140),
    ('Aglipay','Palacian',499),
    ('Aglipay','Pinaripad Norte',354),
    ('Aglipay','Pinaripad Sur',373),
    ('Aglipay','Progreso (Pob.)',322),
    ('Aglipay','Ramos',193),
    ('Aglipay','Rang-ayan',74),
    ('Aglipay','San Antonio',132),
    ('Aglipay','San Benigno',339),
    ('Aglipay','San Francisco',431),
    ('Aglipay','San Leonardo',833),
    ('Aglipay','San Manuel',167),
    ('Aglipay','San Ramon',156),
    ('Aglipay','Victoria',368),
    ('Aglipay','Villa Pagaduan',243),
    ('Aglipay','Villa Santiago',418),
    ('Aglipay','Villa Ventura',182),
    -- Cabarroguis (17 barangays)
    ('Cabarroguis','Banuar',237),
    ('Cabarroguis','Burgos',1017),
    ('Cabarroguis','Calaocan',181),
    ('Cabarroguis','Del Pilar',145),
    ('Cabarroguis','Dibibi',741),
    ('Cabarroguis','Dingasan',349),
    ('Cabarroguis','Eden',210),
    ('Cabarroguis','Gomez',127),
    ('Cabarroguis','Gundaway (Pob.)',1417),
    ('Cabarroguis','Mangandingay (Pob.)',1039),
    ('Cabarroguis','San Marcos',977),
    ('Cabarroguis','Santo Domingo',226),
    ('Cabarroguis','Tucod',406),
    ('Cabarroguis','Villa Peña',126),
    ('Cabarroguis','Villamor',700),
    ('Cabarroguis','Villarose',152),
    ('Cabarroguis','Zamora',1154),
    -- Diffun (33 barangays)
    ('Diffun','Aklan Village',155),
    ('Diffun','Andres Bonifacio',1820),
    ('Diffun','Aurora East (Pob.)',562),
    ('Diffun','Aurora West (Pob.)',768),
    ('Diffun','Baguio Village',295),
    ('Diffun','Balagbag',498),
    ('Diffun','Bannawag',738),
    ('Diffun','Cajel',626),
    ('Diffun','Campamento',326),
    ('Diffun','Diego Silang',291),
    ('Diffun','Don Faustino Pagaduan',91),
    ('Diffun','Don Mariano Perez, Sr.',195),
    ('Diffun','Doña Imelda',149),
    ('Diffun','Dumanisi',461),
    ('Diffun','Gabriela Silang',473),
    ('Diffun','Gregorio Pimentel',157),
    ('Diffun','Gulac',417),
    ('Diffun','Guribang',473),
    ('Diffun','Ifugao Village',311),
    ('Diffun','Isidro Paredes',475),
    ('Diffun','Liwayway',734),
    ('Diffun','Luttuad',457),
    ('Diffun','Magsaysay',232),
    ('Diffun','Makate',151),
    ('Diffun','Maria Clara',539),
    ('Diffun','Rafael Palma (Don Sergio Osmeña)',145),
    ('Diffun','Ricarte Norte',448),
    ('Diffun','Ricarte Sur',227),
    ('Diffun','Rizal (Pob.)',1147),
    ('Diffun','San Antonio',560),
    ('Diffun','San Isidro',518),
    ('Diffun','San Pascual',181),
    ('Diffun','Villa Pascua',393),
    -- Maddela (32 barangays)
    ('Maddela','Abbag',254),
    ('Maddela','Balligui',425),
    ('Maddela','Buenavista',408),
    ('Maddela','Cabaruan',361),
    ('Maddela','Cabua-an',140),
    ('Maddela','Cofcaville',175),
    ('Maddela','Diduyon',454),
    ('Maddela','Dipintin',729),
    ('Maddela','Divisoria Norte',155),
    ('Maddela','Divisoria Sur (Bisangal)',269),
    ('Maddela','Dumabato Norte',394),
    ('Maddela','Dumabato Sur',392),
    ('Maddela','Jose Ancheta',235),
    ('Maddela','Lusod',430),
    ('Maddela','Manglad',149),
    ('Maddela','Pedlisan',120),
    ('Maddela','Poblacion Norte',1357),
    ('Maddela','Poblacion Sur',838),
    ('Maddela','San Bernabe',363),
    ('Maddela','San Dionisio I',112),
    ('Maddela','San Martin',172),
    ('Maddela','San Pedro',258),
    ('Maddela','San Salvador',104),
    ('Maddela','Santa Maria',207),
    ('Maddela','Santo Niño',301),
    ('Maddela','Santo Tomas',95),
    ('Maddela','Villa Agullana',87),
    ('Maddela','Villa Gracia',168),
    ('Maddela','Villa Hermosa Norte',290),
    ('Maddela','Villa Hermosa Sur',442),
    ('Maddela','Villa Jose V. Ylanan',92),
    ('Maddela','Ysmal',126),
    -- Nagtipunan (16 barangays)
    ('Nagtipunan','Anak',379),
    ('Nagtipunan','Asaklat',223),
    ('Nagtipunan','Dipantan',463),
    ('Nagtipunan','Dissimungal',368),
    ('Nagtipunan','Guino (Giayan)',60),
    ('Nagtipunan','La Conwap (Guingin)',60),
    ('Nagtipunan','Landigan',347),
    ('Nagtipunan','Mataddi',60),
    ('Nagtipunan','Matmad',0),
    ('Nagtipunan','Old Gumiad',60),
    ('Nagtipunan','Ponggo',975),
    ('Nagtipunan','San Dionisio II',744),
    ('Nagtipunan','San Pugo',88),
    ('Nagtipunan','San Ramos',150),
    ('Nagtipunan','Sangbay',462),
    ('Nagtipunan','Wasid',262),
    -- Saguday (9 barangays)
    ('Saguday','Cardenas',229),
    ('Saguday','Dibul',340),
    ('Saguday','Gamis',309),
    ('Saguday','La Paz',743),
    ('Saguday','Magsaysay (Pob.)',935),
    ('Saguday','Rizal (Pob.)',898),
    ('Saguday','Salvacion',395),
    ('Saguday','Santo Tomas',375),
    ('Saguday','Tres Reyes',244)
)
INSERT INTO public.barangay_household_updates (municipality, barangay_id, barangay_name, total_households, restored_households, as_of_time)
SELECT 
  b.municipality,
  b.id,
  b.name,
  COALESCE(pt.total_households, 300),
  0,
  now()
FROM public.barangays b
LEFT JOIN provided_totals pt
  ON b.municipality = pt.municipality
  AND b.name = pt.barangay_name;

-- Sync to barangay_households
INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households)
SELECT DISTINCT ON (barangay_id)
  municipality,
  barangay_id,
  barangay_name,
  total_households
FROM public.barangay_household_updates
ORDER BY barangay_id, updated_at DESC;

-- VERIFICATION
SELECT 'Diffun barangays (should show 155, 1820, 562, 768):' as check;
SELECT barangay_name, total_households 
FROM public.barangay_households 
WHERE municipality = 'Diffun'
ORDER BY barangay_name
LIMIT 10;

SELECT 'Cabarroguis barangays (should show 237, 1017, 181, 145):' as check;
SELECT barangay_name, total_households 
FROM public.barangay_households 
WHERE municipality = 'Cabarroguis'
ORDER BY barangay_name
LIMIT 10;

SELECT 'Count of barangays with 300:' as check;
SELECT municipality, COUNT(*) as count_300
FROM public.barangay_households
WHERE total_households = 300
GROUP BY municipality;

SELECT 'Total by municipality:' as check;
SELECT municipality, COUNT(*) as barangay_count, SUM(total_households) as total_hh
FROM public.barangay_households 
GROUP BY municipality 
ORDER BY municipality;
