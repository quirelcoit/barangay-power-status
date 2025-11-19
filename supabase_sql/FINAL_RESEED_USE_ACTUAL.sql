-- RUN THIS IN SUPABASE SQL EDITOR
-- This approach inserts ALL actual barangays from your database with estimated household counts
-- based on the data you provided (nearest match approach)

-- Step 1: Clear old data
DELETE FROM public.barangay_household_updates;
DELETE FROM public.barangay_households;

-- Step 2: Insert ALL actual barangays with household counts 
-- Using COALESCE to match your provided data where names exist, otherwise use estimated values

INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households)
SELECT 
  b.municipality,
  b.id,
  b.name,
  CASE 
    -- San Agustin exact matches
    WHEN b.municipality = 'SAN AGUSTIN, ISABELA' AND b.name = 'Bautista' THEN 247
    WHEN b.municipality = 'SAN AGUSTIN, ISABELA' AND b.name = 'Calaocan' THEN 85
    WHEN b.municipality = 'SAN AGUSTIN, ISABELA' AND b.name = 'Dabubu Grande' THEN 429
    WHEN b.municipality = 'SAN AGUSTIN, ISABELA' AND b.name = 'Dabubu Pequeño' THEN 183
    WHEN b.municipality = 'SAN AGUSTIN, ISABELA' AND b.name = 'Dappig' THEN 169
    WHEN b.municipality = 'SAN AGUSTIN, ISABELA' AND b.name = 'Laoag' THEN 282
    WHEN b.municipality = 'SAN AGUSTIN, ISABELA' AND b.name = 'Mapalad' THEN 362
    WHEN b.municipality = 'SAN AGUSTIN, ISABELA' AND b.name = 'Palacian' THEN 325
    WHEN b.municipality = 'SAN AGUSTIN, ISABELA' AND b.name = 'Panang' THEN 201
    WHEN b.municipality = 'SAN AGUSTIN, ISABELA' AND b.name = 'Quimalabasa Norte' THEN 174
    WHEN b.municipality = 'SAN AGUSTIN, ISABELA' AND b.name = 'Quimalabasa Sur' THEN 139
    WHEN b.municipality = 'SAN AGUSTIN, ISABELA' AND b.name = 'Rang-ay' THEN 116
    WHEN b.municipality = 'SAN AGUSTIN, ISABELA' AND b.name = 'Salay' THEN 256
    WHEN b.municipality = 'SAN AGUSTIN, ISABELA' AND b.name = 'San Antonio' THEN 132
    WHEN b.municipality = 'SAN AGUSTIN, ISABELA' AND b.name = 'Santo Niño' THEN 475
    WHEN b.municipality = 'SAN AGUSTIN, ISABELA' AND b.name = 'Sinaoangan Norte' THEN 149
    WHEN b.municipality = 'SAN AGUSTIN, ISABELA' AND b.name = 'Sinaoangan Sur' THEN 170
    WHEN b.municipality = 'SAN AGUSTIN, ISABELA' AND b.name = 'Virgoneza' THEN 300

    -- Aglipay exact matches
    WHEN b.municipality = 'AGLIPAY, QUIRINO' AND b.name = 'Alicia' THEN 252
    WHEN b.municipality = 'AGLIPAY, QUIRINO' AND b.name = 'Cabugao' THEN 116
    WHEN b.municipality = 'AGLIPAY, QUIRINO' AND b.name = 'Dagupan' THEN 310
    WHEN b.municipality = 'AGLIPAY, QUIRINO' AND b.name = 'Diodol' THEN 121
    WHEN b.municipality = 'AGLIPAY, QUIRINO' AND b.name = 'Dumabel' THEN 259
    WHEN b.municipality = 'AGLIPAY, QUIRINO' AND b.name = 'Dungo' THEN 261
    WHEN b.municipality = 'AGLIPAY, QUIRINO' AND b.name = 'Guinalbin' THEN 251
    WHEN b.municipality = 'AGLIPAY, QUIRINO' AND b.name = 'Ligaya' THEN 514
    WHEN b.municipality = 'AGLIPAY, QUIRINO' AND b.name = 'Nagabgaban' THEN 140
    WHEN b.municipality = 'AGLIPAY, QUIRINO' AND b.name = 'Palacian' THEN 499
    WHEN b.municipality = 'AGLIPAY, QUIRINO' AND b.name = 'Pinaripad Norte' THEN 354
    WHEN b.municipality = 'AGLIPAY, QUIRINO' AND b.name = 'Pinaripad Sur' THEN 373
    WHEN b.municipality = 'AGLIPAY, QUIRINO' AND b.name = 'Progreso' THEN 322
    WHEN b.municipality = 'AGLIPAY, QUIRINO' AND b.name = 'Ramos' THEN 193
    WHEN b.municipality = 'AGLIPAY, QUIRINO' AND b.name = 'Rang-ayan' THEN 74
    WHEN b.municipality = 'AGLIPAY, QUIRINO' AND b.name = 'San Antonio' THEN 132
    WHEN b.municipality = 'AGLIPAY, QUIRINO' AND b.name = 'San Benigno' THEN 339
    WHEN b.municipality = 'AGLIPAY, QUIRINO' AND b.name = 'San Francisco' THEN 431
    WHEN b.municipality = 'AGLIPAY, QUIRINO' AND b.name = 'San Leonardo' THEN 833
    WHEN b.municipality = 'AGLIPAY, QUIRINO' AND b.name = 'San Manuel' THEN 167
    WHEN b.municipality = 'AGLIPAY, QUIRINO' AND b.name = 'San Ramon' THEN 156
    WHEN b.municipality = 'AGLIPAY, QUIRINO' AND b.name = 'Victoria' THEN 368
    WHEN b.municipality = 'AGLIPAY, QUIRINO' AND b.name = 'Villa Pagaduan' THEN 243
    WHEN b.municipality = 'AGLIPAY, QUIRINO' AND b.name = 'Villa Santiago' THEN 418
    WHEN b.municipality = 'AGLIPAY, QUIRINO' AND b.name = 'Villa Ventura' THEN 182

    -- Cabarroguis exact matches
    WHEN b.municipality = 'CABARROGUIS, QUIRINO' AND b.name = 'Banuar' THEN 237
    WHEN b.municipality = 'CABARROGUIS, QUIRINO' AND b.name = 'Burgos' THEN 1017
    WHEN b.municipality = 'CABARROGUIS, QUIRINO' AND b.name = 'Calaocan' THEN 181
    WHEN b.municipality = 'CABARROGUIS, QUIRINO' AND b.name = 'Del Pilar' THEN 145
    WHEN b.municipality = 'CABARROGUIS, QUIRINO' AND b.name = 'Dibibi' THEN 741
    WHEN b.municipality = 'CABARROGUIS, QUIRINO' AND b.name = 'Dingasan' THEN 349
    WHEN b.municipality = 'CABARROGUIS, QUIRINO' AND b.name = 'Eden' THEN 210
    WHEN b.municipality = 'CABARROGUIS, QUIRINO' AND b.name = 'Gomez' THEN 127
    WHEN b.municipality = 'CABARROGUIS, QUIRINO' AND b.name = 'Gundaway' THEN 1417
    WHEN b.municipality = 'CABARROGUIS, QUIRINO' AND b.name = 'Mangandingay' THEN 1039
    WHEN b.municipality = 'CABARROGUIS, QUIRINO' AND b.name = 'San Marcos' THEN 977
    WHEN b.municipality = 'CABARROGUIS, QUIRINO' AND b.name = 'Santo Domingo' THEN 226
    WHEN b.municipality = 'CABARROGUIS, QUIRINO' AND b.name = 'Tucod' THEN 406
    WHEN b.municipality = 'CABARROGUIS, QUIRINO' AND b.name = 'Villa Peña' THEN 126
    WHEN b.municipality = 'CABARROGUIS, QUIRINO' AND b.name = 'Villamor' THEN 700
    WHEN b.municipality = 'CABARROGUIS, QUIRINO' AND b.name = 'Villarose' THEN 152
    WHEN b.municipality = 'CABARROGUIS, QUIRINO' AND b.name = 'Zamora' THEN 1154

    -- Diffun exact matches
    WHEN b.municipality = 'DIFFUN, QUIRINO' AND b.name = 'Aklan Village' THEN 155
    WHEN b.municipality = 'DIFFUN, QUIRINO' AND b.name = 'Andres Bonifacio' THEN 1820
    WHEN b.municipality = 'DIFFUN, QUIRINO' AND b.name = 'Aurora East' THEN 562
    WHEN b.municipality = 'DIFFUN, QUIRINO' AND b.name = 'Aurora West' THEN 768
    WHEN b.municipality = 'DIFFUN, QUIRINO' AND b.name = 'Baguio Village' THEN 295
    WHEN b.municipality = 'DIFFUN, QUIRINO' AND b.name = 'Balagbag' THEN 498
    WHEN b.municipality = 'DIFFUN, QUIRINO' AND b.name = 'Bannawag' THEN 738
    WHEN b.municipality = 'DIFFUN, QUIRINO' AND b.name = 'Cajel' THEN 626
    WHEN b.municipality = 'DIFFUN, QUIRINO' AND b.name = 'Campamento' THEN 326
    WHEN b.municipality = 'DIFFUN, QUIRINO' AND b.name = 'Diego Silang' THEN 291
    WHEN b.municipality = 'DIFFUN, QUIRINO' AND b.name = 'Don Faustino Pagaduan' THEN 91
    WHEN b.municipality = 'DIFFUN, QUIRINO' AND b.name = 'Don Mariano Perez, Sr.' THEN 195
    WHEN b.municipality = 'DIFFUN, QUIRINO' AND b.name = 'Doña Imelda' THEN 149
    WHEN b.municipality = 'DIFFUN, QUIRINO' AND b.name = 'Dumanisi' THEN 461
    WHEN b.municipality = 'DIFFUN, QUIRINO' AND b.name = 'Gabriela Silang' THEN 473
    WHEN b.municipality = 'DIFFUN, QUIRINO' AND b.name = 'Gregorio Pimentel' THEN 157
    WHEN b.municipality = 'DIFFUN, QUIRINO' AND b.name = 'Gulac' THEN 417
    WHEN b.municipality = 'DIFFUN, QUIRINO' AND b.name = 'Guribang' THEN 473
    WHEN b.municipality = 'DIFFUN, QUIRINO' AND b.name = 'Ifugao Village' THEN 311
    WHEN b.municipality = 'DIFFUN, QUIRINO' AND b.name = 'Isidro Paredes' THEN 475
    WHEN b.municipality = 'DIFFUN, QUIRINO' AND b.name = 'Liwayway' THEN 734
    WHEN b.municipality = 'DIFFUN, QUIRINO' AND b.name = 'Luttuad' THEN 457
    WHEN b.municipality = 'DIFFUN, QUIRINO' AND b.name = 'Magsaysay' THEN 232
    WHEN b.municipality = 'DIFFUN, QUIRINO' AND b.name = 'Makate' THEN 151
    WHEN b.municipality = 'DIFFUN, QUIRINO' AND b.name = 'Maria Clara' THEN 539
    WHEN b.municipality = 'DIFFUN, QUIRINO' AND b.name = 'Rafael Palma' THEN 145
    WHEN b.municipality = 'DIFFUN, QUIRINO' AND b.name = 'Ricarte Norte' THEN 448
    WHEN b.municipality = 'DIFFUN, QUIRINO' AND b.name = 'Ricarte Sur' THEN 227
    WHEN b.municipality = 'DIFFUN, QUIRINO' AND b.name = 'Rizal' THEN 1147
    WHEN b.municipality = 'DIFFUN, QUIRINO' AND b.name = 'San Antonio' THEN 560
    WHEN b.municipality = 'DIFFUN, QUIRINO' AND b.name = 'San Isidro' THEN 518
    WHEN b.municipality = 'DIFFUN, QUIRINO' AND b.name = 'San Pascual' THEN 181
    WHEN b.municipality = 'DIFFUN, QUIRINO' AND b.name = 'Villa Pascua' THEN 393

    -- Maddela exact matches
    WHEN b.municipality = 'MADDELA, QUIRINO' AND b.name = 'Abbag' THEN 254
    WHEN b.municipality = 'MADDELA, QUIRINO' AND b.name = 'Balligui' THEN 425
    WHEN b.municipality = 'MADDELA, QUIRINO' AND b.name = 'Buenavista' THEN 408
    WHEN b.municipality = 'MADDELA, QUIRINO' AND b.name = 'Cabaruan' THEN 361
    WHEN b.municipality = 'MADDELA, QUIRINO' AND b.name = 'Cabua-an' THEN 140
    WHEN b.municipality = 'MADDELA, QUIRINO' AND b.name = 'Cofcaville' THEN 175
    WHEN b.municipality = 'MADDELA, QUIRINO' AND b.name = 'Diduyon' THEN 454
    WHEN b.municipality = 'MADDELA, QUIRINO' AND b.name = 'Dipintin' THEN 729
    WHEN b.municipality = 'MADDELA, QUIRINO' AND b.name = 'Divisoria Norte' THEN 155
    WHEN b.municipality = 'MADDELA, QUIRINO' AND b.name = 'Divisoria Sur' THEN 269
    WHEN b.municipality = 'MADDELA, QUIRINO' AND b.name = 'Dumabato Norte' THEN 394
    WHEN b.municipality = 'MADDELA, QUIRINO' AND b.name = 'Dumabato Sur' THEN 392
    WHEN b.municipality = 'MADDELA, QUIRINO' AND b.name = 'Jose Ancheta' THEN 235
    WHEN b.municipality = 'MADDELA, QUIRINO' AND b.name = 'Lusod' THEN 430
    WHEN b.municipality = 'MADDELA, QUIRINO' AND b.name = 'Manglad' THEN 149
    WHEN b.municipality = 'MADDELA, QUIRINO' AND b.name = 'Pedlisan' THEN 120
    WHEN b.municipality = 'MADDELA, QUIRINO' AND b.name = 'Poblacion Norte' THEN 1357
    WHEN b.municipality = 'MADDELA, QUIRINO' AND b.name = 'Poblacion Sur' THEN 838
    WHEN b.municipality = 'MADDELA, QUIRINO' AND b.name = 'San Bernabe' THEN 363
    WHEN b.municipality = 'MADDELA, QUIRINO' AND b.name = 'San Dionisio I' THEN 112
    WHEN b.municipality = 'MADDELA, QUIRINO' AND b.name = 'San Martin' THEN 172
    WHEN b.municipality = 'MADDELA, QUIRINO' AND b.name = 'San Pedro' THEN 258
    WHEN b.municipality = 'MADDELA, QUIRINO' AND b.name = 'San Salvador' THEN 104
    WHEN b.municipality = 'MADDELA, QUIRINO' AND b.name = 'Santa Maria' THEN 207
    WHEN b.municipality = 'MADDELA, QUIRINO' AND b.name = 'Santo Niño' THEN 301
    WHEN b.municipality = 'MADDELA, QUIRINO' AND b.name = 'Santo Tomas' THEN 95
    WHEN b.municipality = 'MADDELA, QUIRINO' AND b.name = 'Villa Agullana' THEN 87
    WHEN b.municipality = 'MADDELA, QUIRINO' AND b.name = 'Villa Gracia' THEN 168
    WHEN b.municipality = 'MADDELA, QUIRINO' AND b.name = 'Villa Hermosa Norte' THEN 290
    WHEN b.municipality = 'MADDELA, QUIRINO' AND b.name = 'Villa Hermosa Sur' THEN 442
    WHEN b.municipality = 'MADDELA, QUIRINO' AND b.name = 'Villa Jose V Ylanan' THEN 92
    WHEN b.municipality = 'MADDELA, QUIRINO' AND b.name = 'Ysmael' THEN 126

    -- Nagtipunan exact matches
    WHEN b.municipality = 'NAGTIPUNAN, QUIRINO' AND b.name = 'Anak' THEN 379
    WHEN b.municipality = 'NAGTIPUNAN, QUIRINO' AND b.name = 'Asaklat' THEN 223
    WHEN b.municipality = 'NAGTIPUNAN, QUIRINO' AND b.name = 'Dipantan' THEN 463
    WHEN b.municipality = 'NAGTIPUNAN, QUIRINO' AND b.name = 'Dissimungal' THEN 368
    WHEN b.municipality = 'NAGTIPUNAN, QUIRINO' AND b.name = 'Guino' THEN 60
    WHEN b.municipality = 'NAGTIPUNAN, QUIRINO' AND b.name = 'La Conwap' THEN 60
    WHEN b.municipality = 'NAGTIPUNAN, QUIRINO' AND b.name = 'Landingan' THEN 347
    WHEN b.municipality = 'NAGTIPUNAN, QUIRINO' AND b.name = 'Mataddi' THEN 60
    WHEN b.municipality = 'NAGTIPUNAN, QUIRINO' AND b.name = 'Matmad' THEN 0
    WHEN b.municipality = 'NAGTIPUNAN, QUIRINO' AND b.name = 'Old Gumiad' THEN 60
    WHEN b.municipality = 'NAGTIPUNAN, QUIRINO' AND b.name = 'Ponggo' THEN 975
    WHEN b.municipality = 'NAGTIPUNAN, QUIRINO' AND b.name = 'San Dionisio II' THEN 744
    WHEN b.municipality = 'NAGTIPUNAN, QUIRINO' AND b.name = 'San Pugo' THEN 88
    WHEN b.municipality = 'NAGTIPUNAN, QUIRINO' AND b.name = 'San Ramos' THEN 150
    WHEN b.municipality = 'NAGTIPUNAN, QUIRINO' AND b.name = 'Sangbay' THEN 462
    WHEN b.municipality = 'NAGTIPUNAN, QUIRINO' AND b.name = 'Wasid' THEN 262

    -- Saguday exact matches
    WHEN b.municipality = 'SAGUDAY, QUIRINO' AND b.name = 'Cardenas' THEN 229
    WHEN b.municipality = 'SAGUDAY, QUIRINO' AND b.name = 'Dibul' THEN 340
    WHEN b.municipality = 'SAGUDAY, QUIRINO' AND b.name = 'Gamis' THEN 309
    WHEN b.municipality = 'SAGUDAY, QUIRINO' AND b.name = 'La Paz' THEN 743
    WHEN b.municipality = 'SAGUDAY, QUIRINO' AND b.name = 'Magsaysay' THEN 935
    WHEN b.municipality = 'SAGUDAY, QUIRINO' AND b.name = 'Rizal' THEN 898
    WHEN b.municipality = 'SAGUDAY, QUIRINO' AND b.name = 'Salvacion' THEN 395
    WHEN b.municipality = 'SAGUDAY, QUIRINO' AND b.name = 'Santo Tomas' THEN 375
    WHEN b.municipality = 'SAGUDAY, QUIRINO' AND b.name = 'Tres Reyes' THEN 244

    -- Default: use 300 for unmatched barangays (estimated average)
    ELSE 300
  END as total_households
FROM public.barangays b
ORDER BY b.municipality, b.name;

-- Step 3: Verify results
SELECT municipality, COUNT(*) as barangay_count, SUM(total_households) as total_households
FROM public.barangay_households 
GROUP BY municipality 
ORDER BY municipality;

-- Step 4: Show grand totals
SELECT COUNT(*) as total_barangays, SUM(total_households) as total_households FROM public.barangay_households;

-- Step 5: Test query for the app
SELECT barangay_name, total_households FROM public.barangay_household_status 
WHERE municipality = 'DIFFUN, QUIRINO' 
ORDER BY barangay_name LIMIT 5;
