-- ============================================================================
-- COMPLETE FIX FOR BARANGAY HOUSEHOLD TOTALS
-- Run this ENTIRE script in Supabase SQL Editor
-- This will create tables (if missing), diagnose, and fix the 300 defaults issue
-- ============================================================================

-- STEP 0: CREATE TABLES IF THEY DON'T EXIST
-- ============================================================================
SELECT '========== Creating tables if missing ==========' as step;

-- Create barangay_households table
CREATE TABLE IF NOT EXISTS public.barangay_households (
  id uuid primary key default uuid_generate_v4(),
  municipality text not null,
  barangay_id uuid not null references public.barangays(id),
  barangay_name text not null,
  total_households integer not null check (total_households > 0),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  UNIQUE(barangay_id)
);

-- Create barangay_household_updates table
CREATE TABLE IF NOT EXISTS public.barangay_household_updates (
  id uuid primary key default uuid_generate_v4(),
  municipality text not null,
  barangay_id uuid not null references public.barangays(id),
  barangay_name text not null,
  total_households integer not null,
  restored_households integer not null check (restored_households >= 0 and restored_households <= total_households),
  remarks text,
  photo_url text,
  updated_by uuid references auth.users(id),
  is_published boolean default true,
  as_of_time timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create override table
CREATE TABLE IF NOT EXISTS public.barangay_household_overrides (
  id uuid primary key default uuid_generate_v4(),
  barangay_id uuid not null references public.barangays(id) on delete cascade,
  override_total_households integer not null check (override_total_households > 0),
  updated_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  UNIQUE(barangay_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_barangay_households_municipality ON public.barangay_households(municipality);
CREATE INDEX IF NOT EXISTS idx_barangay_households_barangay_id ON public.barangay_households(barangay_id);
CREATE INDEX IF NOT EXISTS idx_barangay_household_updates_barangay_id ON public.barangay_household_updates(barangay_id);
CREATE INDEX IF NOT EXISTS idx_barangay_household_updates_municipality ON public.barangay_household_updates(municipality);
CREATE INDEX IF NOT EXISTS idx_barangay_household_updates_updated_at ON public.barangay_household_updates(updated_at desc);
CREATE INDEX IF NOT EXISTS idx_barangay_household_overrides_barangay_id ON public.barangay_household_overrides(barangay_id);

-- Create view
DROP VIEW IF EXISTS public.barangay_household_status;
CREATE VIEW public.barangay_household_status AS
WITH ranked_updates AS (
  SELECT 
    id, municipality, barangay_id, barangay_name, total_households,
    restored_households, as_of_time, updated_at,
    ROW_NUMBER() OVER (PARTITION BY barangay_id ORDER BY updated_at DESC, id DESC) as rn
  FROM public.barangay_household_updates
  WHERE is_published = true
)
SELECT 
  bh.municipality,
  bh.barangay_id,
  bh.barangay_name,
  COALESCE(bho.override_total_households, bh.total_households) as total_households,
  bho.override_total_households as manual_total_households,
  bh.total_households as baseline_total_households,
  COALESCE(bhu.restored_households, 0) as restored_households,
  COALESCE(bho.override_total_households, bh.total_households) - COALESCE(bhu.restored_households, 0) as for_restoration_households,
  ROUND((COALESCE(bhu.restored_households, 0)::numeric / COALESCE(bho.override_total_households, bh.total_households)) * 100, 2) as percent_restored,
  bhu.as_of_time,
  bhu.updated_at as last_updated
FROM public.barangay_households bh
LEFT JOIN (SELECT * FROM ranked_updates WHERE rn = 1) bhu ON bh.barangay_id = bhu.barangay_id
LEFT JOIN public.barangay_household_overrides bho ON bh.barangay_id = bho.barangay_id
ORDER BY bh.municipality, bh.barangay_name;

-- Enable RLS
ALTER TABLE public.barangay_households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barangay_household_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barangay_household_overrides ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Allow public to read barangay households" ON public.barangay_households;
CREATE POLICY "Allow public to read barangay households" ON public.barangay_households FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow authenticated staff to manage barangay households" ON public.barangay_households;
CREATE POLICY "Allow authenticated staff to manage barangay households" ON public.barangay_households FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.staff_profiles WHERE uid = auth.uid() AND (role = 'moderator' OR role = 'admin')));

DROP POLICY IF EXISTS "Allow authenticated staff to manage barangay household overrides" ON public.barangay_household_overrides;
CREATE POLICY "Allow authenticated staff to manage barangay household overrides" ON public.barangay_household_overrides FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.staff_profiles WHERE uid = auth.uid() AND (role = 'moderator' OR role = 'admin')));

