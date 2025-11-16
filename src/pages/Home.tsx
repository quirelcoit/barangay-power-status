import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Card } from "../components";
import { ChevronDown, ChevronUp } from "lucide-react";

interface MunicipalityStats {
  municipality: string;
  totalBarangays: number;
  energizedBarangays: number;
  barangayPercentage: number;
  totalHouseholds: number;
  restoredHouseholds: number;
  householdPercentage: number;
}

interface EnergizedBarangay {
  barangay_id: string;
  barangay_name: string;
  total_households: number;
  restored_households: number;
  percentage: number;
  has_household_data: boolean;
}

export function Home() {
  const navigate = useNavigate();
  const [municipalityStats, setMunicipalityStats] = useState<
    MunicipalityStats[]
  >([]);
  const [expandedMunicipality, setExpandedMunicipality] = useState<
    string | null
  >(null);
  const [energizedBarangays, setEnergizedBarangays] = useState<{
    [key: string]: EnergizedBarangay[];
  }>({});
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadMunicipalityStats();
  }, []);

  const loadMunicipalityStats = async () => {
    try {
      setLoading(true);

      // Load barangay-level statistics
      const { data: barangayData, error: barangayError } = await supabase
        .from("barangays")
        .select("id, name, municipality")
        .eq("is_active", true);

      if (barangayError) throw barangayError;

      // Load household-level statistics from latest updates
      const { data: householdUpdates, error: householdError } = await supabase
        .from("barangay_household_updates")
        .select(
          "municipality, barangay_id, barangay_name, total_households, restored_households, updated_at"
        )
        .order("updated_at", { ascending: false });

      if (householdError) throw householdError;

      // Get latest household data per barangay
      const latestHouseholdByBarangay = new Map();
      householdUpdates?.forEach((update) => {
        if (!latestHouseholdByBarangay.has(update.barangay_id)) {
          latestHouseholdByBarangay.set(update.barangay_id, update);
        }
      });

      // Group by municipality
      const municipalityMap = new Map<string, MunicipalityStats>();

      barangayData?.forEach((barangay) => {
        const muni = barangay.municipality;
        if (!municipalityMap.has(muni)) {
          municipalityMap.set(muni, {
            municipality: muni,
            totalBarangays: 0,
            energizedBarangays: 0,
            barangayPercentage: 0,
            totalHouseholds: 0,
            restoredHouseholds: 0,
            householdPercentage: 0,
          });
        }

        const stats = municipalityMap.get(muni)!;
        stats.totalBarangays++;

        // Count energized barangays based on household restoration data
        const householdData = latestHouseholdByBarangay.get(barangay.id);
        if (householdData) {
          // A barangay is energized if it has restored_households > 0
          if (householdData.restored_households > 0) {
            stats.energizedBarangays++;
          }
          stats.totalHouseholds += householdData.total_households || 0;
          stats.restoredHouseholds += householdData.restored_households || 0;
        }
      });

      // Calculate percentages
      const statsArray = Array.from(municipalityMap.values())
        .map((stats) => ({
          ...stats,
          barangayPercentage:
            stats.totalBarangays > 0
              ? (stats.energizedBarangays / stats.totalBarangays) * 100
              : 0,
          householdPercentage:
            stats.totalHouseholds > 0
              ? (stats.restoredHouseholds / stats.totalHouseholds) * 100
              : 0,
        }))
        .sort((a, b) => a.municipality.localeCompare(b.municipality));

      setMunicipalityStats(statsArray);
    } catch (err) {
      console.error("Failed to load municipality stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadEnergizedBarangays = async (municipality: string) => {
    if (energizedBarangays[municipality]) return; // Already loaded

    try {
      setLoadingDetails((prev) => new Set(prev).add(municipality));

      // Get all barangays for this municipality
      const { data: barangayData, error: barangayError } = await supabase
        .from("barangays")
        .select("id, name")
        .eq("municipality", municipality)
        .eq("is_active", true);

      if (barangayError) throw barangayError;

      // Get latest household data
      const { data: householdData, error: householdError } = await supabase
        .from("barangay_household_updates")
        .select(
          "barangay_id, barangay_name, total_households, restored_households, updated_at"
        )
        .eq("municipality", municipality)
        .order("updated_at", { ascending: false });

      if (householdError) throw householdError;

      // Get latest household data per barangay
      const householdByBarangay = new Map();
      householdData?.forEach((update) => {
        if (!householdByBarangay.has(update.barangay_id)) {
          householdByBarangay.set(update.barangay_id, update);
        }
      });

      // Build energized barangays list (barangays with restored_households > 0)
      const energized: EnergizedBarangay[] = [];

      barangayData?.forEach((barangay) => {
        const household = householdByBarangay.get(barangay.id);
        // A barangay is energized if it has restored_households > 0
        if (household && household.restored_households > 0) {
          energized.push({
            barangay_id: barangay.id,
            barangay_name: barangay.name,
            total_households: household.total_households || 0,
            restored_households: household.restored_households || 0,
            percentage:
              household.total_households > 0
                ? (household.restored_households / household.total_households) *
                  100
                : 0,
            has_household_data: true,
          });
        }
      });

      // Sort by barangay name
      energized.sort((a, b) =>
        a.barangay_name.localeCompare(b.barangay_name)
      );

      setEnergizedBarangays((prev) => ({
        ...prev,
        [municipality]: energized,
      }));
    } catch (err) {
      console.error("Failed to load energized barangays:", err);
    } finally {
      setLoadingDetails((prev) => {
        const newSet = new Set(prev);
        newSet.delete(municipality);
        return newSet;
      });
    }
  };

  const toggleMunicipalityExpand = (municipality: string) => {
    if (expandedMunicipality === municipality) {
      setExpandedMunicipality(null);
    } else {
      setExpandedMunicipality(municipality);
      loadEnergizedBarangays(municipality);
    }
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 75) return "bg-green-500";
    if (percentage >= 50) return "bg-yellow-500";
    if (percentage >= 25) return "bg-orange-500";
    return "bg-red-500";
  };

  const getPercentageTextColor = (percentage: number) => {
    if (percentage >= 75) return "text-green-600";
    if (percentage >= 50) return "text-yellow-600";
    if (percentage >= 25) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4">
        {/* Hero */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Power Restoration Status
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Real-time power restoration updates across all municipalities
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading statistics...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {municipalityStats.map((stats) => (
              <Card
                key={stats.municipality}
                padding="none"
                className="overflow-hidden"
              >
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleMunicipalityExpand(stats.municipality)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      {stats.municipality}
                      {expandedMunicipality === stats.municipality ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Barangay Level */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase">
                        BARANGAY LEVEL
                      </h3>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-xs text-gray-500">Total</div>
                          <div className="text-2xl font-bold text-gray-900">
                            {stats.totalBarangays}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Energized</div>
                          <div className="text-2xl font-bold text-gray-900">
                            {stats.energizedBarangays}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">%</div>
                          <div
                            className={`text-2xl font-bold ${getPercentageTextColor(
                              stats.barangayPercentage
                            )}`}
                          >
                            {stats.barangayPercentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full ${getPercentageColor(
                            stats.barangayPercentage
                          )} transition-all duration-500`}
                          style={{ width: `${stats.barangayPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Household Level */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase">
                        HOUSEHOLD LEVEL
                      </h3>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-xs text-gray-500">Total</div>
                          <div className="text-2xl font-bold text-gray-900">
                            {stats.totalHouseholds.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Energized</div>
                          <div className="text-2xl font-bold text-gray-900">
                            {stats.restoredHouseholds.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">%</div>
                          <div
                            className={`text-2xl font-bold ${getPercentageTextColor(
                              stats.householdPercentage
                            )}`}
                          >
                            {stats.householdPercentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full ${getPercentageColor(
                            stats.householdPercentage
                          )} transition-all duration-500`}
                          style={{ width: `${stats.householdPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details: Energized Barangays */}
                {expandedMunicipality === stats.municipality && (
                  <div className="border-t border-gray-200 bg-white p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Energized Barangays
                    </h3>
                    {loadingDetails.has(stats.municipality) ? (
                      <p className="text-gray-600 text-center py-4">
                        Loading...
                      </p>
                    ) : energizedBarangays[stats.municipality]?.length > 0 ? (
                      <div className="space-y-6">
                        {/* All energized barangays have household data */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase">
                            Household Restoration Progress
                          </h4>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Barangay
                                  </th>
                                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total HH
                                  </th>
                                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Restored
                                  </th>
                                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Progress
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {energizedBarangays[stats.municipality].map(
                                  (brgy) => (
                                    <tr
                                      key={brgy.barangay_id}
                                      className="hover:bg-gray-50"
                                    >
                                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {brgy.barangay_name}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-right">
                                        {brgy.total_households.toLocaleString()}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-right">
                                        {brgy.restored_households.toLocaleString()}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                                        <div className="flex items-center justify-end gap-2">
                                          <span
                                            className={`font-semibold ${getPercentageTextColor(
                                              brgy.percentage
                                            )}`}
                                          >
                                            {brgy.percentage.toFixed(1)}%
                                          </span>
                                          <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
                                            <div
                                              className={`h-full ${getPercentageColor(
                                                brgy.percentage
                                              )} transition-all`}
                                              style={{
                                                width: `${brgy.percentage}%`,
                                              }}
                                            />
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600 text-center py-4">
                        No energized barangays yet
                      </p>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate("/report")}
            className="px-4 py-3 bg-power-600 text-white rounded-lg font-medium hover:bg-power-700 transition-colors"
          >
            Report Hazard
          </button>
          <button
            onClick={() => navigate("/admin/login")}
            className="px-4 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Admin Panel
          </button>
        </div>
      </div>
    </div>
  );
}
