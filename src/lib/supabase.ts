import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Default to placeholder if missing to prevent app crash
const url = supabaseUrl || "https://placeholder.supabase.co";
const key = supabaseAnonKey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";

// Show warning in console if environment variables are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠️ Missing Supabase environment variables. The app will load but features requiring Supabase will not work. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment."
  );
}

export const supabase = createClient(url, key, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
});

// Type definitions
export type Database = {
  public: {
    Tables: {
      barangays: {
        Row: {
          id: string;
          name: string;
          municipality: string;
          island_group: string | null;
          is_active: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["barangays"]["Row"], "id">;
      };
      reports: {
        Row: {
          id: string;
          created_at: string;
          barangay_id: string;
          lat: number | null;
          lng: number | null;
          category:
            | "broken_pole"
            | "fallen_wire"
            | "tree_on_line"
            | "transformer_noise"
            | "kwh_meter_damage"
            | "other";
          description: string | null;
          contact_hint: string | null;
          status: "new" | "triaged" | "in_progress" | "resolved" | "rejected";
          source_ip: string | null;
          device_fingerprint: string | null;
          turnstile_ok: boolean;
        };
        Insert: Omit<
          Database["public"]["Tables"]["reports"]["Row"],
          "id" | "created_at"
        >;
      };
      report_photos: {
        Row: {
          id: string;
          report_id: string;
          storage_path: string;
          width: number | null;
          height: number | null;
        };
        Insert: Omit<
          Database["public"]["Tables"]["report_photos"]["Row"],
          "id"
        >;
      };
      barangay_updates: {
        Row: {
          id: string;
          created_at: string;
          barangay_id: string;
          headline: string;
          body: string | null;
          power_status: "no_power" | "partial" | "energized";
          eta: string | null;
          author_uid: string | null;
          is_published: boolean;
        };
        Insert: Omit<
          Database["public"]["Tables"]["barangay_updates"]["Row"],
          "id" | "created_at"
        >;
      };
      staff_profiles: {
        Row: {
          uid: string;
          display_name: string | null;
          role: "admin" | "moderator";
        };
        Insert: Database["public"]["Tables"]["staff_profiles"]["Row"];
      };
    };
  };
};
