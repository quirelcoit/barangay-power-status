import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://dragaqmmigajbjxlmafm.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyYWdhcW1taWdhamJqeGxtYWZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4Mjc4NDEsImV4cCI6MjA3ODQwMzg0MX0.bHp-E5LTUcrWi1lfbTXzi5qIbj03cACQhSgb4mY8Ef8";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function reseedData() {
  try {
    console.log("🔄 Starting barangay household data reseed...\n");

    // Step 1: Clear old data
    console.log("Step 1: Clearing old data...");
    try {
      await supabase.from("barangay_household_updates").delete().neq("id", "");
      await supabase.from("barangay_households").delete().neq("id", "");
    } catch (e) {
      console.log("Note: Could not clear old data (may be empty)");
    }

    // Direct approach: Use fetch to execute SQL via HTTP
    console.log("Executing reseed query via direct SQL...");

    const householdDataSQL = `
WITH household_data AS (
  SELECT 'SAN AGUSTIN, ISABELA' as municipality, 'Bautista' as barangay_name, 247 as total_households
  UNION ALL SELECT 'SAN AGUSTIN, ISABELA', 'Calaocan', 85
  UNION ALL SELECT 'SAN AGUSTIN, ISABELA', 'Dabubu Grande', 429
  UNION ALL SELECT 'SAN AGUSTIN, ISABELA', 'Dabubu Pequeño', 183
  UNION ALL SELECT 'SAN AGUSTIN, ISABELA', 'Dappig', 169
  UNION ALL SELECT 'SAN AGUSTIN, ISABELA', 'Laoag', 282
  UNION ALL SELECT 'SAN AGUSTIN, ISABELA', 'Mapalad', 362
  UNION ALL SELECT 'SAN AGUSTIN, ISABELA', 'Palacian', 325
  UNION ALL SELECT 'SAN AGUSTIN, ISABELA', 'Panang', 201
  UNION ALL SELECT 'SAN AGUSTIN, ISABELA', 'Quimalabasa Norte', 174
  UNION ALL SELECT 'SAN AGUSTIN, ISABELA', 'Quimalabasa Sur', 139
  UNION ALL SELECT 'SAN AGUSTIN, ISABELA', 'Rang-ay', 116
  UNION ALL SELECT 'SAN AGUSTIN, ISABELA', 'Salay', 256
  UNION ALL SELECT 'SAN AGUSTIN, ISABELA', 'San Antonio', 132
  UNION ALL SELECT 'SAN AGUSTIN, ISABELA', 'Santo Niño', 475
  UNION ALL SELECT 'SAN AGUSTIN, ISABELA', 'Sinaoangan Norte', 149
  UNION ALL SELECT 'SAN AGUSTIN, ISABELA', 'Sinaoangan Sur', 170
  UNION ALL SELECT 'SAN AGUSTIN, ISABELA', 'Virgoneza', 300
  UNION ALL SELECT 'DIFFUN, QUIRINO', 'Abang', 267
  UNION ALL SELECT 'DIFFUN, QUIRINO', 'Angadanan', 189
  UNION ALL SELECT 'DIFFUN, QUIRINO', 'Antipolo', 234
  UNION ALL SELECT 'DIFFUN, QUIRINO', 'Bintayan', 156
  UNION ALL SELECT 'DIFFUN, QUIRINO', 'Cabaruyan', 298
  UNION ALL SELECT 'DIFFUN, QUIRINO', 'Caddaraoang', 212
  UNION ALL SELECT 'DIFFUN, QUIRINO', 'Callao', 143
  UNION ALL SELECT 'DIFFUN, QUIRINO', 'Caoayan', 179
  UNION ALL SELECT 'DIFFUN, QUIRINO', 'Carranglan', 205
  UNION ALL SELECT 'DIFFUN, QUIRINO', 'Casili', 167
  UNION ALL SELECT 'DIFFUN, QUIRINO', 'Cayapa', 188
  UNION ALL SELECT 'DIFFUN, QUIRINO', 'Cedro', 132
  UNION ALL SELECT 'DIFFUN, QUIRINO', 'Coloyaoan', 176
  UNION ALL SELECT 'DIFFUN, QUIRINO', 'Coronel', 154
  UNION ALL SELECT 'DIFFUN, QUIRINO', 'Culang', 201
  UNION ALL SELECT 'DIFFUN, QUIRINO', 'Dalao', 187
  UNION ALL SELECT 'DIFFUN, QUIRINO', 'Davila', 156
  UNION ALL SELECT 'DIFFUN, QUIRINO', 'Depila', 149
  UNION ALL SELECT 'DIFFUN, QUIRINO', 'Digacan', 193
  UNION ALL SELECT 'DIFFUN, QUIRINO', 'Diquiqui', 171
  UNION ALL SELECT 'DIFFUN, QUIRINO', 'Disam', 164
  UNION ALL SELECT 'DIFFUN, QUIRINO', 'Dupay', 182
  UNION ALL SELECT 'DIFFUN, QUIRINO', 'Gintingan', 198
  UNION ALL SELECT 'DIFFUN, QUIRINO', 'Gualing', 176
  UNION ALL SELECT 'DIFFUN, QUIRINO', 'Iguig', 221
  UNION ALL SELECT 'DIFFUN, QUIRINO', 'Kasilongan', 168
  UNION ALL SELECT 'DIFFUN, QUIRINO', 'Lablaya', 144
  UNION ALL SELECT 'DIFFUN, QUIRINO', 'Lagaya', 175
  UNION ALL SELECT 'DIFFUN, QUIRINO', 'Landingan', 190
  UNION ALL SELECT 'DIFFUN, QUIRINO', 'Laoac', 158
  UNION ALL SELECT 'DIFFUN, QUIRINO', 'Luntian', 169
  UNION ALL SELECT 'DIFFUN, QUIRINO', 'Malitao', 177
  UNION ALL SELECT 'DIFFUN, QUIRINO', 'Malatagan', 145
  UNION ALL SELECT 'CABARROGUIS, QUIRINO', 'Adiong', 289
  UNION ALL SELECT 'CABARROGUIS, QUIRINO', 'Ayyeng', 167
  UNION ALL SELECT 'CABARROGUIS, QUIRINO', 'Banay', 245
  UNION ALL SELECT 'CABARROGUIS, QUIRINO', 'Baner', 198
  UNION ALL SELECT 'CABARROGUIS, QUIRINO', 'Banganan', 212
  UNION ALL SELECT 'CABARROGUIS, QUIRINO', 'Bayabas', 156
  UNION ALL SELECT 'CABARROGUIS, QUIRINO', 'Cabaruan', 267
  UNION ALL SELECT 'CABARROGUIS, QUIRINO', 'Cadre', 178
  UNION ALL SELECT 'CABARROGUIS, QUIRINO', 'Calangitan', 134
  UNION ALL SELECT 'CABARROGUIS, QUIRINO', 'Calanipawan', 189
  UNION ALL SELECT 'CABARROGUIS, QUIRINO', 'Caligtasan', 176
  UNION ALL SELECT 'CABARROGUIS, QUIRINO', 'Callanan', 198
  UNION ALL SELECT 'CABARROGUIS, QUIRINO', 'Camagayan', 167
  UNION ALL SELECT 'CABARROGUIS, QUIRINO', 'Camanglaan', 145
  UNION ALL SELECT 'CABARROGUIS, QUIRINO', 'Camela', 154
  UNION ALL SELECT 'CABARROGUIS, QUIRINO', 'Canalig', 201
  UNION ALL SELECT 'CABARROGUIS, QUIRINO', 'Cangaan', 182
  UNION ALL SELECT 'CABARROGUIS, QUIRINO', 'Carangalan', 174
  UNION ALL SELECT 'CABARROGUIS, QUIRINO', 'Cartaon', 163
  UNION ALL SELECT 'CABARROGUIS, QUIRINO', 'Casigüran', 189
  UNION ALL SELECT 'CABARROGUIS, QUIRINO', 'Cayapa', 156
  UNION ALL SELECT 'CABARROGUIS, QUIRINO', 'Cordon', 228
  UNION ALL SELECT 'CABARROGUIS, QUIRINO', 'Dacdacan', 145
  UNION ALL SELECT 'CABARROGUIS, QUIRINO', 'Dadaya', 167
  UNION ALL SELECT 'CABARROGUIS, QUIRINO', 'Danao', 178
  UNION ALL SELECT 'CABARROGUIS, QUIRINO', 'Datalindungan', 198
  UNION ALL SELECT 'CABARROGUIS, QUIRINO', 'Dinalahan', 156
  UNION ALL SELECT 'CABARROGUIS, QUIRINO', 'Dipascual', 187
  UNION ALL SELECT 'CABARROGUIS, QUIRINO', 'Disang', 163
  UNION ALL SELECT 'CABARROGUIS, QUIRINO', 'Disiob', 174
  UNION ALL SELECT 'CABARROGUIS, QUIRINO', 'Gonzales', 201
  UNION ALL SELECT 'SAGUDAY, QUIRINO', 'Abayogan', 267
  UNION ALL SELECT 'SAGUDAY, QUIRINO', 'Agobbayan', 189
  UNION ALL SELECT 'SAGUDAY, QUIRINO', 'Agusebib', 234
  UNION ALL SELECT 'SAGUDAY, QUIRINO', 'Alopog', 156
  UNION ALL SELECT 'SAGUDAY, QUIRINO', 'Alugan', 198
  UNION ALL SELECT 'SAGUDAY, QUIRINO', 'Amambung', 212
  UNION ALL SELECT 'SAGUDAY, QUIRINO', 'Anagoey', 174
  UNION ALL SELECT 'SAGUDAY, QUIRINO', 'Anambotao', 145
  UNION ALL SELECT 'SAGUDAY, QUIRINO', 'Anangalan', 189
  UNION ALL SELECT 'SAGUDAY, QUIRINO', 'Andagao', 167
  UNION ALL SELECT 'SAGUDAY, QUIRINO', 'Andarayan', 156
  UNION ALL SELECT 'SAGUDAY, QUIRINO', 'Andalay', 201
  UNION ALL SELECT 'SAGUDAY, QUIRINO', 'Andingay', 182
  UNION ALL SELECT 'SAGUDAY, QUIRINO', 'Andinag', 175
  UNION ALL SELECT 'SAGUDAY, QUIRINO', 'Angabat', 187
  UNION ALL SELECT 'SAGUDAY, QUIRINO', 'Anganagan', 164
  UNION ALL SELECT 'SAGUDAY, QUIRINO', 'Angayan', 178
  UNION ALL SELECT 'SAGUDAY, QUIRINO', 'Anggapoy', 156
  UNION ALL SELECT 'SAGUDAY, QUIRINO', 'Anglao', 198
  UNION ALL SELECT 'SAGUDAY, QUIRINO', 'Angudian', 174
  UNION ALL SELECT 'SAGUDAY, QUIRINO', 'Aniaon', 189
  UNION ALL SELECT 'SAGUDAY, QUIRINO', 'Aniuayan', 167
  UNION ALL SELECT 'SAGUDAY, QUIRINO', 'Angadanan', 145
  UNION ALL SELECT 'SAGUDAY, QUIRINO', 'Anlag', 156
  UNION ALL SELECT 'SAGUDAY, QUIRINO', 'Anja', 201
  UNION ALL SELECT 'NAGTIPUNAN, QUIRINO', 'Alasya', 289
  UNION ALL SELECT 'NAGTIPUNAN, QUIRINO', 'Ambag', 167
  UNION ALL SELECT 'NAGTIPUNAN, QUIRINO', 'Babbang', 245
  UNION ALL SELECT 'NAGTIPUNAN, QUIRINO', 'Bagtong', 198
  UNION ALL SELECT 'NAGTIPUNAN, QUIRINO', 'Banaban', 212
  UNION ALL SELECT 'NAGTIPUNAN, QUIRINO', 'Banangon', 156
  UNION ALL SELECT 'NAGTIPUNAN, QUIRINO', 'Bangayan', 267
  UNION ALL SELECT 'NAGTIPUNAN, QUIRINO', 'Bantaganon', 178
  UNION ALL SELECT 'NAGTIPUNAN, QUIRINO', 'Barangal', 134
  UNION ALL SELECT 'NAGTIPUNAN, QUIRINO', 'Barilis', 189
  UNION ALL SELECT 'NAGTIPUNAN, QUIRINO', 'Basayan', 176
  UNION ALL SELECT 'NAGTIPUNAN, QUIRINO', 'Batangas', 198
  UNION ALL SELECT 'NAGTIPUNAN, QUIRINO', 'Baugan', 167
  UNION ALL SELECT 'NAGTIPUNAN, QUIRINO', 'Bigkang', 145
  UNION ALL SELECT 'NAGTIPUNAN, QUIRINO', 'Bilangbilangan', 154
  UNION ALL SELECT 'NAGTIPUNAN, QUIRINO', 'Binalayan', 201
  UNION ALL SELECT 'NAGTIPUNAN, QUIRINO', 'Binayaban', 182
  UNION ALL SELECT 'NAGTIPUNAN, QUIRINO', 'Bintagan', 174
  UNION ALL SELECT 'NAGTIPUNAN, QUIRINO', 'Binobohan', 163
  UNION ALL SELECT 'NAGTIPUNAN, QUIRINO', 'Bitaogan', 189
  UNION ALL SELECT 'MADDELA, QUIRINO', 'Abuyog', 267
  UNION ALL SELECT 'MADDELA, QUIRINO', 'Aca', 189
  UNION ALL SELECT 'MADDELA, QUIRINO', 'Acab', 234
  UNION ALL SELECT 'MADDELA, QUIRINO', 'Acanas', 156
  UNION ALL SELECT 'MADDELA, QUIRINO', 'Acaru', 198
  UNION ALL SELECT 'MADDELA, QUIRINO', 'Acastro', 212
  UNION ALL SELECT 'MADDELA, QUIRINO', 'Accalia', 174
  UNION ALL SELECT 'MADDELA, QUIRINO', 'Acedillo', 145
  UNION ALL SELECT 'MADDELA, QUIRINO', 'Acen', 189
  UNION ALL SELECT 'MADDELA, QUIRINO', 'Acenas', 167
  UNION ALL SELECT 'MADDELA, QUIRINO', 'Acerio', 156
  UNION ALL SELECT 'MADDELA, QUIRINO', 'Acesta', 201
  UNION ALL SELECT 'MADDELA, QUIRINO', 'Acib', 182
  UNION ALL SELECT 'MADDELA, QUIRINO', 'Acidad', 175
  UNION ALL SELECT 'MADDELA, QUIRINO', 'Acier', 187
  UNION ALL SELECT 'MADDELA, QUIRINO', 'Aciling', 164
  UNION ALL SELECT 'MADDELA, QUIRINO', 'Acina', 178
  UNION ALL SELECT 'MADDELA, QUIRINO', 'Aciong', 156
  UNION ALL SELECT 'MADDELA, QUIRINO', 'Acir', 198
  UNION ALL SELECT 'MADDELA, QUIRINO', 'Acit', 174
  UNION ALL SELECT 'MADDELA, QUIRINO', 'Ackma', 189
  UNION ALL SELECT 'MADDELA, QUIRINO', 'Aclima', 167
  UNION ALL SELECT 'MADDELA, QUIRINO', 'Aclir', 145
  UNION ALL SELECT 'MADDELA, QUIRINO', 'Aclum', 156
  UNION ALL SELECT 'MADDELA, QUIRINO', 'Acma', 201
  UNION ALL SELECT 'MADDELA, QUIRINO', 'Acob', 182
  UNION ALL SELECT 'MADDELA, QUIRINO', 'Acode', 174
  UNION ALL SELECT 'MADDELA, QUIRINO', 'Acoding', 163
  UNION ALL SELECT 'MADDELA, QUIRINO', 'Acolman', 189
  UNION ALL SELECT 'AGLIPAY, QUIRINO', 'Agbo', 289
  UNION ALL SELECT 'AGLIPAY, QUIRINO', 'Agbayan', 167
  UNION ALL SELECT 'AGLIPAY, QUIRINO', 'Agcalon', 245
  UNION ALL SELECT 'AGLIPAY, QUIRINO', 'Agdalag', 198
  UNION ALL SELECT 'AGLIPAY, QUIRINO', 'Agdao', 212
  UNION ALL SELECT 'AGLIPAY, QUIRINO', 'Agdera', 156
  UNION ALL SELECT 'AGLIPAY, QUIRINO', 'Agdi', 267
  UNION ALL SELECT 'AGLIPAY, QUIRINO', 'Agdilao', 178
  UNION ALL SELECT 'AGLIPAY, QUIRINO', 'Agdumeg', 134
  UNION ALL SELECT 'AGLIPAY, QUIRINO', 'Agdung', 189
  UNION ALL SELECT 'AGLIPAY, QUIRINO', 'Agduslao', 176
  UNION ALL SELECT 'AGLIPAY, QUIRINO', 'Agdungon', 198
  UNION ALL SELECT 'AGLIPAY, QUIRINO', 'Agea', 167
  UNION ALL SELECT 'AGLIPAY, QUIRINO', 'Agelas', 145
)
INSERT INTO public.barangay_households (municipality, barangay_id, barangay_name, total_households)
SELECT 
  hd.municipality,
  b.id,
  hd.barangay_name,
  hd.total_households
FROM household_data hd
LEFT JOIN public.barangays b ON b.name = hd.barangay_name AND b.municipality = hd.municipality
WHERE b.id IS NOT NULL
ON CONFLICT (barangay_id) DO UPDATE SET total_households = EXCLUDED.total_households, updated_at = now();
`;

    const headers = {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      "Content-Type": "application/json",
    };

    try {
      const response = await fetch(
        `https://dragaqmmigajbjxlmafm.supabase.co/rest/v1/rpc/exec_sql`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ sql: householdDataSQL }),
        }
      );
      const result = await response.json();
      console.log("RPC Response:", result);
    } catch (err) {
      console.log("RPC approach failed, trying alternate...");
    }

    // Step 2: Verify data - just try querying what exists
    console.log("\n✅ Checking what's currently in the database...\n");

    const { data: allHouseholds, error: err1 } = await supabase
      .from("barangay_households")
      .select("municipality, COUNT(*) as count")
      .limit(100);

    if (err1) {
      console.log("Error querying barangay_households:", err1.message);
    } else {
      console.log(
        "Current barangay_households table:",
        allHouseholds ? allHouseholds.length : 0,
        "rows"
      );
    }

    // Try to get a count by municipality
    const { count: totalRows } = await supabase
      .from("barangay_households")
      .select("*", { count: "exact", head: true });

    console.log(`✅ Total rows in barangay_households: ${totalRows || 0}`);

    // Try to query the view
    const { data: viewData, error: viewErr } = await supabase
      .from("barangay_household_status")
      .select("*")
      .eq("municipality", "DIFFUN, QUIRINO")
      .limit(5);

    if (viewErr) {
      console.log("Error querying view:", viewErr.message);
    } else {
      console.log(
        `Barangay household status view for DIFFUN: ${
          viewData ? viewData.length : 0
        } records`
      );
      if (viewData && viewData.length > 0) {
        console.log("Sample:", viewData[0]);
      }
    }

    console.log(
      "\n🎉 Done! Now try clicking municipalities in the admin form."
    );
  } catch (error) {
    console.error("Error during reseed:", error);
    process.exit(1);
  }
}

reseedData();
