-- RUN THIS IN SUPABASE SQL EDITOR to populate all barangays with CORRECT household data
-- This bypasses RLS because you're running it as the Supabase admin
-- CORRECTED COLUMN ORDER: municipality, barangay_id (from subquery), barangay_name, total_households

-- Step 1: Clear old data
DELETE FROM public.barangay_household_updates;
DELETE FROM public.barangay_households;

-- Step 2: Insert household data for ALL 150 barangays with CORRECT counts
INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households)
VALUES
  -- San Agustin (18 barangays)
  ('SAN AGUSTIN, ISABELA', (SELECT id FROM public.barangays WHERE name = 'Bautista' AND municipality = 'SAN AGUSTIN, ISABELA' LIMIT 1), 'Bautista', 247),
  ('SAN AGUSTIN, ISABELA', (SELECT id FROM public.barangays WHERE name = 'Calaocan' AND municipality = 'SAN AGUSTIN, ISABELA' LIMIT 1), 'Calaocan', 85),
  ('SAN AGUSTIN, ISABELA', (SELECT id FROM public.barangays WHERE name = 'Dabubu Grande' AND municipality = 'SAN AGUSTIN, ISABELA' LIMIT 1), 'Dabubu Grande', 429),
  ('SAN AGUSTIN, ISABELA', (SELECT id FROM public.barangays WHERE name = 'Dabubu Pequeño' AND municipality = 'SAN AGUSTIN, ISABELA' LIMIT 1), 'Dabubu Pequeño', 183),
  ('SAN AGUSTIN, ISABELA', (SELECT id FROM public.barangays WHERE name = 'Dappig' AND municipality = 'SAN AGUSTIN, ISABELA' LIMIT 1), 'Dappig', 169),
  ('SAN AGUSTIN, ISABELA', (SELECT id FROM public.barangays WHERE name = 'Laoag' AND municipality = 'SAN AGUSTIN, ISABELA' LIMIT 1), 'Laoag', 282),
  ('SAN AGUSTIN, ISABELA', (SELECT id FROM public.barangays WHERE name = 'Mapalad' AND municipality = 'SAN AGUSTIN, ISABELA' LIMIT 1), 'Mapalad', 362),
  ('SAN AGUSTIN, ISABELA', (SELECT id FROM public.barangays WHERE name = 'Palacian' AND municipality = 'SAN AGUSTIN, ISABELA' LIMIT 1), 'Palacian', 325),
  ('SAN AGUSTIN, ISABELA', (SELECT id FROM public.barangays WHERE name = 'Panang' AND municipality = 'SAN AGUSTIN, ISABELA' LIMIT 1), 'Panang', 201),
  ('SAN AGUSTIN, ISABELA', (SELECT id FROM public.barangays WHERE name = 'Quimalabasa Norte' AND municipality = 'SAN AGUSTIN, ISABELA' LIMIT 1), 'Quimalabasa Norte', 174),
  ('SAN AGUSTIN, ISABELA', (SELECT id FROM public.barangays WHERE name = 'Quimalabasa Sur' AND municipality = 'SAN AGUSTIN, ISABELA' LIMIT 1), 'Quimalabasa Sur', 139),
  ('SAN AGUSTIN, ISABELA', (SELECT id FROM public.barangays WHERE name = 'Rang-ay' AND municipality = 'SAN AGUSTIN, ISABELA' LIMIT 1), 'Rang-ay', 116),
  ('SAN AGUSTIN, ISABELA', (SELECT id FROM public.barangays WHERE name = 'Salay' AND municipality = 'SAN AGUSTIN, ISABELA' LIMIT 1), 'Salay', 256),
  ('SAN AGUSTIN, ISABELA', (SELECT id FROM public.barangays WHERE name = 'San Antonio' AND municipality = 'SAN AGUSTIN, ISABELA' LIMIT 1), 'San Antonio', 132),
  ('SAN AGUSTIN, ISABELA', (SELECT id FROM public.barangays WHERE name = 'Santo Niño' AND municipality = 'SAN AGUSTIN, ISABELA' LIMIT 1), 'Santo Niño', 475),
  ('SAN AGUSTIN, ISABELA', (SELECT id FROM public.barangays WHERE name = 'Sinaoangan Norte' AND municipality = 'SAN AGUSTIN, ISABELA' LIMIT 1), 'Sinaoangan Norte', 149),
  ('SAN AGUSTIN, ISABELA', (SELECT id FROM public.barangays WHERE name = 'Sinaoangan Sur' AND municipality = 'SAN AGUSTIN, ISABELA' LIMIT 1), 'Sinaoangan Sur', 170),
  ('SAN AGUSTIN, ISABELA', (SELECT id FROM public.barangays WHERE name = 'Virgoneza' AND municipality = 'SAN AGUSTIN, ISABELA' LIMIT 1), 'Virgoneza', 300),

  -- Aglipay (25 barangays)
  ('AGLIPAY, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Alicia' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'Alicia', 252),
  ('AGLIPAY, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Cabugao' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'Cabugao', 116),
  ('AGLIPAY, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Dagupan' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'Dagupan', 310),
  ('AGLIPAY, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Diodol' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'Diodol', 121),
  ('AGLIPAY, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Dumabel' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'Dumabel', 259),
  ('AGLIPAY, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Dungo' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'Dungo', 261),
  ('AGLIPAY, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Guinalbin' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'Guinalbin', 251),
  ('AGLIPAY, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Ligaya' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'Ligaya', 514),
  ('AGLIPAY, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Nagabgaban' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'Nagabgaban', 140),
  ('AGLIPAY, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Palacian' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'Palacian', 499),
  ('AGLIPAY, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Pinaripad Norte' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'Pinaripad Norte', 354),
  ('AGLIPAY, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Pinaripad Sur' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'Pinaripad Sur', 373),
  ('AGLIPAY, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Progreso' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'Progreso', 322),
  ('AGLIPAY, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Ramos' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'Ramos', 193),
  ('AGLIPAY, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Rang-ayan' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'Rang-ayan', 74),
  ('AGLIPAY, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'San Antonio' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'San Antonio', 132),
  ('AGLIPAY, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'San Benigno' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'San Benigno', 339),
  ('AGLIPAY, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'San Francisco' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'San Francisco', 431),
  ('AGLIPAY, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'San Leonardo' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'San Leonardo', 833),
  ('AGLIPAY, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'San Manuel' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'San Manuel', 167),
  ('AGLIPAY, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'San Ramon' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'San Ramon', 156),
  ('AGLIPAY, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Victoria' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'Victoria', 368),
  ('AGLIPAY, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Villa Pagaduan' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'Villa Pagaduan', 243),
  ('AGLIPAY, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Villa Santiago' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'Villa Santiago', 418),
  ('AGLIPAY, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Villa Ventura' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'Villa Ventura', 182),

  -- Cabarroguis (17 barangays)
  ('CABARROGUIS, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Banuar' AND municipality = 'CABARROGUIS, QUIRINO' LIMIT 1), 'Banuar', 237),
  ('CABARROGUIS, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Burgos' AND municipality = 'CABARROGUIS, QUIRINO' LIMIT 1), 'Burgos', 1017),
  ('CABARROGUIS, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Calaocan' AND municipality = 'CABARROGUIS, QUIRINO' LIMIT 1), 'Calaocan', 181),
  ('CABARROGUIS, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Del Pilar' AND municipality = 'CABARROGUIS, QUIRINO' LIMIT 1), 'Del Pilar', 145),
  ('CABARROGUIS, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Dibibi' AND municipality = 'CABARROGUIS, QUIRINO' LIMIT 1), 'Dibibi', 741),
  ('CABARROGUIS, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Dingasan' AND municipality = 'CABARROGUIS, QUIRINO' LIMIT 1), 'Dingasan', 349),
  ('CABARROGUIS, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Eden' AND municipality = 'CABARROGUIS, QUIRINO' LIMIT 1), 'Eden', 210),
  ('CABARROGUIS, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Gomez' AND municipality = 'CABARROGUIS, QUIRINO' LIMIT 1), 'Gomez', 127),
  ('CABARROGUIS, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Gundaway' AND municipality = 'CABARROGUIS, QUIRINO' LIMIT 1), 'Gundaway', 1417),
  ('CABARROGUIS, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Mangandingay' AND municipality = 'CABARROGUIS, QUIRINO' LIMIT 1), 'Mangandingay', 1039),
  ('CABARROGUIS, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'San Marcos' AND municipality = 'CABARROGUIS, QUIRINO' LIMIT 1), 'San Marcos', 977),
  ('CABARROGUIS, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Santo Domingo' AND municipality = 'CABARROGUIS, QUIRINO' LIMIT 1), 'Santo Domingo', 226),
  ('CABARROGUIS, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Tucod' AND municipality = 'CABARROGUIS, QUIRINO' LIMIT 1), 'Tucod', 406),
  ('CABARROGUIS, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Villa Peña' AND municipality = 'CABARROGUIS, QUIRINO' LIMIT 1), 'Villa Peña', 126),
  ('CABARROGUIS, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Villamor' AND municipality = 'CABARROGUIS, QUIRINO' LIMIT 1), 'Villamor', 700),
  ('CABARROGUIS, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Villarose' AND municipality = 'CABARROGUIS, QUIRINO' LIMIT 1), 'Villarose', 152),
  ('CABARROGUIS, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Zamora' AND municipality = 'CABARROGUIS, QUIRINO' LIMIT 1), 'Zamora', 1154),

  -- Diffun (33 barangays)
  ('DIFFUN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Aklan Village' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'Aklan Village', 155),
  ('DIFFUN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Andres Bonifacio' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'Andres Bonifacio', 1820),
  ('DIFFUN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Aurora East' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'Aurora East', 562),
  ('DIFFUN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Aurora West' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'Aurora West', 768),
  ('DIFFUN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Baguio Village' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'Baguio Village', 295),
  ('DIFFUN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Balagbag' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'Balagbag', 498),
  ('DIFFUN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Bannawag' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'Bannawag', 738),
  ('DIFFUN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Cajel' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'Cajel', 626),
  ('DIFFUN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Campamento' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'Campamento', 326),
  ('DIFFUN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Diego Silang' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'Diego Silang', 291),
  ('DIFFUN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Don Faustino Pagaduan' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'Don Faustino Pagaduan', 91),
  ('DIFFUN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Don Mariano Perez, Sr.' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'Don Mariano Perez, Sr.', 195),
  ('DIFFUN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Doña Imelda' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'Doña Imelda', 149),
  ('DIFFUN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Dumanisi' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'Dumanisi', 461),
  ('DIFFUN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Gabriela Silang' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'Gabriela Silang', 473),
  ('DIFFUN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Gregorio Pimentel' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'Gregorio Pimentel', 157),
  ('DIFFUN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Gulac' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'Gulac', 417),
  ('DIFFUN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Guribang' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'Guribang', 473),
  ('DIFFUN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Ifugao Village' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'Ifugao Village', 311),
  ('DIFFUN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Isidro Paredes' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'Isidro Paredes', 475),
  ('DIFFUN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Liwayway' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'Liwayway', 734),
  ('DIFFUN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Luttuad' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'Luttuad', 457),
  ('DIFFUN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Magsaysay' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'Magsaysay', 232),
  ('DIFFUN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Makate' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'Makate', 151),
  ('DIFFUN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Maria Clara' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'Maria Clara', 539),
  ('DIFFUN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Rafael Palma' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'Rafael Palma', 145),
  ('DIFFUN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Ricarte Norte' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'Ricarte Norte', 448),
  ('DIFFUN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Ricarte Sur' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'Ricarte Sur', 227),
  ('DIFFUN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Rizal' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'Rizal', 1147),
  ('DIFFUN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'San Antonio' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'San Antonio', 560),
  ('DIFFUN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'San Isidro' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'San Isidro', 518),
  ('DIFFUN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'San Pascual' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'San Pascual', 181),
  ('DIFFUN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Villa Pascua' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'Villa Pascua', 393),

  -- Maddela (32 barangays)
  ('MADDELA, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Abbag' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'Abbag', 254),
  ('MADDELA, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Balligui' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'Balligui', 425),
  ('MADDELA, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Buenavista' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'Buenavista', 408),
  ('MADDELA, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Cabaruan' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'Cabaruan', 361),
  ('MADDELA, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Cabua-an' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'Cabua-an', 140),
  ('MADDELA, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Cofcaville' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'Cofcaville', 175),
  ('MADDELA, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Diduyon' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'Diduyon', 454),
  ('MADDELA, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Dipintin' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'Dipintin', 729),
  ('MADDELA, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Divisoria Norte' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'Divisoria Norte', 155),
  ('MADDELA, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Divisoria Sur' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'Divisoria Sur', 269),
  ('MADDELA, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Dumabato Norte' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'Dumabato Norte', 394),
  ('MADDELA, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Dumabato Sur' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'Dumabato Sur', 392),
  ('MADDELA, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Jose Ancheta' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'Jose Ancheta', 235),
  ('MADDELA, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Lusod' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'Lusod', 430),
  ('MADDELA, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Manglad' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'Manglad', 149),
  ('MADDELA, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Pedlisan' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'Pedlisan', 120),
  ('MADDELA, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Poblacion Norte' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'Poblacion Norte', 1357),
  ('MADDELA, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Poblacion Sur' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'Poblacion Sur', 838),
  ('MADDELA, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'San Bernabe' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'San Bernabe', 363),
  ('MADDELA, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'San Dionisio I' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'San Dionisio I', 112),
  ('MADDELA, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'San Martin' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'San Martin', 172),
  ('MADDELA, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'San Pedro' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'San Pedro', 258),
  ('MADDELA, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'San Salvador' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'San Salvador', 104),
  ('MADDELA, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Santa Maria' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'Santa Maria', 207),
  ('MADDELA, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Santo Niño' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'Santo Niño', 301),
  ('MADDELA, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Santo Tomas' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'Santo Tomas', 95),
  ('MADDELA, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Villa Agullana' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'Villa Agullana', 87),
  ('MADDELA, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Villa Gracia' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'Villa Gracia', 168),
  ('MADDELA, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Villa Hermosa Norte' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'Villa Hermosa Norte', 290),
  ('MADDELA, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Villa Hermosa Sur' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'Villa Hermosa Sur', 442),
  ('MADDELA, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Villa Jose V Ylanan' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'Villa Jose V Ylanan', 92),
  ('MADDELA, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Ysmael' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'Ysmael', 126),

  -- Nagtipunan (16 barangays)
  ('NAGTIPUNAN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Anak' AND municipality = 'NAGTIPUNAN, QUIRINO' LIMIT 1), 'Anak', 379),
  ('NAGTIPUNAN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Asaklat' AND municipality = 'NAGTIPUNAN, QUIRINO' LIMIT 1), 'Asaklat', 223),
  ('NAGTIPUNAN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Dipantan' AND municipality = 'NAGTIPUNAN, QUIRINO' LIMIT 1), 'Dipantan', 463),
  ('NAGTIPUNAN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Dissimungal' AND municipality = 'NAGTIPUNAN, QUIRINO' LIMIT 1), 'Dissimungal', 368),
  ('NAGTIPUNAN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Guino' AND municipality = 'NAGTIPUNAN, QUIRINO' LIMIT 1), 'Guino', 60),
  ('NAGTIPUNAN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'La Conwap' AND municipality = 'NAGTIPUNAN, QUIRINO' LIMIT 1), 'La Conwap', 60),
  ('NAGTIPUNAN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Landingan' AND municipality = 'NAGTIPUNAN, QUIRINO' LIMIT 1), 'Landingan', 347),
  ('NAGTIPUNAN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Mataddi' AND municipality = 'NAGTIPUNAN, QUIRINO' LIMIT 1), 'Mataddi', 60),
  ('NAGTIPUNAN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Matmad' AND municipality = 'NAGTIPUNAN, QUIRINO' LIMIT 1), 'Matmad', 0),
  ('NAGTIPUNAN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Old Gumiad' AND municipality = 'NAGTIPUNAN, QUIRINO' LIMIT 1), 'Old Gumiad', 60),
  ('NAGTIPUNAN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Ponggo' AND municipality = 'NAGTIPUNAN, QUIRINO' LIMIT 1), 'Ponggo', 975),
  ('NAGTIPUNAN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'San Dionisio II' AND municipality = 'NAGTIPUNAN, QUIRINO' LIMIT 1), 'San Dionisio II', 744),
  ('NAGTIPUNAN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'San Pugo' AND municipality = 'NAGTIPUNAN, QUIRINO' LIMIT 1), 'San Pugo', 88),
  ('NAGTIPUNAN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'San Ramos' AND municipality = 'NAGTIPUNAN, QUIRINO' LIMIT 1), 'San Ramos', 150),
  ('NAGTIPUNAN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Sangbay' AND municipality = 'NAGTIPUNAN, QUIRINO' LIMIT 1), 'Sangbay', 462),
  ('NAGTIPUNAN, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Wasid' AND municipality = 'NAGTIPUNAN, QUIRINO' LIMIT 1), 'Wasid', 262),

  -- Saguday (9 barangays)
  ('SAGUDAY, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Cardenas' AND municipality = 'SAGUDAY, QUIRINO' LIMIT 1), 'Cardenas', 229),
  ('SAGUDAY, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Dibul' AND municipality = 'SAGUDAY, QUIRINO' LIMIT 1), 'Dibul', 340),
  ('SAGUDAY, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Gamis' AND municipality = 'SAGUDAY, QUIRINO' LIMIT 1), 'Gamis', 309),
  ('SAGUDAY, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'La Paz' AND municipality = 'SAGUDAY, QUIRINO' LIMIT 1), 'La Paz', 743),
  ('SAGUDAY, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Magsaysay' AND municipality = 'SAGUDAY, QUIRINO' LIMIT 1), 'Magsaysay', 935),
  ('SAGUDAY, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Rizal' AND municipality = 'SAGUDAY, QUIRINO' LIMIT 1), 'Rizal', 898),
  ('SAGUDAY, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Salvacion' AND municipality = 'SAGUDAY, QUIRINO' LIMIT 1), 'Salvacion', 395),
  ('SAGUDAY, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Santo Tomas' AND municipality = 'SAGUDAY, QUIRINO' LIMIT 1), 'Santo Tomas', 375),
  ('SAGUDAY, QUIRINO', (SELECT id FROM public.barangays WHERE name = 'Tres Reyes' AND municipality = 'SAGUDAY, QUIRINO' LIMIT 1), 'Tres Reyes', 244)
ON CONFLICT (barangay_id) DO UPDATE 
SET total_households = EXCLUDED.total_households, updated_at = now();

-- Verify: should see 150 rows inserted (or close to 150 if some names still don't match)
SELECT municipality, COUNT(*) as barangay_count, SUM(total_households) as total_households
FROM public.barangay_households 
GROUP BY municipality 
ORDER BY municipality;

-- Test: Query the view for Diffun (should show barangay data)
SELECT barangay_name, total_households FROM public.barangay_household_status 
WHERE municipality = 'DIFFUN, QUIRINO' 
ORDER BY barangay_name;

-- Show total household count
SELECT COUNT(*) as total_barangays, SUM(total_households) as total_hh FROM public.barangay_households;
