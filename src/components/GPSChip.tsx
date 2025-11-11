import { useEffect, useState } from "react";
import { MapPin, Loader } from "lucide-react";
import { getCurrentLocation, formatCoordinates } from "../lib/geo";

interface GPSChipProps {
  onLocation?: (lat: number, lng: number) => void;
  disabled?: boolean;
}

export function GPSChip({ onLocation, disabled = false }: GPSChipProps) {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetLocation = async () => {
    try {
      setLoading(true);
      setError(null);
      const loc = await getCurrentLocation();
      setLocation(loc);
      onLocation?.(loc.lat, loc.lng);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get location");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-request location on mount if not already set
    if (!location && !disabled) {
      // Optional: auto-request on mount
      // handleGetLocation();
    }
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2 font-medium text-gray-700">
        <MapPin className="w-4 h-4" />
        Location
      </label>
      <button
        onClick={handleGetLocation}
        disabled={loading || disabled}
        className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-power-300 rounded-lg hover:border-power-500 hover:bg-power-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            Getting location...
          </>
        ) : location ? (
          <>
            <MapPin className="w-4 h-4 text-power-600" />
            <span className="text-sm font-mono">
              {formatCoordinates(location.lat, location.lng)}
            </span>
          </>
        ) : (
          <>
            <MapPin className="w-4 h-4" />
            Use GPS
          </>
        )}
      </button>
      {error && <p className="text-sm text-danger-600">{error}</p>}
    </div>
  );
}
