import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { ChevronDown } from "lucide-react";

interface BarangayData {
  id: string;
  name: string;
  municipality: string;
}

interface MunicipalityBarangayPickerProps {
  value: string;
  customLocation?: string;
  onChange: (barangayId: string, customLocation?: string) => void;
}

export function MunicipalityBarangayPicker({
  value,
  customLocation,
  onChange,
}: MunicipalityBarangayPickerProps) {
  const [barangays, setBarangays] = useState<BarangayData[]>([]);
  const [municipalities, setMunicipalities] = useState<string[]>([]);
  const [selectedMunicipality, setSelectedMunicipality] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBarangays() {
      try {
        const { data, error } = await supabase
          .from("barangays")
          .select("id, name, municipality")
          .eq("is_active", true)
          .order("municipality")
          .order("name");

        if (error) throw error;

        const barangaysData = (data || []) as BarangayData[];
        setBarangays(barangaysData);

        // Extract unique municipalities
        const uniqueMunicipalities = Array.from(
          new Set(barangaysData.map((b) => b.municipality))
        ).sort();
        setMunicipalities(uniqueMunicipalities);

        // If a barangay is already selected, set the municipality
        if (value && value !== "__CUSTOM__" && barangaysData.length > 0) {
          const selected = barangaysData.find((b) => b.id === value);
          if (selected) {
            setSelectedMunicipality(selected.municipality);
          }
        }
      } catch (err) {
        console.error("Failed to load barangays:", err);
      } finally {
        setLoading(false);
      }
    }

    loadBarangays();
  }, [value]);

  const filteredBarangays = selectedMunicipality
    ? barangays.filter((b) => b.municipality === selectedMunicipality)
    : [];

  const isCustom = value?.startsWith("__CUSTOM__:");

  return (
    <div className="space-y-4">
      {/* Municipality Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Municipality *
        </label>
        <div className="relative">
          <select
            value={selectedMunicipality}
            onChange={(e) => {
              setSelectedMunicipality(e.target.value);
              onChange(""); // Reset barangay
            }}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-power-500 focus:border-transparent bg-white appearance-none pr-10"
          >
            <option value="">Select municipality...</option>
            {municipalities.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
        </div>
      </div>

      {/* Barangay Dropdown */}
      {selectedMunicipality && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Barangay *
          </label>
          <div className="space-y-2">
            <div className="relative">
              <select
                value={isCustom ? "__CUSTOM__" : value}
                onChange={(e) => {
                  const selected = e.target.value;
                  if (selected === "__CUSTOM__") {
                    onChange("__CUSTOM__:");
                  } else {
                    onChange(selected);
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-power-500 focus:border-transparent bg-white appearance-none pr-10"
              >
                <option value="">Select barangay...</option>
                {filteredBarangays.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
                <option value="__CUSTOM__">➕ Other (Not in List)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
            </div>

            {/* Custom Location Input */}
            {isCustom && (
              <input
                type="text"
                placeholder="Enter location name..."
                value={customLocation || ""}
                onChange={(e) => onChange("__CUSTOM__:", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-power-500 focus:border-transparent"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
