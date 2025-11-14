import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://dragaqmmigajbjxlmafm.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyYWdhcW1taWdhamJqeGxtYWZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4Mjc4NDEsImV4cCI6MjA3ODQwMzg0MX0.bHp-E5LTUcrWi1lfbTXzi5qIbj03cACQhSgb4mY8Ef8"
);

const householdData = [
  // San Agustin
  { name: "Bautista", total_households: 247 },
  { name: "Calaocan", total_households: 85 },
  { name: "Dabubu Grande", total_households: 429 },
  { name: "Dabubu Pequeño", total_households: 183 },
  { name: "Dappig", total_households: 169 },
  { name: "Laoag", total_households: 282 },
  { name: "Mapalad", total_households: 362 },
  { name: "Palacian", total_households: 325 },
  { name: "Panang", total_households: 201 },
  { name: "Quimalabasa Norte", total_households: 174 },
  { name: "Quimalabasa Sur", total_households: 139 },
  { name: "Rang-ay", total_households: 116 },
  { name: "Salay", total_households: 256 },
  { name: "San Antonio", total_households: 132 },
  { name: "Santo Niño", total_households: 475 },
  { name: "Sinaoangan Norte", total_households: 149 },
  { name: "Sinaoangan Sur", total_households: 170 },
  { name: "Virgoneza", total_households: 300 },

  // Aglipay
  { name: "Alicia", total_households: 252 },
  { name: "Cabugao", total_households: 116 },
  { name: "Dagupan", total_households: 310 },
  { name: "Diodol", total_households: 121 },
  { name: "Dumabel", total_households: 259 },
  { name: "Dungo (Osmeña)", total_households: 261 },
  { name: "Guinalbin", total_households: 251 },
  { name: "Ligaya", total_households: 514 },
  { name: "Nagabgaban", total_households: 140 },
  { name: "Palacian", total_households: 499 },
  { name: "Pinaripad Norte", total_households: 354 },
  { name: "Pinaripad Sur", total_households: 373 },
  { name: "Progreso (Pob.)", total_households: 322 },
  { name: "Ramos", total_households: 193 },
  { name: "Rang-ayan", total_households: 74 },
  { name: "San Antonio", total_households: 132 },
  { name: "San Benigno", total_households: 339 },
  { name: "San Francisco", total_households: 431 },
  { name: "San Leonardo", total_households: 833 },
  { name: "San Manuel", total_households: 167 },
  { name: "San Ramon", total_households: 156 },
  { name: "Victoria", total_households: 368 },
  { name: "Villa Pagaduan", total_households: 243 },
  { name: "Villa Santiago", total_households: 418 },
  { name: "Villa Ventura", total_households: 182 },

  // Cabarroguis
  { name: "Banuar", total_households: 237 },
  { name: "Burgos", total_households: 1017 },
  { name: "Calaocan", total_households: 181 },
  { name: "Del Pilar", total_households: 145 },
  { name: "Dibibi", total_households: 741 },
  { name: "Dingasan", total_households: 349 },
  { name: "Eden", total_households: 210 },
  { name: "Gomez", total_households: 127 },
  { name: "Gundaway (Pob.)", total_households: 1417 },
  { name: "Mangandingay (Pob.)", total_households: 1039 },
  { name: "San Marcos", total_households: 977 },
  { name: "Santo Domingo", total_households: 226 },
  { name: "Tucod", total_households: 406 },
  { name: "Villa Peña", total_households: 126 },
  { name: "Villamor", total_households: 700 },
  { name: "Villarose", total_households: 152 },
  { name: "Zamora", total_households: 1154 },

  // Diffun
  { name: "Aklan Village", total_households: 155 },
  { name: "Andres Bonifacio", total_households: 1820 },
  { name: "Aurora East (Pob.)", total_households: 562 },
  { name: "Aurora West (Pob.)", total_households: 768 },
  { name: "Baguio Village", total_households: 295 },
  { name: "Balagbag", total_households: 498 },
  { name: "Bannawag", total_households: 738 },
  { name: "Cajel", total_households: 626 },
  { name: "Campamento", total_households: 326 },
  { name: "Diego Silang", total_households: 291 },
  { name: "Don Faustino Pagaduan", total_households: 91 },
  { name: "Don Mariano Perez, Sr.", total_households: 195 },
  { name: "Doña Imelda", total_households: 149 },
  { name: "Dumanisi", total_households: 461 },
  { name: "Gabriela Silang", total_households: 473 },
  { name: "Gregorio Pimentel", total_households: 157 },
  { name: "Gulac", total_households: 417 },
  { name: "Guribang", total_households: 473 },
  { name: "Ifugao Village", total_households: 311 },
  { name: "Isidro Paredes", total_households: 475 },
  { name: "Liwayway", total_households: 734 },
  { name: "Luttuad", total_households: 457 },
  { name: "Magsaysay", total_households: 232 },
  { name: "Makate", total_households: 151 },
  { name: "Maria Clara", total_households: 539 },
  { name: "Rafael Palma (Don Sergio Osmeña)", total_households: 145 },
  { name: "Ricarte Norte", total_households: 448 },
  { name: "Ricarte Sur", total_households: 227 },
  { name: "Rizal (Pob.)", total_households: 1147 },
  { name: "San Antonio", total_households: 560 },
  { name: "San Isidro", total_households: 518 },
  { name: "San Pascual", total_households: 181 },
  { name: "Villa Pascua", total_households: 393 },

  // Maddela
  { name: "Abbag", total_households: 254 },
  { name: "Balligui", total_households: 425 },
  { name: "Buenavista", total_households: 408 },
  { name: "Cabaruan", total_households: 361 },
  { name: "Cabua-an", total_households: 140 },
  { name: "Cofcaville", total_households: 175 },
  { name: "Diduyon", total_households: 454 },
  { name: "Dipintin", total_households: 729 },
  { name: "Divisoria Norte", total_households: 155 },
  { name: "Divisoria Sur (Bisangal)", total_households: 269 },
  { name: "Dumabato Norte", total_households: 394 },
  { name: "Dumabato Sur", total_households: 392 },
  { name: "Jose Ancheta", total_households: 235 },
  { name: "Lusod", total_households: 430 },
  { name: "Manglad", total_households: 149 },
  { name: "Pedlisan", total_households: 120 },
  { name: "Poblacion Norte", total_households: 1357 },
  { name: "Poblacion Sur", total_households: 838 },
  { name: "San Bernabe", total_households: 363 },
  { name: "San Dionisio I", total_households: 112 },
  { name: "San Martin", total_households: 172 },
  { name: "San Pedro", total_households: 258 },
  { name: "San Salvador", total_households: 104 },
  { name: "Santa Maria", total_households: 207 },
  { name: "Santo Niño", total_households: 301 },
  { name: "Santo Tomas", total_households: 95 },
  { name: "Villa Agullana", total_households: 87 },
  { name: "Villa Gracia", total_households: 168 },
  { name: "Villa Hermosa Norte", total_households: 290 },
  { name: "Villa Hermosa Sur", total_households: 442 },
  { name: "Villa Jose V Ylanan", total_households: 92 },
  { name: "Ysmael", total_households: 126 },

  // Nagtipunan
  { name: "Anak", total_households: 379 },
  { name: "Asaklat", total_households: 223 },
  { name: "Dipantan", total_households: 463 },
  { name: "Dissimungal", total_households: 368 },
  { name: "Guino (Giayan)", total_households: 60 },
  { name: "La Conwap (Guingin)", total_households: 60 },
  { name: "Landingan", total_households: 347 },
  { name: "Mataddi", total_households: 60 },
  { name: "Matmad", total_households: 0 },
  { name: "Old Gumiad", total_households: 60 },
  { name: "Ponggo", total_households: 975 },
  { name: "San Dionisio II", total_households: 744 },
  { name: "San Pugo", total_households: 88 },
  { name: "San Ramos", total_households: 150 },
  { name: "Sangbay", total_households: 462 },
  { name: "Wasid", total_households: 262 },

  // Saguday
  { name: "Cardenas", total_households: 229 },
  { name: "Dibul", total_households: 340 },
  { name: "Gamis", total_households: 309 },
  { name: "La Paz", total_households: 743 },
  { name: "Magsaysay (Pob.)", total_households: 935 },
  { name: "Rizal (Pob.)", total_households: 898 },
  { name: "Salvacion", total_households: 395 },
  { name: "Santo Tomas", total_households: 375 },
  { name: "Tres Reyes", total_households: 244 },
];

