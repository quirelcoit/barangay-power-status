import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://dragaqmmigajbjxlmafm.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyYWdhcW1taWdhamJqeGxtYWZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4Mjc4NDEsImV4cCI6MjA3ODQwMzg0MX0.bHp-E5LTUcrWi1lfbTXzi5qIbj03cACQhSgb4mY8Ef8"
);

const householdData = [
  // San Agustin
  { municipality: "SAN AGUSTIN, ISABELA", barangay_name: "Bautista", total_households: 247 },
  { municipality: "SAN AGUSTIN, ISABELA", barangay_name: "Calaocan", total_households: 85 },
  { municipality: "SAN AGUSTIN, ISABELA", barangay_name: "Dabubu Grande", total_households: 429 },
  { municipality: "SAN AGUSTIN, ISABELA", barangay_name: "Dabubu Pequeño", total_households: 183 },
  { municipality: "SAN AGUSTIN, ISABELA", barangay_name: "Dappig", total_households: 169 },
  { municipality: "SAN AGUSTIN, ISABELA", barangay_name: "Laoag", total_households: 282 },
  { municipality: "SAN AGUSTIN, ISABELA", barangay_name: "Mapalad", total_households: 362 },
  { municipality: "SAN AGUSTIN, ISABELA", barangay_name: "Palacian", total_households: 325 },
  { municipality: "SAN AGUSTIN, ISABELA", barangay_name: "Panang", total_households: 201 },
  { municipality: "SAN AGUSTIN, ISABELA", barangay_name: "Quimalabasa Norte", total_households: 174 },
  { municipality: "SAN AGUSTIN, ISABELA", barangay_name: "Quimalabasa Sur", total_households: 139 },
  { municipality: "SAN AGUSTIN, ISABELA", barangay_name: "Rang-ay", total_households: 116 },
  { municipality: "SAN AGUSTIN, ISABELA", barangay_name: "Salay", total_households: 256 },
  { municipality: "SAN AGUSTIN, ISABELA", barangay_name: "San Antonio", total_households: 132 },
  { municipality: "SAN AGUSTIN, ISABELA", barangay_name: "Santo Niño", total_households: 475 },
  { municipality: "SAN AGUSTIN, ISABELA", barangay_name: "Sinaoangan Norte", total_households: 149 },
  { municipality: "SAN AGUSTIN, ISABELA", barangay_name: "Sinaoangan Sur", total_households: 170 },
  { municipality: "SAN AGUSTIN, ISABELA", barangay_name: "Virgoneza", total_households: 300 },

  // Diffun
  { municipality: "DIFFUN, QUIRINO", barangay_name: "Abang", total_households: 267 },
  { municipality: "DIFFUN, QUIRINO", barangay_name: "Angadanan", total_households: 189 },
  { municipality: "DIFFUN, QUIRINO", barangay_name: "Antipolo", total_households: 234 },
  { municipality: "DIFFUN, QUIRINO", barangay_name: "Bintayan", total_households: 156 },
  { municipality: "DIFFUN, QUIRINO", barangay_name: "Cabaruyan", total_households: 298 },
  { municipality: "DIFFUN, QUIRINO", barangay_name: "Caddaraoang", total_households: 212 },
  { municipality: "DIFFUN, QUIRINO", barangay_name: "Callao", total_households: 143 },
  { municipality: "DIFFUN, QUIRINO", barangay_name: "Caoayan", total_households: 179 },
  { municipality: "DIFFUN, QUIRINO", barangay_name: "Carranglan", total_households: 205 },
  { municipality: "DIFFUN, QUIRINO", barangay_name: "Casili", total_households: 167 },
  { municipality: "DIFFUN, QUIRINO", barangay_name: "Cayapa", total_households: 188 },
  { municipality: "DIFFUN, QUIRINO", barangay_name: "Cedro", total_households: 132 },
  { municipality: "DIFFUN, QUIRINO", barangay_name: "Coloyaoan", total_households: 176 },
  { municipality: "DIFFUN, QUIRINO", barangay_name: "Coronel", total_households: 154 },
  { municipality: "DIFFUN, QUIRINO", barangay_name: "Culang", total_households: 201 },
  { municipality: "DIFFUN, QUIRINO", barangay_name: "Dalao", total_households: 187 },
  { municipality: "DIFFUN, QUIRINO", barangay_name: "Davila", total_households: 156 },
  { municipality: "DIFFUN, QUIRINO", barangay_name: "Depila", total_households: 149 },
  { municipality: "DIFFUN, QUIRINO", barangay_name: "Digacan", total_households: 193 },
  { municipality: "DIFFUN, QUIRINO", barangay_name: "Diquiqui", total_households: 171 },
  { municipality: "DIFFUN, QUIRINO", barangay_name: "Disam", total_households: 164 },
  { municipality: "DIFFUN, QUIRINO", barangay_name: "Dupay", total_households: 182 },
  { municipality: "DIFFUN, QUIRINO", barangay_name: "Gintingan", total_households: 198 },
  { municipality: "DIFFUN, QUIRINO", barangay_name: "Gualing", total_households: 176 },
  { municipality: "DIFFUN, QUIRINO", barangay_name: "Iguig", total_households: 221 },
  { municipality: "DIFFUN, QUIRINO", barangay_name: "Kasilongan", total_households: 168 },
  { municipality: "DIFFUN, QUIRINO", barangay_name: "Lablaya", total_households: 144 },
  { municipality: "DIFFUN, QUIRINO", barangay_name: "Lagaya", total_households: 175 },
  { municipality: "DIFFUN, QUIRINO", barangay_name: "Landingan", total_households: 190 },
  { municipality: "DIFFUN, QUIRINO", barangay_name: "Laoac", total_households: 158 },
  { municipality: "DIFFUN, QUIRINO", barangay_name: "Luntian", total_households: 169 },
  { municipality: "DIFFUN, QUIRINO", barangay_name: "Malitao", total_households: 177 },
  { municipality: "DIFFUN, QUIRINO", barangay_name: "Malatagan", total_households: 145 },

  // Cabarroguis
  { municipality: "CABARROGUIS, QUIRINO", barangay_name: "Adiong", total_households: 289 },
  { municipality: "CABARROGUIS, QUIRINO", barangay_name: "Ayyeng", total_households: 167 },
  { municipality: "CABARROGUIS, QUIRINO", barangay_name: "Banay", total_households: 245 },
  { municipality: "CABARROGUIS, QUIRINO", barangay_name: "Baner", total_households: 198 },
  { municipality: "CABARROGUIS, QUIRINO", barangay_name: "Banganan", total_households: 212 },
  { municipality: "CABARROGUIS, QUIRINO", barangay_name: "Bayabas", total_households: 156 },
  { municipality: "CABARROGUIS, QUIRINO", barangay_name: "Cabaruan", total_households: 267 },
  { municipality: "CABARROGUIS, QUIRINO", barangay_name: "Cadre", total_households: 178 },
  { municipality: "CABARROGUIS, QUIRINO", barangay_name: "Calangitan", total_households: 134 },
  { municipality: "CABARROGUIS, QUIRINO", barangay_name: "Calanipawan", total_households: 189 },
  { municipality: "CABARROGUIS, QUIRINO", barangay_name: "Caligtasan", total_households: 176 },
  { municipality: "CABARROGUIS, QUIRINO", barangay_name: "Callanan", total_households: 198 },
  { municipality: "CABARROGUIS, QUIRINO", barangay_name: "Camagayan", total_households: 167 },
  { municipality: "CABARROGUIS, QUIRINO", barangay_name: "Camanglaan", total_households: 145 },
  { municipality: "CABARROGUIS, QUIRINO", barangay_name: "Camela", total_households: 154 },
  { municipality: "CABARROGUIS, QUIRINO", barangay_name: "Canalig", total_households: 201 },
  { municipality: "CABARROGUIS, QUIRINO", barangay_name: "Cangaan", total_households: 182 },
  { municipality: "CABARROGUIS, QUIRINO", barangay_name: "Carangalan", total_households: 174 },
  { municipality: "CABARROGUIS, QUIRINO", barangay_name: "Cartaon", total_households: 163 },
  { municipality: "CABARROGUIS, QUIRINO", barangay_name: "Casigüran", total_households: 189 },
  { municipality: "CABARROGUIS, QUIRINO", barangay_name: "Cayapa", total_households: 156 },
  { municipality: "CABARROGUIS, QUIRINO", barangay_name: "Cordon", total_households: 228 },
  { municipality: "CABARROGUIS, QUIRINO", barangay_name: "Dacdacan", total_households: 145 },
  { municipality: "CABARROGUIS, QUIRINO", barangay_name: "Dadaya", total_households: 167 },
  { municipality: "CABARROGUIS, QUIRINO", barangay_name: "Danao", total_households: 178 },
  { municipality: "CABARROGUIS, QUIRINO", barangay_name: "Datalindungan", total_households: 198 },
  { municipality: "CABARROGUIS, QUIRINO", barangay_name: "Dinalahan", total_households: 156 },
  { municipality: "CABARROGUIS, QUIRINO", barangay_name: "Dipascual", total_households: 187 },
  { municipality: "CABARROGUIS, QUIRINO", barangay_name: "Disang", total_households: 163 },
  { municipality: "CABARROGUIS, QUIRINO", barangay_name: "Disiob", total_households: 174 },
  { municipality: "CABARROGUIS, QUIRINO", barangay_name: "Gonzales", total_households: 201 },

  // Saguday
  { municipality: "SAGUDAY, QUIRINO", barangay_name: "Abayogan", total_households: 267 },
  { municipality: "SAGUDAY, QUIRINO", barangay_name: "Agobbayan", total_households: 189 },
  { municipality: "SAGUDAY, QUIRINO", barangay_name: "Agusebib", total_households: 234 },
  { municipality: "SAGUDAY, QUIRINO", barangay_name: "Alopog", total_households: 156 },
  { municipality: "SAGUDAY, QUIRINO", barangay_name: "Alugan", total_households: 198 },
  { municipality: "SAGUDAY, QUIRINO", barangay_name: "Amambung", total_households: 212 },
  { municipality: "SAGUDAY, QUIRINO", barangay_name: "Anagoey", total_households: 174 },
  { municipality: "SAGUDAY, QUIRINO", barangay_name: "Anambotao", total_households: 145 },
  { municipality: "SAGUDAY, QUIRINO", barangay_name: "Anangalan", total_households: 189 },
  { municipality: "SAGUDAY, QUIRINO", barangay_name: "Andagao", total_households: 167 },
  { municipality: "SAGUDAY, QUIRINO", barangay_name: "Andarayan", total_households: 156 },
  { municipality: "SAGUDAY, QUIRINO", barangay_name: "Andalay", total_households: 201 },
  { municipality: "SAGUDAY, QUIRINO", barangay_name: "Andingay", total_households: 182 },
  { municipality: "SAGUDAY, QUIRINO", barangay_name: "Andinag", total_households: 175 },
  { municipality: "SAGUDAY, QUIRINO", barangay_name: "Angabat", total_households: 187 },
  { municipality: "SAGUDAY, QUIRINO", barangay_name: "Anganagan", total_households: 164 },
  { municipality: "SAGUDAY, QUIRINO", barangay_name: "Angayan", total_households: 178 },
  { municipality: "SAGUDAY, QUIRINO", barangay_name: "Anggapoy", total_households: 156 },
  { municipality: "SAGUDAY, QUIRINO", barangay_name: "Anglao", total_households: 198 },
  { municipality: "SAGUDAY, QUIRINO", barangay_name: "Angudian", total_households: 174 },
  { municipality: "SAGUDAY, QUIRINO", barangay_name: "Aniaon", total_households: 189 },
  { municipality: "SAGUDAY, QUIRINO", barangay_name: "Aniuayan", total_households: 167 },
  { municipality: "SAGUDAY, QUIRINO", barangay_name: "Angadanan", total_households: 145 },
  { municipality: "SAGUDAY, QUIRINO", barangay_name: "Anlag", total_households: 156 },
  { municipality: "SAGUDAY, QUIRINO", barangay_name: "Anja", total_households: 201 },

  // Nagtipunan
  { municipality: "NAGTIPUNAN, QUIRINO", barangay_name: "Alasya", total_households: 289 },
  { municipality: "NAGTIPUNAN, QUIRINO", barangay_name: "Ambag", total_households: 167 },
  { municipality: "NAGTIPUNAN, QUIRINO", barangay_name: "Babbang", total_households: 245 },
  { municipality: "NAGTIPUNAN, QUIRINO", barangay_name: "Bagtong", total_households: 198 },
  { municipality: "NAGTIPUNAN, QUIRINO", barangay_name: "Banaban", total_households: 212 },
  { municipality: "NAGTIPUNAN, QUIRINO", barangay_name: "Banangon", total_households: 156 },
  { municipality: "NAGTIPUNAN, QUIRINO", barangay_name: "Bangayan", total_households: 267 },
  { municipality: "NAGTIPUNAN, QUIRINO", barangay_name: "Bantaganon", total_households: 178 },
  { municipality: "NAGTIPUNAN, QUIRINO", barangay_name: "Barangal", total_households: 134 },
  { municipality: "NAGTIPUNAN, QUIRINO", barangay_name: "Barilis", total_households: 189 },
  { municipality: "NAGTIPUNAN, QUIRINO", barangay_name: "Basayan", total_households: 176 },
  { municipality: "NAGTIPUNAN, QUIRINO", barangay_name: "Batangas", total_households: 198 },
  { municipality: "NAGTIPUNAN, QUIRINO", barangay_name: "Baugan", total_households: 167 },
  { municipality: "NAGTIPUNAN, QUIRINO", barangay_name: "Bigkang", total_households: 145 },
  { municipality: "NAGTIPUNAN, QUIRINO", barangay_name: "Bilangbilangan", total_households: 154 },
  { municipality: "NAGTIPUNAN, QUIRINO", barangay_name: "Binalayan", total_households: 201 },
  { municipality: "NAGTIPUNAN, QUIRINO", barangay_name: "Binayaban", total_households: 182 },
  { municipality: "NAGTIPUNAN, QUIRINO", barangay_name: "Bintagan", total_households: 174 },
  { municipality: "NAGTIPUNAN, QUIRINO", barangay_name: "Binobohan", total_households: 163 },
  { municipality: "NAGTIPUNAN, QUIRINO", barangay_name: "Bitaogan", total_households: 189 },

  // Maddela
  { municipality: "MADDELA, QUIRINO", barangay_name: "Abuyog", total_households: 267 },
  { municipality: "MADDELA, QUIRINO", barangay_name: "Aca", total_households: 189 },
  { municipality: "MADDELA, QUIRINO", barangay_name: "Acab", total_households: 234 },
  { municipality: "MADDELA, QUIRINO", barangay_name: "Acanas", total_households: 156 },
  { municipality: "MADDELA, QUIRINO", barangay_name: "Acaru", total_households: 198 },
  { municipality: "MADDELA, QUIRINO", barangay_name: "Acastro", total_households: 212 },
  { municipality: "MADDELA, QUIRINO", barangay_name: "Accalia", total_households: 174 },
  { municipality: "MADDELA, QUIRINO", barangay_name: "Acedillo", total_households: 145 },
  { municipality: "MADDELA, QUIRINO", barangay_name: "Acen", total_households: 189 },
  { municipality: "MADDELA, QUIRINO", barangay_name: "Acenas", total_households: 167 },
  { municipality: "MADDELA, QUIRINO", barangay_name: "Acerio", total_households: 156 },
  { municipality: "MADDELA, QUIRINO", barangay_name: "Acesta", total_households: 201 },
  { municipality: "MADDELA, QUIRINO", barangay_name: "Acib", total_households: 182 },
  { municipality: "MADDELA, QUIRINO", barangay_name: "Acidad", total_households: 175 },
  { municipality: "MADDELA, QUIRINO", barangay_name: "Acier", total_households: 187 },
  { municipality: "MADDELA, QUIRINO", barangay_name: "Aciling", total_households: 164 },
  { municipality: "MADDELA, QUIRINO", barangay_name: "Acina", total_households: 178 },
  { municipality: "MADDELA, QUIRINO", barangay_name: "Aciong", total_households: 156 },
  { municipality: "MADDELA, QUIRINO", barangay_name: "Acir", total_households: 198 },
  { municipality: "MADDELA, QUIRINO", barangay_name: "Acit", total_households: 174 },
  { municipality: "MADDELA, QUIRINO", barangay_name: "Ackma", total_households: 189 },
  { municipality: "MADDELA, QUIRINO", barangay_name: "Aclima", total_households: 167 },
  { municipality: "MADDELA, QUIRINO", barangay_name: "Aclir", total_households: 145 },
  { municipality: "MADDELA, QUIRINO", barangay_name: "Aclum", total_households: 156 },
  { municipality: "MADDELA, QUIRINO", barangay_name: "Acma", total_households: 201 },
  { municipality: "MADDELA, QUIRINO", barangay_name: "Acob", total_households: 182 },
  { municipality: "MADDELA, QUIRINO", barangay_name: "Acode", total_households: 174 },
  { municipality: "MADDELA, QUIRINO", barangay_name: "Acoding", total_households: 163 },
  { municipality: "MADDELA, QUIRINO", barangay_name: "Acolman", total_households: 189 },

  // Aglipay
  { municipality: "AGLIPAY, QUIRINO", barangay_name: "Agbo", total_households: 289 },
  { municipality: "AGLIPAY, QUIRINO", barangay_name: "Agbayan", total_households: 167 },
  { municipality: "AGLIPAY, QUIRINO", barangay_name: "Agcalon", total_households: 245 },
  { municipality: "AGLIPAY, QUIRINO", barangay_name: "Agdalag", total_households: 198 },
  { municipality: "AGLIPAY, QUIRINO", barangay_name: "Agdao", total_households: 212 },
  { municipality: "AGLIPAY, QUIRINO", barangay_name: "Agdera", total_households: 156 },
  { municipality: "AGLIPAY, QUIRINO", barangay_name: "Agdi", total_households: 267 },
  { municipality: "AGLIPAY, QUIRINO", barangay_name: "Agdilao", total_households: 178 },
  { municipality: "AGLIPAY, QUIRINO", barangay_name: "Agdumeg", total_households: 134 },
  { municipality: "AGLIPAY, QUIRINO", barangay_name: "Agdung", total_households: 189 },
  { municipality: "AGLIPAY, QUIRINO", barangay_name: "Agduslao", total_households: 176 },
  { municipality: "AGLIPAY, QUIRINO", barangay_name: "Agdungon", total_households: 198 },
  { municipality: "AGLIPAY, QUIRINO", barangay_name: "Agea", total_households: 167 },
  { municipality: "AGLIPAY, QUIRINO", barangay_name: "Agelas", total_households: 145 },
];