DROP POLICY IF EXISTS "Allow public to read published barangay household updates" ON public.barangay_household_updates;
CREATE POLICY "Allow public to read published barangay household updates" ON public.barangay_household_updates FOR SELECT TO public USING (is_published = true);

DROP POLICY IF EXISTS "Allow authenticated staff to insert barangay household updates" ON public.barangay_household_updates;
CREATE POLICY "Allow authenticated staff to insert barangay household updates" ON public.barangay_household_updates FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.staff_profiles WHERE uid = auth.uid() AND (role = 'moderator' OR role = 'admin')));

DROP POLICY IF EXISTS "Allow authenticated staff to update barangay household updates" ON public.barangay_household_updates;
CREATE POLICY "Allow authenticated staff to update barangay household updates" ON public.barangay_household_updates FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.staff_profiles WHERE uid = auth.uid() AND (role = 'moderator' OR role = 'admin')));

SELECT 'Tables and view created successfully' as status;

-- STEP 1: DIAGNOSE CURRENT STATE
-- ============================================================================
SELECT '========== DIAGNOSTIC: Current State ==========' as step;

SELECT 'Current municipality names in barangays table:' as info;
SELECT DISTINCT municipality, COUNT(*) as barangay_count
FROM public.barangays
GROUP BY municipality
ORDER BY municipality;

-- STEP 2: CLEAR OLD DATA (safe now that tables exist)
-- ============================================================================
SELECT '========== Clearing old data ==========' as step;

DELETE FROM public.barangay_household_overrides;
DELETE FROM public.barangay_households;
DELETE FROM public.barangay_household_updates;

SELECT 'Old data cleared' as info;

-- STEP 3: INSERT CORRECT DATA
-- ============================================================================
SELECT '========== Inserting correct barangay household data ==========' as step;

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

SELECT 'Inserted into barangay_household_updates:' as info, COUNT(*) as row_count
FROM public.barangay_household_updates;

-- STEP 4: SYNC TO barangay_households
-- ============================================================================
INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households)
SELECT DISTINCT ON (barangay_id)
  municipality,
  barangay_id,
  barangay_name,
  total_households
FROM public.barangay_household_updates
ORDER BY barangay_id, updated_at DESC;

SELECT 'Inserted into barangay_households:' as info, COUNT(*) as row_count
FROM public.barangay_households;

-- STEP 5: VERIFICATION
-- ============================================================================
SELECT '========== VERIFICATION: Results ==========' as step;

SELECT 'DIFFUN barangays (should show 155, 1820, 562, 768, etc. NOT 300):' as info;
SELECT barangay_name, total_households 
FROM public.barangay_household_status 
WHERE municipality = 'DIFFUN, QUIRINO'
ORDER BY barangay_name
LIMIT 10;

SELECT 'Totals by municipality:' as info;
SELECT municipality, COUNT(*) as barangay_count, SUM(total_households) as total_households
FROM public.barangay_households 
GROUP BY municipality 
ORDER BY municipality;

SELECT 'Count of barangays still showing 300:' as info;
SELECT municipality, COUNT(*) as count_with_300
FROM public.barangay_households
WHERE total_households = 300
GROUP BY municipality
ORDER BY municipality;

SELECT '========== DONE! Check results above ==========' as step;
