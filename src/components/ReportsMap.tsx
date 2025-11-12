import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "../lib/supabase";
import { AlertCircle } from "lucide-react";

interface Report {
  id: string;
  lat: number;
  lng: number;
  category: string;
  description: string | null;
  barangay_id: string | null;
  custom_location: string | null;
  created_at: string;
}

interface Barangay {
  id: string;
  name: string;
  municipality: string;
}

// Category severity colors
const CATEGORY_COLORS: Record<string, { color: string; label: string }> = {
  broken_pole: { color: "#dc2626", label: "🚩 Broken Pole" },
  fallen_wire: { color: "#ef4444", label: "⚡ Fallen Wire" },
  tree_on_line: { color: "#22c55e", label: "🌳 Tree on Line" },
  transformer_noise: { color: "#f59e0b", label: "🔊 Transformer Noise" },
  kwh_meter_damage: { color: "#3b82f6", label: "📊 KWH Meter Damage" },
  other: { color: "#8b5cf6", label: "❓ Other" },
};

// Create custom markers for different categories
const createMarkerIcon = (category: string) => {
  const categoryInfo = CATEGORY_COLORS[category] || CATEGORY_COLORS.other;
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        background-color: ${categoryInfo.color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
      ">
        ${categoryInfo.label.split(" ")[0]}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

export function ReportsMap() {
  const [reports, setReports] = useState<Report[]>([]);
  const [barangays, setBarangays] = useState<Map<string, Barangay>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    byCategory: {} as Record<string, number>,
  });

  useEffect(() => {
    loadReports();
    loadBarangays();
  }, []);

  const loadBarangays = async () => {
    const { data, error: err } = await supabase
      .from("barangays")
      .select("id, name, municipality");

    if (!err && data) {
      const map = new Map(data.map((b) => [b.id, b]));
      setBarangays(map);
    }
  };

  const loadReports = async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);

      if (err) throw err;

      if (data) {
        // Filter reports with valid coordinates
        const validReports = data.filter(
          (r) => r.lat && r.lng && typeof r.lat === "number" && typeof r.lng === "number"
        );
        setReports(validReports);

        // Calculate stats
        const byCategory: Record<string, number> = {};
        validReports.forEach((r) => {
          byCategory[r.category] = (byCategory[r.category] || 0) + 1;
        });

        setStats({
          total: validReports.length,
          byCategory,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const getLocationName = (report: Report): string => {
    if (report.custom_location) {
      return report.custom_location;
    }
    if (report.barangay_id) {
      const barangay = barangays.get(report.barangay_id);
      return barangay ? `${barangay.name}, ${barangay.municipality}` : "Unknown Location";
    }
    return "Unknown Location";
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-power-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900">Error Loading Map</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Power Hazard Reports Map</h1>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Reports</div>
            </div>

            {Object.entries(CATEGORY_COLORS).map(([category, info]) => {
              const count = stats.byCategory[category] || 0;
              return count > 0 ? (
                <div
                  key={category}
                  className="rounded-lg p-3 text-white"
                  style={{ backgroundColor: info.color }}
                >
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm opacity-90">{info.label}</div>
                </div>
              ) : null;
            })}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {reports.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No reports with GPS coordinates yet</p>
            </div>
          </div>
        ) : (
          <MapContainer
            center={[12.5, 121.5] as L.LatLngExpression}
            zoom={8}
            style={{ width: "100%", height: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {reports.map((report) => (
              <Marker
                key={report.id}
                position={[report.lat, report.lng] as L.LatLngExpression}
                icon={createMarkerIcon(report.category)}
              >
                <Popup>
                  <div className="w-64">
                    <h3 className="font-bold text-gray-900">
                      {CATEGORY_COLORS[report.category]?.label || report.category}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Location:</strong> {getLocationName(report)}
                    </p>
                    {report.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Description:</strong> {report.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      <strong>GPS:</strong> {report.lat.toFixed(4)}, {report.lng.toFixed(4)}
                    </p>
                    <p className="text-xs text-gray-500">
                      <strong>Reported:</strong> {new Date(report.created_at).toLocaleString()}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
}
