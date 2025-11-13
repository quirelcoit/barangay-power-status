import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useToast } from "../components";

interface MunicipalityStatus {
  municipality: string;
  total_barangays: number;
  energized_barangays: number;
  partial_barangays: number;
  no_power_barangays: number;
  percent_energized: number;
  as_of_time: string;
  last_updated: string;
}

// Define the correct order of municipalities as shown in the dashboard
const MUNICIPALITY_ORDER = [
  "DIFFUN",
  "CABARROGUIS",
  "SAGUDAY",
  "MADDELA",
  "AGLIPAY",
  "NAGTIPUNAN",
  "SAN AGUSTIN, ISABELA",
];

// Define correct total barangays for each municipality (must match PowerUpdate.tsx)
const MUNICIPALITY_TOTALS: { [key: string]: number } = {
  DIFFUN: 33,
  CABARROGUIS: 17,
  SAGUDAY: 9,
  MADDELA: 32,
  AGLIPAY: 25,
  NAGTIPUNAN: 16,
  "SAN AGUSTIN, ISABELA": 18,
};

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
    // Removed auto-refresh: data only updates when staff submits changes
  }, []);

  const loadMunicipalityStatus = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("municipality_status")
        .select("*");

      if (error) throw error;

      // Create a map of existing data
      const dataMap = new Map(
        (data || []).map((m) => [m.municipality.toUpperCase(), m])
      );

      // Ensure all municipalities are displayed with correct total barangays
      const allMunicipalities = MUNICIPALITY_ORDER.map((municipality) => {
        const existing = dataMap.get(municipality);
        const totalBgy = MUNICIPALITY_TOTALS[municipality] || 0;

        if (existing) {
          // Use existing data but ensure total_barangays is correct
          return {
            ...existing,
            total_barangays: totalBgy,
          };
        }

        // Return default data with correct total barangays
        return {
          municipality,
          total_barangays: totalBgy,
          energized_barangays: 0,
          partial_barangays: 0,
          no_power_barangays: 0,
          percent_energized: 0,
          as_of_time: null,
          last_updated: new Date().toISOString(),
        };
      });

      setMunicipalities(allMunicipalities);

      // Get latest as_of_time from all records that have it
      if (data && data.length > 0) {
        const asOfTimes = data
          .filter((d) => d.as_of_time)
          .map((d) => new Date(d.as_of_time).getTime());

        if (asOfTimes.length > 0) {
          const latestAsOfTime = new Date(Math.max(...asOfTimes)).toISOString();
          setLatestTimestamp(latestAsOfTime);
        } else {
          // Fallback to updated_at if as_of_time is not set
          const latestTimestamp = new Date(
            Math.max(...data.map((d) => new Date(d.last_updated).getTime()))
          ).toISOString();
          setLatestTimestamp(latestTimestamp);
        }
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
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-3 sm:px-4">
        {/* Header with Image and Title */}
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            POWER RESTORATION PROGRESS
          </h1>
          <p className="text-base sm:text-lg font-semibold text-gray-800 mb-1">
            SUPER TYPHOON "UWAN"
          </p>
          {latestTimestamp && (
            <p className="text-sm sm:text-base font-bold text-blue-600 mb-4">
              As of {formatTimestamp(latestTimestamp)}
            </p>
          )}
          <p className="text-xs sm:text-sm text-gray-700">
            Latest update of Quirelco's power restoration per Municipality/Town
            within the franchise area.
          </p>
        </div>

        {/* Summary Cards */}
        {municipalities.length > 0 &&
          (() => {
            const totalBgy = municipalities.reduce(
              (sum, m) => sum + m.total_barangays,
              0
            );
            const energizedBgy = municipalities.reduce(
              (sum, m) => sum + m.energized_barangays,
              0
            );
            const partialBgy = municipalities.reduce(
              (sum, m) => sum + m.partial_barangays,
              0
            );
            const noPowerBgy = municipalities.reduce(
              (sum, m) => sum + m.no_power_barangays,
              0
            );
            // Use exact same calculation as QUIRELCO FRANCHISE AREA row for consistency
            const overallPercent =
              totalBgy > 0 ? (energizedBgy / totalBgy) * 100 : 0;

            return (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-3 sm:p-4 rounded-lg shadow">
                  <div className="text-xl sm:text-2xl font-bold">
                    {energizedBgy}
                  </div>
                  <div className="text-xs sm:text-sm opacity-90">Energized</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-3 sm:p-4 rounded-lg shadow">
                  <div className="text-xl sm:text-2xl font-bold">
                    {partialBgy}
                  </div>
                  <div className="text-xs sm:text-sm opacity-90">
                    Partial Power
                  </div>
                </div>
                <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-3 sm:p-4 rounded-lg shadow">
                  <div className="text-xl sm:text-2xl font-bold">
                    {noPowerBgy}
                  </div>
                  <div className="text-xs sm:text-sm opacity-90">No Power</div>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-3 sm:p-4 rounded-lg shadow">
                  <div className="text-xl sm:text-2xl font-bold">
                    {overallPercent.toFixed(2)}%
                  </div>
                  <div className="text-xs sm:text-sm opacity-90">Overall</div>
                </div>
              </div>
            );
          })()}

        {/* Table - Mobile optimized */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6 sm:mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-bold text-gray-900 text-xs sm:text-base">
                    Municipality / Town
                  </th>
                  <th className="px-2 sm:px-6 py-3 sm:py-4 text-center font-bold text-gray-900 text-xs sm:text-base">
                    Total
                  </th>
                  <th className="px-2 sm:px-6 py-3 sm:py-4 text-center font-bold text-gray-900 text-xs sm:text-base">
                    Energized
                  </th>
                  <th className="px-2 sm:px-6 py-3 sm:py-4 text-center font-bold text-green-600 text-xs sm:text-base">
                    %
                  </th>
                </tr>
              </thead>
              <tbody>
                {municipalities.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 sm:px-6 py-6 sm:py-8 text-center text-gray-600 text-sm"
                    >
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
                        <td className="px-3 sm:px-6 py-3 sm:py-4 font-semibold text-gray-900 text-xs sm:text-base">
                          {muni.municipality.toUpperCase()}
                        </td>
                        <td className="px-2 sm:px-6 py-3 sm:py-4 text-center font-semibold text-gray-900 text-xs sm:text-base">
                          {muni.total_barangays}
                        </td>
                        <td className="px-2 sm:px-6 py-3 sm:py-4 text-center font-semibold text-gray-900 text-xs sm:text-base">
                          {muni.energized_barangays}
                        </td>
                        <td className={`px-2 sm:px-6 py-3 sm:py-4`}>
                          <div className="space-y-1">
                            <div
                              className={`text-center font-bold text-xs sm:text-lg ${percentColor}`}
                            >
                              {muni.percent_energized.toFixed(2)}%
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full ${
                                  muni.percent_energized === 100
                                    ? "bg-green-500"
                                    : muni.percent_energized >= 75
                                    ? "bg-lime-500"
                                    : muni.percent_energized >= 50
                                    ? "bg-yellow-500"
                                    : muni.percent_energized >= 25
                                    ? "bg-orange-500"
                                    : "bg-red-500"
                                } transition-all duration-500`}
                                style={{ width: `${muni.percent_energized}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
                {/* Franchise Total Row */}
                {municipalities.length > 0 && (
                  <tr className="bg-gray-200 border-t-2 border-gray-300 font-bold">
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-900 text-xs sm:text-base">
                      QUIRELCO FRANCHISE AREA
                    </td>
                    <td className="px-2 sm:px-6 py-3 sm:py-4 text-center text-gray-900 text-xs sm:text-base">
                      {municipalities.reduce(
                        (sum, m) => sum + m.total_barangays,
                        0
                      )}
                    </td>
                    <td className="px-2 sm:px-6 py-3 sm:py-4 text-center text-gray-900 text-xs sm:text-base">
                      {municipalities.reduce(
                        (sum, m) => sum + m.energized_barangays,
                        0
                      )}
                    </td>
                    <td className="px-2 sm:px-6 py-3 sm:py-4">
                      {(() => {
                        const totalBgy = municipalities.reduce(
                          (sum, m) => sum + m.total_barangays,
                          0
                        );
                        const energizedBgy = municipalities.reduce(
                          (sum, m) => sum + m.energized_barangays,
                          0
                        );
                        const totalPercent = (energizedBgy / totalBgy) * 100;
                        const percentColor =
                          totalPercent === 100
                            ? "text-green-600 bg-green-50"
                            : totalPercent >= 75
                            ? "text-lime-600 bg-lime-50"
                            : totalPercent >= 50
                            ? "text-yellow-600 bg-yellow-50"
                            : totalPercent >= 25
                            ? "text-orange-600 bg-orange-50"
                            : "text-red-600 bg-red-50";

                        const barColor =
                          totalPercent === 100
                            ? "bg-green-500"
                            : totalPercent >= 75
                            ? "bg-lime-500"
                            : totalPercent >= 50
                            ? "bg-yellow-500"
                            : totalPercent >= 25
                            ? "bg-orange-500"
                            : "bg-red-500";

                        return (
                          <div className="space-y-1">
                            <div
                              className={`text-center font-bold text-xs sm:text-lg ${percentColor}`}
                            >
                              {totalPercent.toFixed(2)}%
                            </div>
                            <div className="w-full bg-gray-300 rounded-full h-2.5 overflow-hidden">
                              <div
                                className={`h-full ${barColor} transition-all duration-500`}
                                style={{ width: `${totalPercent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })()}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-white rounded-lg shadow mb-4">
          <h3 className="font-bold text-gray-900 mb-3 text-sm sm:text-base">
            LEGEND
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded flex-shrink-0"></div>
              <span className="text-xs sm:text-sm text-gray-700">
                ENERGIZED
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-lime-500 rounded flex-shrink-0"></div>
              <span className="text-xs sm:text-sm text-gray-700">
                75% - 99%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-yellow-500 rounded flex-shrink-0"></div>
              <span className="text-sm text-gray-700">50% - 74%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-700">UNENERGIZED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
