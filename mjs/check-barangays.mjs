import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://dragaqmmigajbjxlmafm.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyYWdhcW1taWdhamJqeGxtYWZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4Mjc4NDEsImV4cCI6MjA3ODQwMzg0MX0.bHp-E5LTUcrWi1lfbTXzi5qIbj03cACQhSgb4mY8Ef8"
);

async function checkBarangays() {
  const { data: allBarangays } = await supabase
    .from("barangays")
    .select("id, name, municipality");

  console.log("All barangays in database:\n");
  const byMuni = {};
  for (const b of allBarangays) {
    if (!byMuni[b.municipality]) {
      byMuni[b.municipality] = [];
    }
    byMuni[b.municipality].push(b.name);
  }

  Object.keys(byMuni)
    .sort()
    .forEach((muni) => {
      console.log(`${muni}:`);
      byMuni[muni].sort().forEach((name) => {
        console.log(`  - ${name}`);
      });
      console.log();
    });
}

checkBarangays();
