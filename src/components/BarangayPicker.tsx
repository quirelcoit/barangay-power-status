import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { MapPin } from "lucide-react";

interface Barangay {
  id: string;
  name: string;
  municipality: string;
}

interface BarangayPickerProps {
  value?: string;
  onChange: (barangayId: string, customLocation?: string) => void;
  label?: string;
}

const CUSTOM_BARANGAY_ID = "__CUSTOM__";

export function BarangayPicker({
  value,
  onChange,
  label = "Barangay",
}: BarangayPickerProps) {
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCustom, setIsCustom] = useState(false);
  const [customLocation, setCustomLocation] = useState("");

  useEffect(() => {
    async function fetchBarangays() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("barangays")
          .select("id, name, municipality")
          .eq("is_active", true)
          .order("municipality")
          .order("name");

        if (error) throw error;
        setBarangays(data || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load barangays"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchBarangays();
  }, []);

  const grouped = barangays.reduce((acc, barangay) => {
    if (!acc[barangay.municipality]) {
      acc[barangay.municipality] = [];
    }
    acc[barangay.municipality].push(barangay);
    return acc;
  }, {} as Record<string, Barangay[]>);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue === CUSTOM_BARANGAY_ID) {
      setIsCustom(true);
      setCustomLocation("");
    } else {
      setIsCustom(false);
      onChange(selectedValue);
    }
  };

  const handleCustomLocationChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCustomLocation(e.target.value);
  };

  const handleCustomLocationBlur = () => {
    if (customLocation.trim()) {
      // Use custom location as ID with prefix
      onChange(
        `${CUSTOM_BARANGAY_ID}:${customLocation.trim()}`,
        customLocation.trim()
      );
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2 font-medium text-gray-700">
        <MapPin className="w-4 h-4" />
        {label} *
      </label>

      <select
        value={isCustom ? CUSTOM_BARANGAY_ID : value || ""}
        onChange={handleSelectChange}
        disabled={loading || error !== null}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-power-500 disabled:bg-gray-100"
      >
        <option value="">
          {loading ? "Loading..." : error ? "Error loading" : "Select barangay"}
        </option>
        {Object.entries(grouped).map(([municipality, items]) => (
          <optgroup key={municipality} label={municipality}>
            {items.map((barangay) => (
              <option key={barangay.id} value={barangay.id}>
                {barangay.name}
              </option>
            ))}
          </optgroup>
        ))}
        <option value={CUSTOM_BARANGAY_ID}>➕ Other (Not in List)</option>
      </select>

      {isCustom && (
        <input
          type="text"
          value={customLocation}
          onChange={handleCustomLocationChange}
          onBlur={handleCustomLocationBlur}
          placeholder="Enter barangay or sitio name..."
          maxLength={100}
          autoFocus
          className="px-3 py-2 border-2 border-power-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-power-500 bg-power-50"
        />
      )}

      {error && <p className="text-sm text-danger-600">{error}</p>}
    </div>
  );
}
