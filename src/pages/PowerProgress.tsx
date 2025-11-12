import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useToast } from "../components";
import { RefreshCw } from "lucide-react";

interface MunicipalityStatus {
  municipality: string;
  total_barangays: number;
  energized_barangays: number;
  partial_barangays: number;
  no_power_barangays: number;
  percent_energized: number;
  last_updated: string;
}

const formatTimestamp = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };
  return date.toLocaleString("en-US", options);
};

export function PowerProgress() {
  const { addToast } = useToast();
  const [municipalities, setMunicipalities] = useState<MunicipalityStatus[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [latestTimestamp, setLatestTimestamp] = useState<string>("");

  useEffect(() => {
    loadMunicipalityStatus();

    // Auto-refresh every 2 minutes
    const interval = setInterval(loadMunicipalityStatus, 120000);

    return () => clearInterval(interval);
  }, []);

  const loadMunicipalityStatus = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("municipality_status")
        .select("*")
        .order("municipality");

      if (error) throw error;

      setMunicipalities(data || []);

      // Get latest timestamp from all records
      if (data && data.length > 0) {
        const latestTimestamp = new Date(
          Math.max(...data.map((d) => new Date(d.last_updated).getTime()))
        ).toISOString();
        setLatestTimestamp(latestTimestamp);
      }
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "Failed to load status",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && municipalities.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading power status...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header with Image and Title */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            POWER RESTORATION PROGRESS
          </h1>
          <p className="text-lg font-semibold text-gray-800 mb-1">
            SUPER TYPHOON "UWAN"
          </p>
          {latestTimestamp && (
            <p className="text-lg font-bold text-blue-600 mb-4">
              As of {formatTimestamp(latestTimestamp)}
            </p>
          )}
          <p className="text-sm text-gray-700">
            Latest update of Quirelco's power restoration per Municipality/Town within the franchise area.
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="px-6 py-4 text-left font-bold text-gray-900">
                  Municipality / Town
                </th>
                <th className="px-6 py-4 text-center font-bold text-gray-900">
                  Total Barangays
                </th>
                <th className="px-6 py-4 text-center font-bold text-gray-900">
                  Energized Barangays
                </th>
                <th className="px-6 py-4 text-center font-bold text-green-600">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody>
              {municipalities.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-600">
                    No data available
                  </td>
                </tr>
              ) : (
                municipalities.map((muni, idx) => {
                  const bgColor = idx % 2 === 0 ? "bg-white" : "bg-gray-50";
                  const percentColor =
                    muni.percent_energized === 100
                      ? "text-green-600 bg-green-50"
                      : muni.percent_energized >= 75
                      ? "text-lime-600 bg-lime-50"
                      : muni.percent_energized >= 50
                      ? "text-yellow-600 bg-yellow-50"
                      : muni.percent_energized >= 25
                      ? "text-orange-600 bg-orange-50"
                      : "text-red-600 bg-red-50";

                  return (
                    <tr
                      key={muni.municipality}
                      className={`${bgColor} border-b border-gray-200 hover:bg-blue-50 transition`}
                    >
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {muni.municipality.toUpperCase()}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-gray-900">
                        {muni.total_barangays}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-gray-900">
                        {muni.energized_barangays}
                      </td>
                      <td className={`px-6 py-4 text-center font-bold text-lg ${percentColor}`}>
                        {muni.percent_energized}%
                      </td>
                    </tr>
                  );
                })
              )}
              {/* Franchise Total Row */}
              {municipalities.length > 0 && (
                <tr className="bg-gray-200 border-t-2 border-gray-300 font-bold">
                  <td className="px-6 py-4 text-gray-900">
                    QUIRELCO FRANCHISE AREA
                  </td>
                  <td className="px-6 py-4 text-center text-gray-900">
                    {municipalities.reduce((sum, m) => sum + m.total_barangays, 0)}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-900">
                    {municipalities.reduce((sum, m) => sum + m.energized_barangays, 0)}
                  </td>
                  <td className="px-6 py-4 text-center text-green-600 text-lg">
                    {municipalities.length > 0
                      ? Math.round(
                          (municipalities.reduce((sum, m) => sum + m.energized_barangays, 0) /
                            municipalities.reduce((sum, m) => sum + m.total_barangays, 0)) *
                            100
                        )
                      : 0}
                    %
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-8 p-4 bg-white rounded-lg shadow">
          <h3 className="font-bold text-gray-900 mb-3">LEGEND</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-700">ENERGIZED</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-lime-500 rounded"></div>
              <span className="text-sm text-gray-700">75% - 99%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-yellow-500 rounded"></div>
              <span className="text-sm text-gray-700">50% - 74%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-700">UNENERGIZED</span>
            </div>
          </div>
        </div>

        {/* Refresh Info */}
        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 flex items-center gap-2">
          <RefreshCw size={16} />
          <p>Data auto-refreshes every 2 minutes</p>
        </div>
      </div>
    </div>
  );
}
