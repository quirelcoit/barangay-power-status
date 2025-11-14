import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://dragaqmmigajbjxlmafm.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyYWdhcW1taWdhamJqeGxtYWZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4Mjc4NDEsImV4cCI6MjA3ODQwMzg0MX0.bHp-E5LTUcrWi1lfbTXzi5qIbj03cACQhSgb4mY8Ef8"
);

async function reseedWithActualBarangays() {
  try {
    console.log("🔄 Reseeding with ACTUAL barangays from database...\n");

    // Clear old data
    console.log("Clearing old data...");
    await supabase.from("barangay_household_updates").delete().neq("id", "");
    await supabase.from("barangay_households").delete().neq("id", "");

    // Get all barangays
    const { data: allBarangays } = await supabase
      .from("barangays")
      .select("id, name, municipality");

    console.log(`Found ${allBarangays.length} barangays\n`);

    // Create household entries for ALL barangays with random-ish household counts
    const toInsert = [];
    for (const barangay of allBarangays) {
      // Generate realistic household counts based on barangay name hash
      const hash = barangay.name
        .split("")
        .reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const households = 100 + (hash % 300); // 100-400 households per barangay

      toInsert.push({
        municipality: barangay.municipality,
        barangay_id: barangay.id,
        barangay_name: barangay.name,
        total_households: households,
      });
    }

    console.log(`Inserting ${toInsert.length} barangay household records...`);

    // Insert in batches
    const batchSize = 50;
    for (let i = 0; i < toInsert.length; i += batchSize) {
      const batch = toInsert.slice(i, i + batchSize);
      const { error } = await supabase
        .from("barangay_households")
        .insert(batch);

      if (error) {
        console.error(`Error in batch ${Math.floor(i / batchSize) + 1}:`, error);
      } else {
        console.log(
          `✅ Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(toInsert.length / batchSize)}: inserted ${batch.length} rows`
        );
      }
    }

    // Verify
    console.log("\n✅ Verifying...");
    const { count } = await supabase
      .from("barangay_households")
      .select("*", { count: "exact", head: true });

    console.log(`Total rows inserted: ${count}\n`);

    // Show by municipality
    const { data: byMuni } = await supabase
      .from("barangay_households")
      .select("municipality")
      .then((res) => res);

    const counts = {};
    for (const row of byMuni) {
      counts[row.municipality] = (counts[row.municipality] || 0) + 1;
    }

    console.log("Data by municipality:");
    Object.entries(counts)
      .sort()
      .forEach(([muni, cnt]) => {
        console.log(`  ${muni}: ${cnt} barangays`);
      });

    // Test query for Diffun
    console.log("\n📍 Testing query for DIFFUN, QUIRINO...");
    const { data: diffunTest, error: diffunErr } = await supabase
      .from("barangay_household_status")
      .select("*")
      .eq("municipality", "DIFFUN, QUIRINO");

    if (diffunErr) {
      console.error("Error:", diffunErr);
    } else {
      console.log(`✅ Found ${diffunTest.length} Diffun barangays`);
      if (diffunTest.length > 0) {
        console.log("Sample:", diffunTest[0]);
      }
    }

    console.log("\n🎉 DONE! Your app should now work. Try reloading the admin page.");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

reseedWithActualBarangays();
