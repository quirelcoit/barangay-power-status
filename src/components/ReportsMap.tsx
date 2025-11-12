import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "../lib/supabase";
import { AlertCircle, Trash2 } from "lucide-react";

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    byCategory: {} as Record<string, number>,
  });
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showReportsList, setShowReportsList] = useState(false);
  const [listCategoryFilter, setListCategoryFilter] = useState<string>("all");

  useEffect(() => {
    checkAdmin();
    loadReports();
    loadBarangays();
  }, []);

  const checkAdmin = async () => {
    const { data } = await supabase.auth.getSession();
    setIsAdmin(!!data?.session?.user);
  };

  const deleteReport = async (reportId: string) => {
    if (!isAdmin) {
      alert("Only admins can delete reports");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this report?")) {
      return;
    }

    try {
      const { error: err } = await supabase
        .from("reports")
        .delete()
        .eq("id", reportId);

      if (err) throw err;

      // Remove from local state
      setReports(reports.filter((r) => r.id !== reportId));

      // Recalculate stats
      const newReports = reports.filter((r) => r.id !== reportId);
      const byCategory: Record<string, number> = {};
      newReports.forEach((r) => {
        byCategory[r.category] = (byCategory[r.category] || 0) + 1;
      });
      setStats({
        total: newReports.length,
        byCategory,
      });

      alert("Report deleted successfully");
    } catch (err) {
      alert(
        `Error deleting report: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  };

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
          (r) =>
            r.lat &&
            r.lng &&
            typeof r.lat === "number" &&
            typeof r.lng === "number"
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
      return barangay
        ? `${barangay.name}, ${barangay.municipality}`
        : "Unknown Location";
    }
    return "Unknown Location";
  };

  // Filter reports by selected category
  const filteredReports =
    selectedCategory === "all"
      ? reports
      : reports.filter((r) => r.category === selectedCategory);

  // Filter reports for list panel (separate from map filter)
  const listFilteredReports =
    listCategoryFilter === "all"
      ? reports
      : reports.filter((r) => r.category === listCategoryFilter);

  // Calculate map center based on filtered reports or default to Quirino
  const getMapCenter = (): [number, number] => {
    if (filteredReports.length === 0) {
      // No reports - default to Quirino Province center
      return [12.5, 121.5];
    }

    // Calculate average latitude and longitude from filtered reports
    const avgLat =
      filteredReports.reduce((sum, r) => sum + r.lat, 0) /
      filteredReports.length;
    const avgLng =
      filteredReports.reduce((sum, r) => sum + r.lng, 0) /
      filteredReports.length;

    return [avgLat, avgLng];
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
      {/* Header with Instructions */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                📍 Hazard Reports Map
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                See all reported power hazards on the map
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setShowReportsList(!showReportsList)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
              >
                <span>📋</span>
                {showReportsList ? "Hide List" : "View List"}
              </button>
              <button
                onClick={loadReports}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <span className={loading ? "animate-spin" : ""}>🔄</span>
                Refresh
              </button>
            </div>
          </div>

          {/* Legend - Clickable Category Filter */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-600 mb-2">
              Filter by Category:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
              {/* All button */}
              <button
                onClick={() => setSelectedCategory("all")}
                className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-all ${
                  selectedCategory === "all"
                    ? "bg-power-600 text-white border-2 border-power-700"
                    : "bg-gray-100 text-gray-900 border-2 border-transparent hover:bg-gray-200"
                }`}
              >
                <span className="text-lg">📊</span>
                <span className="font-semibold">All ({stats.total})</span>
              </button>

              {/* Category buttons */}
              {Object.entries(CATEGORY_COLORS).map(([category, info]) => {
                const count = stats.byCategory[category] || 0;
                const isSelected = selectedCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`flex items-center gap-1.5 text-xs px-2 py-2 rounded-lg transition-all flex-wrap justify-center ${
                      isSelected
                        ? "text-white border-2 border-opacity-100"
                        : "bg-gray-100 text-gray-900 border-2 border-transparent hover:bg-gray-200"
                    }`}
                    style={
                      isSelected
                        ? {
                            backgroundColor: info.color,
                            borderColor: info.color,
                          }
                        : {}
                    }
                    title={info.label}
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: info.color,
                        opacity: isSelected ? 0.3 : 1,
                      }}
                    />
                    <span className="font-bold">{count}</span>
                    <span className="text-xs font-medium leading-tight">
                      {info.label.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Total Reports */}
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <p className="text-sm font-semibold text-blue-900">
              ✅ Total: {stats.total} reports collected from Quirino & San
              Agustin Province
            </p>
            {isAdmin && (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                ADMIN MODE
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Map + List Container */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Map Section */}
        <div className="flex-1 relative">
          {reports.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center max-w-md mx-auto px-4">
                <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No reports yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Help us keep Quirino Province safe! Submit your first hazard
                  report.
                </p>
                <a
                  href="/#/report"
                  className="inline-block px-6 py-3 bg-power-600 text-white rounded-lg hover:bg-power-700 transition-colors font-semibold"
                >
                  🚩 Report a Hazard Now
                </a>
              </div>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <p className="text-gray-600 font-semibold">
                  No reports found for selected category
                </p>
              </div>
            </div>
          ) : (
            <MapContainer
              center={getMapCenter() as L.LatLngExpression}
              zoom={10}
              style={{ width: "100%", height: "100%" }}
              key={`map-${selectedCategory}`}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              {filteredReports.map((report) => (
                <Marker
                  key={report.id}
                  position={[report.lat, report.lng] as L.LatLngExpression}
                  icon={createMarkerIcon(report.category)}
                >
                  <Popup className="leaflet-popup-simple">
                    <div className="w-72 p-2">
                      {/* Title */}
                      <h3 className="font-bold text-lg text-gray-900 mb-2">
                        {CATEGORY_COLORS[report.category]?.label ||
                          report.category}
                      </h3>

                      {/* Location - prominent */}
                      <div className="mb-3 p-2 bg-blue-50 border-l-4 border-blue-500 rounded">
                        <p className="text-sm font-semibold text-gray-900">
                          📍 {getLocationName(report)}
                        </p>
                      </div>

                      {/* Description if available */}
                      {report.description && (
                        <div className="mb-3">
                          <p className="text-xs font-semibold text-gray-600 mb-1">
                            Description:
                          </p>
                          <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                            "{report.description}"
                          </p>
                        </div>
                      )}

                      {/* Timestamp */}
                      <div className="text-xs text-gray-500 border-t border-gray-200 pt-2 mb-2">
                        <p>🕐 {new Date(report.created_at).toLocaleString()}</p>
                      </div>

                      {/* Delete Button - Admin only */}
                      {isAdmin && (
                        <button
                          onClick={() => deleteReport(report.id)}
                          className="w-full mt-2 px-3 py-2 bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Report
                        </button>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>

        {/* Reports List Side Panel */}
        {showReportsList && (
          <div className="w-full sm:w-96 bg-white border-l border-gray-200 shadow-lg flex flex-col overflow-hidden">
            {/* Panel Header */}
            <div className="border-b border-gray-200 p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-900">
                  📋 Reports List
                </h2>
                <button
                  onClick={() => setShowReportsList(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              {/* Category Filter for List */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-600">
                  Filter by Category:
                </label>
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => setListCategoryFilter("all")}
                    className={`text-xs px-2 py-1 rounded transition-all ${
                      listCategoryFilter === "all"
                        ? "bg-power-600 text-white font-semibold"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    }`}
                  >
                    All ({reports.length})
                  </button>
                  {Object.entries(CATEGORY_COLORS).map(([category, info]) => {
                    const count = stats.byCategory[category] || 0;
                    return (
                      <button
                        key={category}
                        onClick={() => setListCategoryFilter(category)}
                        className={`text-xs px-2 py-1 rounded transition-all flex items-center gap-1 ${
                          listCategoryFilter === category
                            ? "text-white font-semibold"
                            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                        }`}
                        style={
                          listCategoryFilter === category
                            ? { backgroundColor: info.color }
                            : {}
                        }
                      >
                        <span className="text-xs">
                          {info.label.split(" ")[0]}
                        </span>
                        <span className="font-bold">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="text-sm text-gray-600 mt-3 pt-3 border-t border-gray-200">
                {listCategoryFilter === "all"
                  ? `All ${listFilteredReports.length} reports`
                  : `${listFilteredReports.length} ${
                      CATEGORY_COLORS[listCategoryFilter]?.label ||
                      listCategoryFilter
                    }`}
              </p>
            </div>

            {/* Reports List */}
            <div className="flex-1 overflow-y-auto">
              {listFilteredReports.length === 0 ? (
                <div className="flex items-center justify-center h-full p-4 text-center">
                  <p className="text-gray-500">No reports found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {listFilteredReports.map((report) => (
                    <div
                      key={report.id}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="mb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor:
                                CATEGORY_COLORS[report.category]?.color ||
                                "#8b5cf6",
                            }}
                          />
                          <h4 className="font-semibold text-sm text-gray-900">
                            {CATEGORY_COLORS[report.category]?.label ||
                              report.category}
                          </h4>
                        </div>
                        <p className="text-xs text-gray-600">
                          📍 {getLocationName(report)}
                        </p>
                      </div>

                      {report.description && (
                        <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded mb-2 line-clamp-2">
                          "{report.description}"
                        </p>
                      )}

                      <p className="text-xs text-gray-500 mb-3">
                        {new Date(report.created_at).toLocaleString()}
                      </p>

                      {isAdmin && (
                        <button
                          onClick={() => deleteReport(report.id)}
                          className="w-full text-xs px-2 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 transition-colors font-semibold"
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