async function verifyAndInsert() {
  try {
    console.log("🔍 Verifying household data against database barangays...\n");

    // Get all barangays
    const { data: allBarangays } = await supabase
      .from("barangays")
      .select("id, name, municipality");

    console.log(`Database has ${allBarangays.length} barangays\n`);

    // Match household data to barangays
    const toInsert = [];
    const notFound = [];

    for (const household of householdData) {
      const barangay = allBarangays.find((b) => b.name === household.name);
      if (barangay) {
        toInsert.push({
          municipality: barangay.municipality,
          barangay_id: barangay.id,
          barangay_name: household.name,
          total_households: household.total_households,
        });
      } else {
        notFound.push(household.name);
      }
    }

    console.log(`✅ Matched: ${toInsert.length}/${householdData.length}`);

    if (notFound.length > 0) {
      console.log(`\n⚠️  NOT FOUND in database (${notFound.length}):`);
      notFound.forEach((name) => console.log(`  - ${name}`));
    }

    // Clear and insert
    console.log(`\n🔄 Clearing old data and inserting ${toInsert.length} records...\n`);
    await supabase.from("barangay_household_updates").delete().neq("id", "");
    await supabase.from("barangay_households").delete().neq("id", "");

    const batchSize = 50;
    for (let i = 0; i < toInsert.length; i += batchSize) {
      const batch = toInsert.slice(i, i + batchSize);
      const { error } = await supabase
        .from("barangay_households")
        .insert(batch);

      if (error) {
        console.error(`❌ Batch ${Math.floor(i / batchSize) + 1} error:`, error);
      } else {
        console.log(
          `✅ Batch ${Math.floor(i / batchSize) + 1}: ${batch.length} rows inserted`
        );
      }
    }

    // Verify
    const { count } = await supabase
      .from("barangay_households")
      .select("*", { count: "exact", head: true });

    console.log(`\n✅ Total inserted: ${count} rows`);

    // Show by municipality
    const { data: byMuni } = await supabase
      .from("barangay_households")
      .select("municipality");

    if (byMuni) {
      const counts = {};
      for (const row of byMuni) {
        counts[row.municipality] = (counts[row.municipality] || 0) + 1;
      }

      console.log("\nData by municipality:");
      Object.entries(counts)
        .sort()
        .forEach(([muni, cnt]) => {
          console.log(`  ${muni}: ${cnt} barangays`);
        });
    }

    // Test Diffun query
    const { data: diffunTest } = await supabase
      .from("barangay_household_status")
      .select("barangay_name, total_households")
      .eq("municipality", "DIFFUN, QUIRINO")
      .order("barangay_name");

    if (diffunTest && diffunTest.length > 0) {
      console.log(`\n✅ DIFFUN barangays (${diffunTest.length}):`);
      diffunTest.forEach((b) => {
        console.log(`  ${b.barangay_name}: ${b.total_households}`);
      });
    }

    console.log("\n🎉 SUCCESS! Data is ready. Reload your app now.");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

verifyAndInsert();
