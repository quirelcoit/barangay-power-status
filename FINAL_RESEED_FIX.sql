-- RUN THIS IN SUPABASE SQL EDITOR to populate all barangays with CORRECT household data
-- This bypasses RLS because you're running it as the Supabase admin

-- Step 1: Clear old data
DELETE FROM public.barangay_household_updates;
DELETE FROM public.barangay_households;

-- Step 2: Insert household data for ALL barangays with CORRECT counts
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
  ((SELECT id FROM public.barangays WHERE name = 'Quimalabasa Norte' AND municipality = 'SAN AGUSTIN, ISABELA' LIMIT 1), 'SAN AGUSTIN, ISABELA', 'Quimalabasa Norte', 174),
  ((SELECT id FROM public.barangays WHERE name = 'Quimalabasa Sur' AND municipality = 'SAN AGUSTIN, ISABELA' LIMIT 1), 'SAN AGUSTIN, ISABELA', 'Quimalabasa Sur', 139),
  ((SELECT id FROM public.barangays WHERE name = 'Rang-ay' AND municipality = 'SAN AGUSTIN, ISABELA' LIMIT 1), 'SAN AGUSTIN, ISABELA', 'Rang-ay', 116),
  ((SELECT id FROM public.barangays WHERE name = 'Salay' AND municipality = 'SAN AGUSTIN, ISABELA' LIMIT 1), 'SAN AGUSTIN, ISABELA', 'Salay', 256),
  ((SELECT id FROM public.barangays WHERE name = 'San Antonio' AND municipality = 'SAN AGUSTIN, ISABELA' LIMIT 1), 'SAN AGUSTIN, ISABELA', 'San Antonio', 132),
  ((SELECT id FROM public.barangays WHERE name = 'Santo Niño' AND municipality = 'SAN AGUSTIN, ISABELA' LIMIT 1), 'SAN AGUSTIN, ISABELA', 'Santo Niño', 475),
  ((SELECT id FROM public.barangays WHERE name = 'Sinaoangan Norte' AND municipality = 'SAN AGUSTIN, ISABELA' LIMIT 1), 'SAN AGUSTIN, ISABELA', 'Sinaoangan Norte', 149),
  ((SELECT id FROM public.barangays WHERE name = 'Sinaoangan Sur' AND municipality = 'SAN AGUSTIN, ISABELA' LIMIT 1), 'SAN AGUSTIN, ISABELA', 'Sinaoangan Sur', 170),
  ((SELECT id FROM public.barangays WHERE name = 'Virgoneza' AND municipality = 'SAN AGUSTIN, ISABELA' LIMIT 1), 'SAN AGUSTIN, ISABELA', 'Virgoneza', 300),

  -- Aglipay (25 barangays)
  ((SELECT id FROM public.barangays WHERE name = 'Alicia' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'AGLIPAY, QUIRINO', 'Alicia', 252),
  ((SELECT id FROM public.barangays WHERE name = 'Cabugao' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'AGLIPAY, QUIRINO', 'Cabugao', 116),
  ((SELECT id FROM public.barangays WHERE name = 'Dagupan' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'AGLIPAY, QUIRINO', 'Dagupan', 310),
  ((SELECT id FROM public.barangays WHERE name = 'Diodol' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'AGLIPAY, QUIRINO', 'Diodol', 121),
  ((SELECT id FROM public.barangays WHERE name = 'Dumabel' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'AGLIPAY, QUIRINO', 'Dumabel', 259),
  ((SELECT id FROM public.barangays WHERE name = 'Dungo' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'AGLIPAY, QUIRINO', 'Dungo', 261),
  ((SELECT id FROM public.barangays WHERE name = 'Guinalbin' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'AGLIPAY, QUIRINO', 'Guinalbin', 251),
  ((SELECT id FROM public.barangays WHERE name = 'Ligaya' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'AGLIPAY, QUIRINO', 'Ligaya', 514),
  ((SELECT id FROM public.barangays WHERE name = 'Nagabgaban' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'AGLIPAY, QUIRINO', 'Nagabgaban', 140),
  ((SELECT id FROM public.barangays WHERE name = 'Palacian' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'AGLIPAY, QUIRINO', 'Palacian', 499),
  ((SELECT id FROM public.barangays WHERE name = 'Pinaripad Norte' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'AGLIPAY, QUIRINO', 'Pinaripad Norte', 354),
  ((SELECT id FROM public.barangays WHERE name = 'Pinaripad Sur' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'AGLIPAY, QUIRINO', 'Pinaripad Sur', 373),
  ((SELECT id FROM public.barangays WHERE name = 'Progreso' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'AGLIPAY, QUIRINO', 'Progreso', 322),
  ((SELECT id FROM public.barangays WHERE name = 'Ramos' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'AGLIPAY, QUIRINO', 'Ramos', 193),
  ((SELECT id FROM public.barangays WHERE name = 'Rang-ayan' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'AGLIPAY, QUIRINO', 'Rang-ayan', 74),
  ((SELECT id FROM public.barangays WHERE name = 'San Antonio' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'AGLIPAY, QUIRINO', 'San Antonio', 132),
  ((SELECT id FROM public.barangays WHERE name = 'San Benigno' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'AGLIPAY, QUIRINO', 'San Benigno', 339),
  ((SELECT id FROM public.barangays WHERE name = 'San Francisco' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'AGLIPAY, QUIRINO', 'San Francisco', 431),
  ((SELECT id FROM public.barangays WHERE name = 'San Leonardo' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'AGLIPAY, QUIRINO', 'San Leonardo', 833),
  ((SELECT id FROM public.barangays WHERE name = 'San Manuel' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'AGLIPAY, QUIRINO', 'San Manuel', 167),
  ((SELECT id FROM public.barangays WHERE name = 'San Ramon' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'AGLIPAY, QUIRINO', 'San Ramon', 156),
  ((SELECT id FROM public.barangays WHERE name = 'Victoria' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'AGLIPAY, QUIRINO', 'Victoria', 368),
  ((SELECT id FROM public.barangays WHERE name = 'Villa Pagaduan' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'AGLIPAY, QUIRINO', 'Villa Pagaduan', 243),
  ((SELECT id FROM public.barangays WHERE name = 'Villa Santiago' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'AGLIPAY, QUIRINO', 'Villa Santiago', 418),
  ((SELECT id FROM public.barangays WHERE name = 'Villa Ventura' AND municipality = 'AGLIPAY, QUIRINO' LIMIT 1), 'AGLIPAY, QUIRINO', 'Villa Ventura', 182),

  -- Cabarroguis (17 barangays)
  ((SELECT id FROM public.barangays WHERE name = 'Banuar' AND municipality = 'CABARROGUIS, QUIRINO' LIMIT 1), 'CABARROGUIS, QUIRINO', 'Banuar', 237),
  ((SELECT id FROM public.barangays WHERE name = 'Burgos' AND municipality = 'CABARROGUIS, QUIRINO' LIMIT 1), 'CABARROGUIS, QUIRINO', 'Burgos', 1017),
  ((SELECT id FROM public.barangays WHERE name = 'Calaocan' AND municipality = 'CABARROGUIS, QUIRINO' LIMIT 1), 'CABARROGUIS, QUIRINO', 'Calaocan', 181),
  ((SELECT id FROM public.barangays WHERE name = 'Del Pilar' AND municipality = 'CABARROGUIS, QUIRINO' LIMIT 1), 'CABARROGUIS, QUIRINO', 'Del Pilar', 145),
  ((SELECT id FROM public.barangays WHERE name = 'Dibibi' AND municipality = 'CABARROGUIS, QUIRINO' LIMIT 1), 'CABARROGUIS, QUIRINO', 'Dibibi', 741),
  ((SELECT id FROM public.barangays WHERE name = 'Dingasan' AND municipality = 'CABARROGUIS, QUIRINO' LIMIT 1), 'CABARROGUIS, QUIRINO', 'Dingasan', 349),
  ((SELECT id FROM public.barangays WHERE name = 'Eden' AND municipality = 'CABARROGUIS, QUIRINO' LIMIT 1), 'CABARROGUIS, QUIRINO', 'Eden', 210),
  ((SELECT id FROM public.barangays WHERE name = 'Gomez' AND municipality = 'CABARROGUIS, QUIRINO' LIMIT 1), 'CABARROGUIS, QUIRINO', 'Gomez', 127),
  ((SELECT id FROM public.barangays WHERE name = 'Gundaway' AND municipality = 'CABARROGUIS, QUIRINO' LIMIT 1), 'CABARROGUIS, QUIRINO', 'Gundaway', 1417),
  ((SELECT id FROM public.barangays WHERE name = 'Mangandingay' AND municipality = 'CABARROGUIS, QUIRINO' LIMIT 1), 'CABARROGUIS, QUIRINO', 'Mangandingay', 1039),
  ((SELECT id FROM public.barangays WHERE name = 'San Marcos' AND municipality = 'CABARROGUIS, QUIRINO' LIMIT 1), 'CABARROGUIS, QUIRINO', 'San Marcos', 977),
  ((SELECT id FROM public.barangays WHERE name = 'Santo Domingo' AND municipality = 'CABARROGUIS, QUIRINO' LIMIT 1), 'CABARROGUIS, QUIRINO', 'Santo Domingo', 226),
  ((SELECT id FROM public.barangays WHERE name = 'Tucod' AND municipality = 'CABARROGUIS, QUIRINO' LIMIT 1), 'CABARROGUIS, QUIRINO', 'Tucod', 406),
  ((SELECT id FROM public.barangays WHERE name = 'Villa Peña' AND municipality = 'CABARROGUIS, QUIRINO' LIMIT 1), 'CABARROGUIS, QUIRINO', 'Villa Peña', 126),
  ((SELECT id FROM public.barangays WHERE name = 'Villamor' AND municipality = 'CABARROGUIS, QUIRINO' LIMIT 1), 'CABARROGUIS, QUIRINO', 'Villamor', 700),
  ((SELECT id FROM public.barangays WHERE name = 'Villarose' AND municipality = 'CABARROGUIS, QUIRINO' LIMIT 1), 'CABARROGUIS, QUIRINO', 'Villarose', 152),
  ((SELECT id FROM public.barangays WHERE name = 'Zamora' AND municipality = 'CABARROGUIS, QUIRINO' LIMIT 1), 'CABARROGUIS, QUIRINO', 'Zamora', 1154),

  -- Diffun (33 barangays)
  ((SELECT id FROM public.barangays WHERE name = 'Aklan Village' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'DIFFUN, QUIRINO', 'Aklan Village', 155),
  ((SELECT id FROM public.barangays WHERE name = 'Andres Bonifacio' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'DIFFUN, QUIRINO', 'Andres Bonifacio', 1820),
  ((SELECT id FROM public.barangays WHERE name = 'Aurora East' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'DIFFUN, QUIRINO', 'Aurora East', 562),
  ((SELECT id FROM public.barangays WHERE name = 'Aurora West' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'DIFFUN, QUIRINO', 'Aurora West', 768),
  ((SELECT id FROM public.barangays WHERE name = 'Baguio Village' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'DIFFUN, QUIRINO', 'Baguio Village', 295),
  ((SELECT id FROM public.barangays WHERE name = 'Balagbag' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'DIFFUN, QUIRINO', 'Balagbag', 498),
  ((SELECT id FROM public.barangays WHERE name = 'Bannawag' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'DIFFUN, QUIRINO', 'Bannawag', 738),
  ((SELECT id FROM public.barangays WHERE name = 'Cajel' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'DIFFUN, QUIRINO', 'Cajel', 626),
  ((SELECT id FROM public.barangays WHERE name = 'Campamento' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'DIFFUN, QUIRINO', 'Campamento', 326),
  ((SELECT id FROM public.barangays WHERE name = 'Diego Silang' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'DIFFUN, QUIRINO', 'Diego Silang', 291),
  ((SELECT id FROM public.barangays WHERE name = 'Don Faustino Pagaduan' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'DIFFUN, QUIRINO', 'Don Faustino Pagaduan', 91),
  ((SELECT id FROM public.barangays WHERE name = 'Don Mariano Perez, Sr.' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'DIFFUN, QUIRINO', 'Don Mariano Perez, Sr.', 195),
  ((SELECT id FROM public.barangays WHERE name = 'Doña Imelda' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'DIFFUN, QUIRINO', 'Doña Imelda', 149),
  ((SELECT id FROM public.barangays WHERE name = 'Dumanisi' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'DIFFUN, QUIRINO', 'Dumanisi', 461),
  ((SELECT id FROM public.barangays WHERE name = 'Gabriela Silang' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'DIFFUN, QUIRINO', 'Gabriela Silang', 473),
  ((SELECT id FROM public.barangays WHERE name = 'Gregorio Pimentel' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'DIFFUN, QUIRINO', 'Gregorio Pimentel', 157),
  ((SELECT id FROM public.barangays WHERE name = 'Gulac' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'DIFFUN, QUIRINO', 'Gulac', 417),
  ((SELECT id FROM public.barangays WHERE name = 'Guribang' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'DIFFUN, QUIRINO', 'Guribang', 473),
  ((SELECT id FROM public.barangays WHERE name = 'Ifugao Village' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'DIFFUN, QUIRINO', 'Ifugao Village', 311),
  ((SELECT id FROM public.barangays WHERE name = 'Isidro Paredes' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'DIFFUN, QUIRINO', 'Isidro Paredes', 475),
  ((SELECT id FROM public.barangays WHERE name = 'Liwayway' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'DIFFUN, QUIRINO', 'Liwayway', 734),
  ((SELECT id FROM public.barangays WHERE name = 'Luttuad' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'DIFFUN, QUIRINO', 'Luttuad', 457),
  ((SELECT id FROM public.barangays WHERE name = 'Magsaysay' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'DIFFUN, QUIRINO', 'Magsaysay', 232),
  ((SELECT id FROM public.barangays WHERE name = 'Makate' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'DIFFUN, QUIRINO', 'Makate', 151),
  ((SELECT id FROM public.barangays WHERE name = 'Maria Clara' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'DIFFUN, QUIRINO', 'Maria Clara', 539),
  ((SELECT id FROM public.barangays WHERE name = 'Rafael Palma' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'DIFFUN, QUIRINO', 'Rafael Palma', 145),
  ((SELECT id FROM public.barangays WHERE name = 'Ricarte Norte' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'DIFFUN, QUIRINO', 'Ricarte Norte', 448),
  ((SELECT id FROM public.barangays WHERE name = 'Ricarte Sur' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'DIFFUN, QUIRINO', 'Ricarte Sur', 227),
  ((SELECT id FROM public.barangays WHERE name = 'Rizal' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'DIFFUN, QUIRINO', 'Rizal', 1147),
  ((SELECT id FROM public.barangays WHERE name = 'San Antonio' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'DIFFUN, QUIRINO', 'San Antonio', 560),
  ((SELECT id FROM public.barangays WHERE name = 'San Isidro' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'DIFFUN, QUIRINO', 'San Isidro', 518),
  ((SELECT id FROM public.barangays WHERE name = 'San Pascual' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'DIFFUN, QUIRINO', 'San Pascual', 181),
  ((SELECT id FROM public.barangays WHERE name = 'Villa Pascua' AND municipality = 'DIFFUN, QUIRINO' LIMIT 1), 'DIFFUN, QUIRINO', 'Villa Pascua', 393),

  -- Maddela (32 barangays)
  ((SELECT id FROM public.barangays WHERE name = 'Abbag' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'MADDELA, QUIRINO', 'Abbag', 254),
  ((SELECT id FROM public.barangays WHERE name = 'Balligui' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'MADDELA, QUIRINO', 'Balligui', 425),
  ((SELECT id FROM public.barangays WHERE name = 'Buenavista' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'MADDELA, QUIRINO', 'Buenavista', 408),
  ((SELECT id FROM public.barangays WHERE name = 'Cabaruan' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'MADDELA, QUIRINO', 'Cabaruan', 361),
  ((SELECT id FROM public.barangays WHERE name = 'Cabua-an' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'MADDELA, QUIRINO', 'Cabua-an', 140),
  ((SELECT id FROM public.barangays WHERE name = 'Cofcaville' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'MADDELA, QUIRINO', 'Cofcaville', 175),
  ((SELECT id FROM public.barangays WHERE name = 'Diduyon' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'MADDELA, QUIRINO', 'Diduyon', 454),
  ((SELECT id FROM public.barangays WHERE name = 'Dipintin' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'MADDELA, QUIRINO', 'Dipintin', 729),
  ((SELECT id FROM public.barangays WHERE name = 'Divisoria Norte' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'MADDELA, QUIRINO', 'Divisoria Norte', 155),
  ((SELECT id FROM public.barangays WHERE name = 'Divisoria Sur' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'MADDELA, QUIRINO', 'Divisoria Sur', 269),
  ((SELECT id FROM public.barangays WHERE name = 'Dumabato Norte' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'MADDELA, QUIRINO', 'Dumabato Norte', 394),
  ((SELECT id FROM public.barangays WHERE name = 'Dumabato Sur' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'MADDELA, QUIRINO', 'Dumabato Sur', 392),
  ((SELECT id FROM public.barangays WHERE name = 'Jose Ancheta' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'MADDELA, QUIRINO', 'Jose Ancheta', 235),
  ((SELECT id FROM public.barangays WHERE name = 'Lusod' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'MADDELA, QUIRINO', 'Lusod', 430),
  ((SELECT id FROM public.barangays WHERE name = 'Manglad' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'MADDELA, QUIRINO', 'Manglad', 149),
  ((SELECT id FROM public.barangays WHERE name = 'Pedlisan' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'MADDELA, QUIRINO', 'Pedlisan', 120),
  ((SELECT id FROM public.barangays WHERE name = 'Poblacion Norte' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'MADDELA, QUIRINO', 'Poblacion Norte', 1357),
  ((SELECT id FROM public.barangays WHERE name = 'Poblacion Sur' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'MADDELA, QUIRINO', 'Poblacion Sur', 838),
  ((SELECT id FROM public.barangays WHERE name = 'San Bernabe' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'MADDELA, QUIRINO', 'San Bernabe', 363),
  ((SELECT id FROM public.barangays WHERE name = 'San Dionisio I' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'MADDELA, QUIRINO', 'San Dionisio I', 112),
  ((SELECT id FROM public.barangays WHERE name = 'San Martin' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'MADDELA, QUIRINO', 'San Martin', 172),
  ((SELECT id FROM public.barangays WHERE name = 'San Pedro' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'MADDELA, QUIRINO', 'San Pedro', 258),
  ((SELECT id FROM public.barangays WHERE name = 'San Salvador' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'MADDELA, QUIRINO', 'San Salvador', 104),
  ((SELECT id FROM public.barangays WHERE name = 'Santa Maria' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'MADDELA, QUIRINO', 'Santa Maria', 207),
  ((SELECT id FROM public.barangays WHERE name = 'Santo Niño' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'MADDELA, QUIRINO', 'Santo Niño', 301),
  ((SELECT id FROM public.barangays WHERE name = 'Santo Tomas' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'MADDELA, QUIRINO', 'Santo Tomas', 95),
  ((SELECT id FROM public.barangays WHERE name = 'Villa Agullana' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'MADDELA, QUIRINO', 'Villa Agullana', 87),
  ((SELECT id FROM public.barangays WHERE name = 'Villa Gracia' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'MADDELA, QUIRINO', 'Villa Gracia', 168),
  ((SELECT id FROM public.barangays WHERE name = 'Villa Hermosa Norte' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'MADDELA, QUIRINO', 'Villa Hermosa Norte', 290),
  ((SELECT id FROM public.barangays WHERE name = 'Villa Hermosa Sur' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'MADDELA, QUIRINO', 'Villa Hermosa Sur', 442),
  ((SELECT id FROM public.barangays WHERE name = 'Villa Jose V Ylanan' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'MADDELA, QUIRINO', 'Villa Jose V Ylanan', 92),
  ((SELECT id FROM public.barangays WHERE name = 'Ysmael' AND municipality = 'MADDELA, QUIRINO' LIMIT 1), 'MADDELA, QUIRINO', 'Ysmael', 126),

  -- Nagtipunan (16 barangays)
  ((SELECT id FROM public.barangays WHERE name = 'Anak' AND municipality = 'NAGTIPUNAN, QUIRINO' LIMIT 1), 'NAGTIPUNAN, QUIRINO', 'Anak', 379),
  ((SELECT id FROM public.barangays WHERE name = 'Asaklat' AND municipality = 'NAGTIPUNAN, QUIRINO' LIMIT 1), 'NAGTIPUNAN, QUIRINO', 'Asaklat', 223),
  ((SELECT id FROM public.barangays WHERE name = 'Dipantan' AND municipality = 'NAGTIPUNAN, QUIRINO' LIMIT 1), 'NAGTIPUNAN, QUIRINO', 'Dipantan', 463),
  ((SELECT id FROM public.barangays WHERE name = 'Dissimungal' AND municipality = 'NAGTIPUNAN, QUIRINO' LIMIT 1), 'NAGTIPUNAN, QUIRINO', 'Dissimungal', 368),
  ((SELECT id FROM public.barangays WHERE name = 'Guino' AND municipality = 'NAGTIPUNAN, QUIRINO' LIMIT 1), 'NAGTIPUNAN, QUIRINO', 'Guino', 60),
  ((SELECT id FROM public.barangays WHERE name = 'La Conwap' AND municipality = 'NAGTIPUNAN, QUIRINO' LIMIT 1), 'NAGTIPUNAN, QUIRINO', 'La Conwap', 60),
  ((SELECT id FROM public.barangays WHERE name = 'Landingan' AND municipality = 'NAGTIPUNAN, QUIRINO' LIMIT 1), 'NAGTIPUNAN, QUIRINO', 'Landingan', 347),
  ((SELECT id FROM public.barangays WHERE name = 'Mataddi' AND municipality = 'NAGTIPUNAN, QUIRINO' LIMIT 1), 'NAGTIPUNAN, QUIRINO', 'Mataddi', 60),
  ((SELECT id FROM public.barangays WHERE name = 'Matmad' AND municipality = 'NAGTIPUNAN, QUIRINO' LIMIT 1), 'NAGTIPUNAN, QUIRINO', 'Matmad', 0),
  ((SELECT id FROM public.barangays WHERE name = 'Old Gumiad' AND municipality = 'NAGTIPUNAN, QUIRINO' LIMIT 1), 'NAGTIPUNAN, QUIRINO', 'Old Gumiad', 60),
  ((SELECT id FROM public.barangays WHERE name = 'Ponggo' AND municipality = 'NAGTIPUNAN, QUIRINO' LIMIT 1), 'NAGTIPUNAN, QUIRINO', 'Ponggo', 975),
  ((SELECT id FROM public.barangays WHERE name = 'San Dionisio II' AND municipality = 'NAGTIPUNAN, QUIRINO' LIMIT 1), 'NAGTIPUNAN, QUIRINO', 'San Dionisio II', 744),
  ((SELECT id FROM public.barangays WHERE name = 'San Pugo' AND municipality = 'NAGTIPUNAN, QUIRINO' LIMIT 1), 'NAGTIPUNAN, QUIRINO', 'San Pugo', 88),
  ((SELECT id FROM public.barangays WHERE name = 'San Ramos' AND municipality = 'NAGTIPUNAN, QUIRINO' LIMIT 1), 'NAGTIPUNAN, QUIRINO', 'San Ramos', 150),
  ((SELECT id FROM public.barangays WHERE name = 'Sangbay' AND municipality = 'NAGTIPUNAN, QUIRINO' LIMIT 1), 'NAGTIPUNAN, QUIRINO', 'Sangbay', 462),
  ((SELECT id FROM public.barangays WHERE name = 'Wasid' AND municipality = 'NAGTIPUNAN, QUIRINO' LIMIT 1), 'NAGTIPUNAN, QUIRINO', 'Wasid', 262),

  -- Saguday (9 barangays)
  ((SELECT id FROM public.barangays WHERE name = 'Cardenas' AND municipality = 'SAGUDAY, QUIRINO' LIMIT 1), 'SAGUDAY, QUIRINO', 'Cardenas', 229),
  ((SELECT id FROM public.barangays WHERE name = 'Dibul' AND municipality = 'SAGUDAY, QUIRINO' LIMIT 1), 'SAGUDAY, QUIRINO', 'Dibul', 340),
  ((SELECT id FROM public.barangays WHERE name = 'Gamis' AND municipality = 'SAGUDAY, QUIRINO' LIMIT 1), 'SAGUDAY, QUIRINO', 'Gamis', 309),
  ((SELECT id FROM public.barangays WHERE name = 'La Paz' AND municipality = 'SAGUDAY, QUIRINO' LIMIT 1), 'SAGUDAY, QUIRINO', 'La Paz', 743),
  ((SELECT id FROM public.barangays WHERE name = 'Magsaysay' AND municipality = 'SAGUDAY, QUIRINO' LIMIT 1), 'SAGUDAY, QUIRINO', 'Magsaysay', 935),
  ((SELECT id FROM public.barangays WHERE name = 'Rizal' AND municipality = 'SAGUDAY, QUIRINO' LIMIT 1), 'SAGUDAY, QUIRINO', 'Rizal', 898),
  ((SELECT id FROM public.barangays WHERE name = 'Salvacion' AND municipality = 'SAGUDAY, QUIRINO' LIMIT 1), 'SAGUDAY, QUIRINO', 'Salvacion', 395),
  ((SELECT id FROM public.barangays WHERE name = 'Santo Tomas' AND municipality = 'SAGUDAY, QUIRINO' LIMIT 1), 'SAGUDAY, QUIRINO', 'Santo Tomas', 375),
  ((SELECT id FROM public.barangays WHERE name = 'Tres Reyes' AND municipality = 'SAGUDAY, QUIRINO' LIMIT 1), 'SAGUDAY, QUIRINO', 'Tres Reyes', 244)
ON CONFLICT (barangay_id) DO UPDATE 
SET total_households = EXCLUDED.total_households, updated_at = now();

-- Verify: should see 137 rows (the ones that matched)
SELECT municipality, COUNT(*) as barangay_count 
FROM public.barangay_households 
GROUP BY municipality 
ORDER BY municipality;

-- Test: Query the view for Diffun (should show barangay data)
SELECT barangay_name, total_households FROM public.barangay_household_status 
WHERE municipality = 'DIFFUN, QUIRINO' 
ORDER BY barangay_name;
