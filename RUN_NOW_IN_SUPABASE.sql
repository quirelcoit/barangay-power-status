-- RUN THIS IMMEDIATELY IN SUPABASE SQL EDITOR TO FIX THE 300 DEFAULTS
-- Copy entire contents and paste in Supabase > SQL Editor > New Query > Run

-- ============================================================================
-- STEP 1: DELETE OLD DATA
-- ============================================================================
DELETE FROM public.barangay_households;
DELETE FROM public.barangay_household_updates;

-- ============================================================================
-- STEP 2: INSERT CORRECT DATA WITH EXACT MATCHING
-- ============================================================================
WITH provided_totals(municipality, barangay_name, total_households) AS (
  VALUES
    ('SAN AGUSTIN, ISABELA','BAUTISTA',247),
    ('SAN AGUSTIN, ISABELA','CALAOCAN',85),
    ('SAN AGUSTIN, ISABELA','DABUBU GRANDE',429),
    ('SAN AGUSTIN, ISABELA','DABUBU PEQUEÑO',183),
    ('SAN AGUSTIN, ISABELA','DAPPIG',169),
    ('SAN AGUSTIN, ISABELA','LAOAG',282),
    ('SAN AGUSTIN, ISABELA','MAPALAD',362),
    ('SAN AGUSTIN, ISABELA','PALACIAN',325),
    ('SAN AGUSTIN, ISABELA','PANANG',201),
    ('SAN AGUSTIN, ISABELA','QUIMALABASA NORTE',174),
    ('SAN AGUSTIN, ISABELA','QUIMALABASA SUR',139),
    ('SAN AGUSTIN, ISABELA','RANG-AY',116),
    ('SAN AGUSTIN, ISABELA','SALAY',256),
    ('SAN AGUSTIN, ISABELA','SAN ANTONIO',132),
    ('SAN AGUSTIN, ISABELA','SANTO NIÑO',475),
    ('SAN AGUSTIN, ISABELA','SINAOANGAN NORTE',149),
    ('SAN AGUSTIN, ISABELA','SINAOANGAN SUR',170),
    ('SAN AGUSTIN, ISABELA','VIRGONEZA',300),
    ('AGLIPAY','ALICIA',252),
    ('AGLIPAY','CABUGAO',116),
    ('AGLIPAY','DAGUPAN',310),
    ('AGLIPAY','DIODOL',121),
    ('AGLIPAY','DUMABEL',259),
    ('AGLIPAY','DUNGO (OSMEÑA)',261),
    ('AGLIPAY','GUINALBIN',251),
    ('AGLIPAY','LIGAYA',514),
    ('AGLIPAY','NAGABGABAN',140),
    ('AGLIPAY','PALACIAN',499),
    ('AGLIPAY','PINARIPAD NORTE',354),
    ('AGLIPAY','PINARIPAD SUR',373),
    ('AGLIPAY','PROGRESO (POB.)',322),
    ('AGLIPAY','RAMOS',193),
    ('AGLIPAY','RANG-AYAN',74),
    ('AGLIPAY','SAN ANTONIO',132),
    ('AGLIPAY','SAN BENIGNO',339),
    ('AGLIPAY','SAN FRANCISCO',431),
    ('AGLIPAY','SAN LEONARDO',833),
    ('AGLIPAY','SAN MANUEL',167),
    ('AGLIPAY','SAN RAMON',156),
    ('AGLIPAY','VICTORIA',368),
    ('AGLIPAY','VILLA PAGADUAN',243),
    ('AGLIPAY','VILLA SANTIAGO',418),
    ('AGLIPAY','VILLA VENTURA',182),
    ('CABARROGUIS','BANUAR',237),
    ('CABARROGUIS','BURGOS',1017),
    ('CABARROGUIS','CALAOCAN',181),
    ('CABARROGUIS','DEL PILAR',145),
    ('CABARROGUIS','DIBIBI',741),
    ('CABARROGUIS','DINGASAN',349),
    ('CABARROGUIS','EDEN',210),
    ('CABARROGUIS','GOMEZ',127),
    ('CABARROGUIS','GUNDAWAY (POB.)',1417),
    ('CABARROGUIS','MANGANDINGAY (POB.)',1039),
    ('CABARROGUIS','SAN MARCOS',977),
    ('CABARROGUIS','SANTO DOMINGO',226),
    ('CABARROGUIS','TUCOD',406),
    ('CABARROGUIS','VILLA PEÑA',126),
    ('CABARROGUIS','VILLAMOR',700),
    ('CABARROGUIS','VILLAROSE',152),
    ('CABARROGUIS','ZAMORA',1154),
    ('DIFFUN, QUIRINO','AKLAN VILLAGE',155),
    ('DIFFUN, QUIRINO','ANDRES BONIFACIO',1820),
    ('DIFFUN, QUIRINO','AURORA EAST (POB.)',562),
    ('DIFFUN, QUIRINO','AURORA WEST (POB.)',768),
    ('DIFFUN, QUIRINO','BAGUIO VILLAGE',295),
    ('DIFFUN, QUIRINO','BALAGBAG',498),
    ('DIFFUN, QUIRINO','BANNAWAG',738),
    ('DIFFUN, QUIRINO','CAJEL',626),
    ('DIFFUN, QUIRINO','CAMPAMENTO',326),
    ('DIFFUN, QUIRINO','DIEGO SILANG',291),
    ('DIFFUN, QUIRINO','DON FAUSTINO PAGADUAN',91),
    ('DIFFUN, QUIRINO','DON MARIANO PEREZ, SR.',195),
    ('DIFFUN, QUIRINO','DOÑA IMELDA',149),
    ('DIFFUN, QUIRINO','DUMANISI',461),
    ('DIFFUN, QUIRINO','GABRIELA SILANG',473),
    ('DIFFUN, QUIRINO','GREGORIO PIMENTEL',157),
    ('DIFFUN, QUIRINO','GULAC',417),
    ('DIFFUN, QUIRINO','GURIBANG',473),
    ('DIFFUN, QUIRINO','IFUGAO VILLAGE',311),
    ('DIFFUN, QUIRINO','ISIDRO PAREDES',475),
    ('DIFFUN, QUIRINO','LIWAYWAY',734),
    ('DIFFUN, QUIRINO','LUTTUAD',457),
    ('DIFFUN, QUIRINO','MAGSAYSAY',232),
    ('DIFFUN, QUIRINO','MAKATE',151),
    ('DIFFUN, QUIRINO','MARIA CLARA',539),
    ('DIFFUN, QUIRINO','RAFAEL PALMA (DON SERGIO OSMEÑA)',145),
    ('DIFFUN, QUIRINO','RICARTE NORTE',448),
    ('DIFFUN, QUIRINO','RICARTE SUR',227),
    ('DIFFUN, QUIRINO','RIZAL (POB.)',1147),
    ('DIFFUN, QUIRINO','SAN ANTONIO',560),
    ('DIFFUN, QUIRINO','SAN ISIDRO',518),
    ('DIFFUN, QUIRINO','SAN PASCUAL',181),
    ('DIFFUN, QUIRINO','VILLA PASCUA',393),
    ('MADDELA','ABBAG',254),
    ('MADDELA','BALLIGUI',425),
    ('MADDELA','BUENAVISTA',408),
    ('MADDELA','CABARUAN',361),
    ('MADDELA','CABUA-AN',140),
    ('MADDELA','COFCAVILLE',175),
    ('MADDELA','DIDUYON',454),
    ('MADDELA','DIPINTIN',729),
    ('MADDELA','DIVISORIA NORTE',155),
    ('MADDELA','DIVISORIA SUR (BISANGAL)',269),
    ('MADDELA','DUMABATO NORTE',394),
    ('MADDELA','DUMABATO SUR',392),
    ('MADDELA','JOSE ANCHETA',235),
    ('MADDELA','LUSOD',430),
    ('MADDELA','MANGLAD',149),
    ('MADDELA','PEDLISAN',120),
    ('MADDELA','POBLACION NORTE',1357),
    ('MADDELA','POBLACION SUR',838),
    ('MADDELA','SAN BERNABE',363),
    ('MADDELA','SAN DIONISIO I',112),
    ('MADDELA','SAN MARTIN',172),
    ('MADDELA','SAN PEDRO',258),
    ('MADDELA','SAN SALVADOR',104),
    ('MADDELA','SANTA MARIA',207),
    ('MADDELA','SANTO NIÑO',301),
    ('MADDELA','SANTO TOMAS',95),
    ('MADDELA','VILLA AGULLANA',87),
    ('MADDELA','VILLA GRACIA',168),
    ('MADDELA','VILLA HERMOSA NORTE',290),
    ('MADDELA','VILLA HERMOSA SUR',442),
    ('MADDELA','VILLA JOSE V YLANAN',92),
    ('MADDELA','YSMAL',126),
    ('NAGTIPUNAN','ANAK',379),
    ('NAGTIPUNAN','ASAKLAT',223),
    ('NAGTIPUNAN','DIPANTAN',463),
    ('NAGTIPUNAN','DISSIMUNGAL',368),
    ('NAGTIPUNAN','GUINO (GIAYAN)',60),
    ('NAGTIPUNAN','LA CONWAP (GUINGIN)',60),
    ('NAGTIPUNAN','LANDIGAN',347),
    ('NAGTIPUNAN','MATADDI',60),
    ('NAGTIPUNAN','MATMAD',0),
    ('NAGTIPUNAN','OLD GUMIAD',60),
    ('NAGTIPUNAN','PONGGO',975),
    ('NAGTIPUNAN','SAN DIONISIO II',744),
    ('NAGTIPUNAN','SAN PUGO',88),
    ('NAGTIPUNAN','SAN RAMOS',150),
    ('NAGTIPUNAN','SANGBAY',462),
    ('NAGTIPUNAN','WASID',262),
    ('SAGUDAY','CARDENAS',229),
    ('SAGUDAY','DIBUL',340),
    ('SAGUDAY','GAMIS',309),
    ('SAGUDAY','LA PAZ',743),
    ('SAGUDAY','MAGSAYSAY (POB.)',935),
    ('SAGUDAY','RIZAL (POB.)',898),
    ('SAGUDAY','SALVACION',395),
    ('SAGUDAY','SANTO TOMAS',375),
    ('SAGUDAY','TRES REYES',244)
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

-- ============================================================================
-- STEP 3: SYNC TO barangay_households TABLE
-- ============================================================================
INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households)
SELECT DISTINCT ON (barangay_id)
  municipality,
  barangay_id,
  barangay_name,
  total_households
FROM public.barangay_household_updates
ORDER BY barangay_id, updated_at DESC;

-- ============================================================================
-- VERIFICATION: RUN THESE CHECKS
-- ============================================================================
SELECT '✅ DIFFUN BARANGAYS (should show 155, 1820, 562, 768, etc. NOT 300)' as check;
SELECT barangay_name, total_households 
FROM public.barangay_household_status 
WHERE municipality = 'DIFFUN, QUIRINO'
ORDER BY barangay_name
LIMIT 10;

SELECT '✅ TOTALS BY MUNICIPALITY' as check;
SELECT municipality, COUNT(*) as barangay_count, SUM(total_households) as total_households
FROM public.barangay_households 
GROUP BY municipality 
ORDER BY municipality;