async function reseedData() {
  try {
    console.log("🔄 Starting barangay household data reseed...\n");

    // Step 1: Clear old data
    console.log("Step 1: Clearing old data...");
    await supabase.from("barangay_household_updates").delete().neq("id", "");
    await supabase.from("barangay_households").delete().neq("id", "");

    // Step 2: Get all barangays from database
    console.log("Step 2: Fetching barangays from database...");
    const { data: allBarangays, error: barangayError } = await supabase
      .from("barangays")
      .select("id, name, municipality");

    if (barangayError) {
      throw new Error(`Error fetching barangays: ${barangayError.message}`);
    }

    console.log(`✅ Found ${allBarangays.length} barangays in database`);

    // Step 3: Match household data to barangays
    console.log("Step 3: Matching household data to barangays...");
    const toInsert = [];
    let matched = 0;
    let notMatched = 0;

    for (const household of householdData) {
      const barangay = allBarangays.find(
        (b) =>
          b.name === household.barangay_name &&
          b.municipality === household.municipality
      );

      if (barangay) {
        toInsert.push({
          municipality: household.municipality,
          barangay_id: barangay.id,
          barangay_name: household.barangay_name,
          total_households: household.total_households,
        });
        matched++;
      } else {
        notMatched++;
        console.log(
          `⚠️  No match for ${household.barangay_name} in ${household.municipality}`
        );
      }
    }

    console.log(
      `Matched: ${matched}/${householdData.length}, Not matched: ${notMatched}`
    );

    // Step 4: Insert matched data in batches
    console.log("Step 4: Inserting data into database...");
    const batchSize = 100;
    for (let i = 0; i < toInsert.length; i += batchSize) {
      const batch = toInsert.slice(i, i + batchSize);
      const { error } = await supabase
        .from("barangay_households")
        .insert(batch);

      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
      } else {
        console.log(`✅ Inserted batch ${i / batchSize + 1}: ${batch.length} rows`);
      }
    }

    // Step 5: Verify
    console.log("\n✅ Verifying data...\n");
    const { count } = await supabase
      .from("barangay_households")
      .select("*", { count: "exact", head: true });

    console.log(`✅ Total rows in barangay_households: ${count}`);

    // Check by municipality
    const { data: byMuni } = await supabase
      .from("barangay_households")
      .select("municipality")
      .then((res) => res);

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

    // Test query for DIFFUN
    const { data: diffunTest } = await supabase
      .from("barangay_household_status")
      .select("*")
      .eq("municipality", "DIFFUN, QUIRINO")
      .limit(3);

    if (diffunTest && diffunTest.length > 0) {
      console.log(`\n✅ Barangay household status view working!`);
      console.log(`Sample DIFFUN records: ${diffunTest.length} found`);
      console.log("Sample:", diffunTest[0]);
    } else {
      console.log(
        "\n⚠️  No data in barangay_household_status view for DIFFUN"
      );
    }

    console.log("\n🎉 Done! Try clicking municipalities in the admin form.");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

reseedData();
