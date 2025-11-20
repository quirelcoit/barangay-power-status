-- RUN THIS IN SUPABASE SQL EDITOR to populate all barangays with CORRECT household data
-- Uses INSERT...SELECT with JOIN to avoid NULL issues
-- This bypasses RLS because you're running it as the Supabase admin

-- Step 1: Clear old data
DELETE FROM public.barangay_household_updates;
DELETE FROM public.barangay_households;

-- Step 2: Create a temporary table with the household data
CREATE TEMP TABLE temp_household_data (municipality TEXT, barangay_name TEXT, total_households INTEGER);

INSERT INTO temp_household_data VALUES
  -- San Agustin (18 barangays)
  ('SAN AGUSTIN, ISABELA', 'Bautista', 247),
  ('SAN AGUSTIN, ISABELA', 'Calaocan', 85),
  ('SAN AGUSTIN, ISABELA', 'Dabubu Grande', 429),
  ('SAN AGUSTIN, ISABELA', 'Dabubu Pequeño', 183),
  ('SAN AGUSTIN, ISABELA', 'Dappig', 169),
  ('SAN AGUSTIN, ISABELA', 'Laoag', 282),
  ('SAN AGUSTIN, ISABELA', 'Mapalad', 362),
  ('SAN AGUSTIN, ISABELA', 'Palacian', 325),
  ('SAN AGUSTIN, ISABELA', 'Panang', 201),
  ('SAN AGUSTIN, ISABELA', 'Quimalabasa Norte', 174),
  ('SAN AGUSTIN, ISABELA', 'Quimalabasa Sur', 139),
  ('SAN AGUSTIN, ISABELA', 'Rang-ay', 116),
  ('SAN AGUSTIN, ISABELA', 'Salay', 256),
  ('SAN AGUSTIN, ISABELA', 'San Antonio', 132),
  ('SAN AGUSTIN, ISABELA', 'Santo Niño', 475),
  ('SAN AGUSTIN, ISABELA', 'Sinaoangan Norte', 149),
  ('SAN AGUSTIN, ISABELA', 'Sinaoangan Sur', 170),
  ('SAN AGUSTIN, ISABELA', 'Virgoneza', 300),

  -- Aglipay (25 barangays)
  ('AGLIPAY, QUIRINO', 'Alicia', 252),
  ('AGLIPAY, QUIRINO', 'Cabugao', 116),
  ('AGLIPAY, QUIRINO', 'Dagupan', 310),
  ('AGLIPAY, QUIRINO', 'Diodol', 121),
  ('AGLIPAY, QUIRINO', 'Dumabel', 259),
  ('AGLIPAY, QUIRINO', 'Dungo', 261),
  ('AGLIPAY, QUIRINO', 'Guinalbin', 251),
  ('AGLIPAY, QUIRINO', 'Ligaya', 514),
  ('AGLIPAY, QUIRINO', 'Nagabgaban', 140),
  ('AGLIPAY, QUIRINO', 'Palacian', 499),
  ('AGLIPAY, QUIRINO', 'Pinaripad Norte', 354),
  ('AGLIPAY, QUIRINO', 'Pinaripad Sur', 373),
  ('AGLIPAY, QUIRINO', 'Progreso', 322),
  ('AGLIPAY, QUIRINO', 'Ramos', 193),
  ('AGLIPAY, QUIRINO', 'Rang-ayan', 74),
  ('AGLIPAY, QUIRINO', 'San Antonio', 132),
  ('AGLIPAY, QUIRINO', 'San Benigno', 339),
  ('AGLIPAY, QUIRINO', 'San Francisco', 431),
  ('AGLIPAY, QUIRINO', 'San Leonardo', 833),
  ('AGLIPAY, QUIRINO', 'San Manuel', 167),
  ('AGLIPAY, QUIRINO', 'San Ramon', 156),
  ('AGLIPAY, QUIRINO', 'Victoria', 368),
  ('AGLIPAY, QUIRINO', 'Villa Pagaduan', 243),
  ('AGLIPAY, QUIRINO', 'Villa Santiago', 418),
  ('AGLIPAY, QUIRINO', 'Villa Ventura', 182),

  -- Cabarroguis (17 barangays)
  ('CABARROGUIS, QUIRINO', 'Banuar', 237),
  ('CABARROGUIS, QUIRINO', 'Burgos', 1017),
  ('CABARROGUIS, QUIRINO', 'Calaocan', 181),
  ('CABARROGUIS, QUIRINO', 'Del Pilar', 145),
  ('CABARROGUIS, QUIRINO', 'Dibibi', 741),
  ('CABARROGUIS, QUIRINO', 'Dingasan', 349),
  ('CABARROGUIS, QUIRINO', 'Eden', 210),
  ('CABARROGUIS, QUIRINO', 'Gomez', 127),
  ('CABARROGUIS, QUIRINO', 'Gundaway', 1417),
  ('CABARROGUIS, QUIRINO', 'Mangandingay', 1039),
  ('CABARROGUIS, QUIRINO', 'San Marcos', 977),
  ('CABARROGUIS, QUIRINO', 'Santo Domingo', 226),
  ('CABARROGUIS, QUIRINO', 'Tucod', 406),
  ('CABARROGUIS, QUIRINO', 'Villa Peña', 126),
  ('CABARROGUIS, QUIRINO', 'Villamor', 700),
  ('CABARROGUIS, QUIRINO', 'Villarose', 152),
  ('CABARROGUIS, QUIRINO', 'Zamora', 1154),

  -- Diffun (33 barangays)
  ('DIFFUN, QUIRINO', 'Aklan Village', 155),
  ('DIFFUN, QUIRINO', 'Andres Bonifacio', 1820),
  ('DIFFUN, QUIRINO', 'Aurora East', 562),
  ('DIFFUN, QUIRINO', 'Aurora West', 768),
  ('DIFFUN, QUIRINO', 'Baguio Village', 295),
  ('DIFFUN, QUIRINO', 'Balagbag', 498),
  ('DIFFUN, QUIRINO', 'Bannawag', 738),
  ('DIFFUN, QUIRINO', 'Cajel', 626),
  ('DIFFUN, QUIRINO', 'Campamento', 326),
  ('DIFFUN, QUIRINO', 'Diego Silang', 291),
  ('DIFFUN, QUIRINO', 'Don Faustino Pagaduan', 91),
  ('DIFFUN, QUIRINO', 'Don Mariano Perez, Sr.', 195),
  ('DIFFUN, QUIRINO', 'Doña Imelda', 149),
  ('DIFFUN, QUIRINO', 'Dumanisi', 461),
  ('DIFFUN, QUIRINO', 'Gabriela Silang', 473),
  ('DIFFUN, QUIRINO', 'Gregorio Pimentel', 157),
  ('DIFFUN, QUIRINO', 'Gulac', 417),
  ('DIFFUN, QUIRINO', 'Guribang', 473),
  ('DIFFUN, QUIRINO', 'Ifugao Village', 311),
  ('DIFFUN, QUIRINO', 'Isidro Paredes', 475),
  ('DIFFUN, QUIRINO', 'Liwayway', 734),
  ('DIFFUN, QUIRINO', 'Luttuad', 457),
  ('DIFFUN, QUIRINO', 'Magsaysay', 232),
  ('DIFFUN, QUIRINO', 'Makate', 151),
  ('DIFFUN, QUIRINO', 'Maria Clara', 539),
  ('DIFFUN, QUIRINO', 'Rafael Palma', 145),
  ('DIFFUN, QUIRINO', 'Ricarte Norte', 448),
  ('DIFFUN, QUIRINO', 'Ricarte Sur', 227),
  ('DIFFUN, QUIRINO', 'Rizal', 1147),
  ('DIFFUN, QUIRINO', 'San Antonio', 560),
  ('DIFFUN, QUIRINO', 'San Isidro', 518),
  ('DIFFUN, QUIRINO', 'San Pascual', 181),
  ('DIFFUN, QUIRINO', 'Villa Pascua', 393),

  -- Maddela (32 barangays)
  ('MADDELA, QUIRINO', 'Abbag', 254),
  ('MADDELA, QUIRINO', 'Balligui', 425),
  ('MADDELA, QUIRINO', 'Buenavista', 408),
  ('MADDELA, QUIRINO', 'Cabaruan', 361),
  ('MADDELA, QUIRINO', 'Cabua-an', 140),
  ('MADDELA, QUIRINO', 'Cofcaville', 175),
  ('MADDELA, QUIRINO', 'Diduyon', 454),
  ('MADDELA, QUIRINO', 'Dipintin', 729),
  ('MADDELA, QUIRINO', 'Divisoria Norte', 155),
  ('MADDELA, QUIRINO', 'Divisoria Sur', 269),
  ('MADDELA, QUIRINO', 'Dumabato Norte', 394),
  ('MADDELA, QUIRINO', 'Dumabato Sur', 392),
  ('MADDELA, QUIRINO', 'Jose Ancheta', 235),
  ('MADDELA, QUIRINO', 'Lusod', 430),
  ('MADDELA, QUIRINO', 'Manglad', 149),
  ('MADDELA, QUIRINO', 'Pedlisan', 120),
  ('MADDELA, QUIRINO', 'Poblacion Norte', 1357),
  ('MADDELA, QUIRINO', 'Poblacion Sur', 838),
  ('MADDELA, QUIRINO', 'San Bernabe', 363),
  ('MADDELA, QUIRINO', 'San Dionisio I', 112),
  ('MADDELA, QUIRINO', 'San Martin', 172),
  ('MADDELA, QUIRINO', 'San Pedro', 258),
  ('MADDELA, QUIRINO', 'San Salvador', 104),
  ('MADDELA, QUIRINO', 'Santa Maria', 207),
  ('MADDELA, QUIRINO', 'Santo Niño', 301),
  ('MADDELA, QUIRINO', 'Santo Tomas', 95),
  ('MADDELA, QUIRINO', 'Villa Agullana', 87),
  ('MADDELA, QUIRINO', 'Villa Gracia', 168),
  ('MADDELA, QUIRINO', 'Villa Hermosa Norte', 290),
  ('MADDELA, QUIRINO', 'Villa Hermosa Sur', 442),
  ('MADDELA, QUIRINO', 'Villa Jose V Ylanan', 92),
  ('MADDELA, QUIRINO', 'Ysmael', 126),

  -- Nagtipunan (16 barangays)
  ('NAGTIPUNAN, QUIRINO', 'Anak', 379),
  ('NAGTIPUNAN, QUIRINO', 'Asaklat', 223),
  ('NAGTIPUNAN, QUIRINO', 'Dipantan', 463),
  ('NAGTIPUNAN, QUIRINO', 'Dissimungal', 368),
  ('NAGTIPUNAN, QUIRINO', 'Guino', 60),
  ('NAGTIPUNAN, QUIRINO', 'La Conwap', 60),
  ('NAGTIPUNAN, QUIRINO', 'Landingan', 347),
  ('NAGTIPUNAN, QUIRINO', 'Mataddi', 60),
  ('NAGTIPUNAN, QUIRINO', 'Matmad', 0),
  ('NAGTIPUNAN, QUIRINO', 'Old Gumiad', 60),
  ('NAGTIPUNAN, QUIRINO', 'Ponggo', 975),
  ('NAGTIPUNAN, QUIRINO', 'San Dionisio II', 744),
  ('NAGTIPUNAN, QUIRINO', 'San Pugo', 88),
  ('NAGTIPUNAN, QUIRINO', 'San Ramos', 150),
  ('NAGTIPUNAN, QUIRINO', 'Sangbay', 462),
  ('NAGTIPUNAN, QUIRINO', 'Wasid', 262),

  -- Saguday (9 barangays)
  ('SAGUDAY, QUIRINO', 'Cardenas', 229),
  ('SAGUDAY, QUIRINO', 'Dibul', 340),
  ('SAGUDAY, QUIRINO', 'Gamis', 309),
  ('SAGUDAY, QUIRINO', 'La Paz', 743),
  ('SAGUDAY, QUIRINO', 'Magsaysay', 935),
  ('SAGUDAY, QUIRINO', 'Rizal', 898),
  ('SAGUDAY, QUIRINO', 'Salvacion', 395),
  ('SAGUDAY, QUIRINO', 'Santo Tomas', 375),
  ('SAGUDAY, QUIRINO', 'Tres Reyes', 244);

-- Step 3: Insert using JOIN - only inserts matching records
INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households)
SELECT 
  t.municipality,
  b.id,
  t.barangay_name,
  t.total_households
FROM temp_household_data t
INNER JOIN public.barangays b 
  ON b.name = t.barangay_name 
  AND b.municipality = t.municipality
ON CONFLICT (barangay_id) DO UPDATE 
SET total_households = EXCLUDED.total_households, updated_at = now();

-- Step 4: Show what was inserted
SELECT municipality, COUNT(*) as barangay_count, SUM(total_households) as total_households
FROM public.barangay_households 
GROUP BY municipality 
ORDER BY municipality;

-- Step 5: Show what didn't match (for debugging)
SELECT t.municipality, t.barangay_name
FROM temp_household_data t
LEFT JOIN public.barangays b 
  ON b.name = t.barangay_name 
  AND b.municipality = t.municipality
WHERE b.id IS NULL
ORDER BY t.municipality, t.barangay_name;

-- Final verification
SELECT COUNT(*) as total_barangays, SUM(total_households) as total_hh FROM public.barangay_households;
