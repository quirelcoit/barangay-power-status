import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://dragaqmmigajbjxlmafm.supabase.co",
  // Use service role key for admin operations - but we don't have it, so we'll use a different approach
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyYWdhcW1taWdhamJqeGxtYWZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4Mjc4NDEsImV4cCI6MjA3ODQwMzg0MX0.bHp-E5LTUcrWi1lfbTXzi5qIbj03cACQhSgb4mY8Ef8"
);

async function testInsert() {
  try {
    console.log("Testing direct insert...");

    // Get a test barangay
    const { data: barangay } = await supabase
      .from("barangays")
      .select("id, name, municipality")
      .limit(1)
      .single();

    console.log("Test barangay:", barangay);

    // Try to insert
    const { data, error } = await supabase.from("barangay_households").insert({
      municipality: barangay.municipality,
      barangay_id: barangay.id,
      barangay_name: barangay.name,
      total_households: 250,
    });

    if (error) {
      console.error("Insert error:", error);
      console.log(
        "\nThis means RLS is blocking non-authenticated or unauthorized inserts."
      );
      console.log("You need to either:");
      console.log(
        "1. Go to Supabase > SQL Editor and run: ALTER TABLE public.barangay_households DISABLE ROW LEVEL SECURITY;"
      );
      console.log("2. Or update the RLS policy to allow inserts");
      console.log("3. Or use a service role key for this script");
    } else {
      console.log("✅ Insert successful!");
      console.log(data);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

testInsert();
