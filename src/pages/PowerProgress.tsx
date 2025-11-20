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

interface HouseholdStatus {
  municipality: string;
  total_households: number;
  energized_households: number;
  percent_energized: number;
  as_of_time: string;
  updated_at: string;
}

interface BarangayStatus {
  barangay_id: string;
  barangay_name: string;
  is_energized: boolean;
}

interface BarangayHouseholdData {
  barangay_id: string;
  barangay_name: string;
  total_households: number;
  restored_households: number;
  for_restoration_households: number;
  percent_restored: number;
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
  const [households, setHouseholds] = useState<HouseholdStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [latestTimestamp, setLatestTimestamp] = useState<string>("");
  const [expandedMunicipality, setExpandedMunicipality] = useState<
    string | null
  >(null);
  const [barangayDetails, setBarangayDetails] = useState<
    Map<string, BarangayStatus[]>
  >(new Map());
  const [loadingBarangays, setLoadingBarangays] = useState<Set<string>>(
    new Set()
  );
  const [barangayHouseholds, setBarangayHouseholds] = useState<
    Map<string, BarangayHouseholdData[]>
  >(new Map());

  useEffect(() => {
    loadBarangays();
    loadMunicipalityStatus();
    loadHouseholdStatus();
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

  const loadHouseholdStatus = async () => {
    try {
      const { data, error } = await supabase
        .from("household_status")
        .select("*");

      if (error) throw error;

      // Create a map of household data
      const dataMap = new Map(
        (data || []).map((h) => [h.municipality.toUpperCase(), h])
      );

      // Ensure all municipalities are displayed
      const allHouseholds = MUNICIPALITY_ORDER.map((municipality) => {
        const existing = dataMap.get(municipality);

        if (existing) {
          return {
            municipality: existing.municipality,
            total_households: existing.total_households || 0,
            energized_households: existing.energized_households || 0,
            percent_energized: existing.percent_energized || 0,
            as_of_time: existing.as_of_time,
            updated_at: existing.updated_at,
          };
        }

        // Return default data
        return {
          municipality,
          total_households: 0,
          energized_households: 0,
          percent_energized: 0,
          as_of_time: null,
          updated_at: new Date().toISOString(),
        };
      });

      setHouseholds(allHouseholds);
    } catch (err) {
      console.warn(
        "Could not load household status:",
        err instanceof Error ? err.message : "Unknown error"
      );
      // Don't show error to user, household data is optional
    }
  };

  const loadBarangays = async () => {
    try {
      const { error } = await supabase
        .from("barangays")
        .select("id, name, municipality");

      if (error) throw error;
      // Barangays loaded - used in loadBarangayDetails
    } catch (err) {
      console.warn("Could not load barangays:", err);
    }
  };

  const loadBarangayDetails = async (municipality: string) => {
    try {
      setLoadingBarangays((prev) => new Set(prev).add(municipality));

      // Get all barangays for this municipality
      const { data: muniBarangays, error: bErr } = await supabase
        .from("barangays")
        .select("id, name")
        .eq("municipality", municipality)
        .order("name", { ascending: true });

      if (bErr) throw bErr;

      if (muniBarangays && muniBarangays.length > 0) {
        // Get household data to determine energized status
        const { data: hhData, error: hhErr } = await supabase
          .from("barangay_household_status")
          .select("barangay_id, restored_households")
          .eq("municipality", municipality);

        if (hhErr) throw hhErr;

        // Map household data to check if energized (restored_households > 0)
        const hhMap = new Map(
          (hhData || []).map((hh) => [
            hh.barangay_id,
            hh.restored_households > 0,
          ])
        );

        // Create barangay statuses based on household restoration data
        const barangayStatuses: BarangayStatus[] = muniBarangays.map((b) => ({
          barangay_id: b.id,
          barangay_name: b.name,
          is_energized: hhMap.get(b.id) || false,
        }));

        const newDetails = new Map(barangayDetails);
        newDetails.set(municipality, barangayStatuses);
        setBarangayDetails(newDetails);
      }
    } catch (err) {
      console.warn("Could not load barangay details:", err);
      addToast("Failed to load barangay details", "error");
    } finally {
      setLoadingBarangays((prev) => {
        const newSet = new Set(prev);
        newSet.delete(municipality);
        return newSet;
      });
    }
  };

  const toggleExpandedMunicipality = (municipality: string) => {
    if (expandedMunicipality === municipality) {
      setExpandedMunicipality(null);
    } else {
      setExpandedMunicipality(municipality);
      if (!barangayDetails.has(municipality)) {
        loadBarangayDetails(municipality);
        loadBarangayHouseholds(municipality);
      }
    }
  };

  const loadBarangayHouseholds = async (municipality: string) => {
    try {
      // Query the barangay_household_status view which joins barangay_households with latest updates
      const { data: hhData, error: hhErr } = await supabase
        .from("barangay_household_status")
        .select(
          "barangay_id, barangay_name, total_households, restored_households, for_restoration_households, percent_restored"
        )
        .eq("municipality", municipality)
        .order("barangay_name", { ascending: true });

      if (hhErr) throw hhErr;

      if (hhData && hhData.length > 0) {
        const householdData: BarangayHouseholdData[] = hhData.map(
          (hh: any) => ({
            barangay_id: hh.barangay_id,
            barangay_name: hh.barangay_name,
            total_households: hh.total_households,
            restored_households: hh.restored_households,
            for_restoration_households: hh.for_restoration_households,
            percent_restored: hh.percent_restored,
          })
        );

        const newHouseholds = new Map(barangayHouseholds);
        newHouseholds.set(municipality, householdData);
        setBarangayHouseholds(newHouseholds);
      }
    } catch (err) {
      console.warn("Could not load barangay household data:", err);
      // Don't show error toast - household data is optional
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

        {/* Tab Switcher - REMOVED: Now showing unified table */}
        {/* Combined Table for Barangay and Household Data */}

        {/* Summary Cards - Combined Barangay Stats */}
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
            const overallPercent =
              totalBgy > 0 ? (energizedBgy / totalBgy) * 100 : 0;

            return (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-3 sm:p-4 rounded-lg shadow">
                  <div className="text-xl sm:text-2xl font-bold">
                    {energizedBgy}
                  </div>
                  <div className="text-xs sm:text-sm opacity-90">
                    Barangays Energized
                  </div>
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
                  <div className="text-xs sm:text-sm opacity-90">
                    Still Restoring
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-3 sm:p-4 rounded-lg shadow">
                  <div className="text-xl sm:text-2xl font-bold">
                    {overallPercent.toFixed(2)}%
                  </div>
                  <div className="text-xs sm:text-sm opacity-90">
                    Barangay Overall
                  </div>
                </div>
              </div>
            );
          })()}

        {/* UNIFIED TABLE - Barangay and Household Data Side by Side */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6 sm:mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-bold text-gray-900 text-xs sm:text-base">
                    Municipality / Town
                  </th>
                  {/* Barangay Level Columns */}
                  <th
                    colSpan={3}
                    className="px-3 sm:px-6 py-3 sm:py-4 text-center font-bold text-gray-900 text-xs sm:text-base border-r border-gray-300"
                  >
                    BARANGAY LEVEL
                  </th>
                  {/* House Connection Level Columns */}
                  <th
                    colSpan={3}
                    className="px-3 sm:px-6 py-3 sm:py-4 text-center font-bold text-gray-900 text-xs sm:text-base"
                  >
                    HOUSE CONNECTION LEVEL
                  </th>
                </tr>
                <tr className="bg-gray-50 border-b border-gray-300">
                  <th className="px-3 sm:px-6 py-2 sm:py-3"></th>
                  {/* Barangay sub-headers */}
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold text-gray-700 text-xs sm:text-sm border-l border-gray-300">
                    Total Barangays
                  </th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold text-gray-700 text-xs sm:text-sm">
                    Energized Barangays
                  </th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold text-gray-700 text-xs sm:text-sm">
                    %
                  </th>
                  {/* House connection sub-headers */}
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold text-gray-700 text-xs sm:text-sm border-l border-gray-300">
                    Total House Connections
                  </th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold text-gray-700 text-xs sm:text-sm">
                    Energized House Connections
                  </th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold text-gray-700 text-xs sm:text-sm">
                    %
                  </th>
                </tr>
              </thead>
              <tbody>
                {municipalities.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-3 sm:px-6 py-6 sm:py-8 text-center text-gray-600 text-sm"
                    >
                      No data available
                    </td>
                  </tr>
                ) : (
                  municipalities.map((muni, idx) => {
                    const bgColor = idx % 2 === 0 ? "bg-white" : "bg-gray-50";

                    // Get household data for this municipality
                    const householdData = households.find(
                      (h) =>
                        h.municipality.toUpperCase() ===
                        muni.municipality.toUpperCase()
                    );
                    const hhTotal = householdData?.total_households || 0;
                    const hhEnergized =
                      householdData?.energized_households || 0;
                    const hhPercent =
                      hhTotal > 0 ? (hhEnergized / hhTotal) * 100 : 0;

                    // Color coding for barangay percentage
                    const barangayPercentColor =
                      muni.percent_energized === 100
                        ? "text-green-600 bg-green-50"
                        : muni.percent_energized >= 75
                        ? "text-lime-600 bg-lime-50"
                        : muni.percent_energized >= 50
                        ? "text-yellow-600 bg-yellow-50"
                        : muni.percent_energized >= 25
                        ? "text-orange-600 bg-orange-50"
                        : "text-red-600 bg-red-50";

                    // Color coding for household percentage
                    const householdPercentColor =
                      hhPercent === 100
                        ? "text-green-600 bg-green-50"
                        : hhPercent >= 75
                        ? "text-lime-600 bg-lime-50"
                        : hhPercent >= 50
                        ? "text-yellow-600 bg-yellow-50"
                        : hhPercent >= 25
                        ? "text-orange-600 bg-orange-50"
                        : "text-red-600 bg-red-50";

                    return (
                      <>
                        <tr
                          key={muni.municipality}
                          onClick={() =>
                            toggleExpandedMunicipality(muni.municipality)
                          }
                          className={`${bgColor} border-b border-gray-200 hover:bg-blue-50 transition cursor-pointer`}
                        >
                          {/* Municipality Name */}
                          <td className="px-3 sm:px-6 py-3 sm:py-4 font-semibold text-gray-900 text-xs sm:text-base">
                            <div className="flex items-center gap-2">
                              <span>
                                {expandedMunicipality === muni.municipality
                                  ? "▼"
                                  : "▶"}
                              </span>
                              {muni.municipality.toUpperCase()}
                            </div>
                          </td>

                          {/* BARANGAY LEVEL */}
                          <td className="px-2 sm:px-4 py-3 sm:py-4 text-center font-semibold text-gray-900 text-xs sm:text-base border-l border-gray-300">
                            {muni.total_barangays}
                          </td>
                          <td className="px-2 sm:px-4 py-3 sm:py-4 text-center font-semibold text-gray-900 text-xs sm:text-base">
                            {muni.energized_barangays}
                          </td>
                          <td className="px-2 sm:px-4 py-3 sm:py-4">
                            <div className="space-y-1">
                              <div
                                className={`text-center font-bold text-xs sm:text-sm rounded ${barangayPercentColor} py-1`}
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
                                  style={{
                                    width: `${muni.percent_energized}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* HOUSE CONNECTION LEVEL */}
                          <td className="px-2 sm:px-4 py-3 sm:py-4 text-center font-semibold text-gray-900 text-xs sm:text-base border-l border-gray-300">
                            {hhTotal.toLocaleString()}
                          </td>
                          <td className="px-2 sm:px-4 py-3 sm:py-4 text-center font-semibold text-gray-900 text-xs sm:text-base">
                            {hhEnergized.toLocaleString()}
                          </td>
                          <td className="px-2 sm:px-4 py-3 sm:py-4">
                            <div className="space-y-1">
                              <div
                                className={`text-center font-bold text-xs sm:text-sm rounded ${householdPercentColor} py-1`}
                              >
                                {hhPercent.toFixed(2)}%
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-full ${
                                    hhPercent === 100
                                      ? "bg-green-500"
                                      : hhPercent >= 75
                                      ? "bg-lime-500"
                                      : hhPercent >= 50
                                      ? "bg-yellow-500"
                                      : hhPercent >= 25
                                      ? "bg-orange-500"
                                      : "bg-red-500"
                                  } transition-all duration-500`}
                                  style={{ width: `${hhPercent}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Barangay Details Row */}
                        {expandedMunicipality === muni.municipality && (
                          <tr className={bgColor}>
                            <td
                              colSpan={7}
                              className="px-3 sm:px-6 py-4 sm:py-6 border-b border-gray-200"
                            >
                              {loadingBarangays.has(muni.municipality) ? (
                                <div className="text-center py-6 text-gray-600">
                                  Loading barangay details...
                                </div>
                              ) : barangayDetails.get(muni.municipality)
                                  ?.length ? (
                                <div className="space-y-4">
                                  <div>
                                    <p className="font-bold text-base text-green-700 mb-3 flex items-center gap-2">
                                      <span className="text-lg">✓</span>
                                      Energized Barangays (
                                      {barangayDetails
                                        .get(muni.municipality)
                                        ?.filter((b) => b.is_energized)
                                        .length || 0}
                                      )
                                    </p>
                                    <div className="space-y-2">
                                      {barangayDetails
                                        .get(muni.municipality)
                                        ?.filter((b) => b.is_energized)
                                        .map((brgy) => {
                                          const householdInfo =
                                            barangayHouseholds
                                              .get(muni.municipality)
                                              ?.find(
                                                (hh) =>
                                                  hh.barangay_id ===
                                                  brgy.barangay_id
                                              );

                                          const hhPercentColor =
                                            householdInfo &&
                                            householdInfo.percent_restored ===
                                              100
                                              ? "text-green-600 bg-green-50"
                                              : householdInfo &&
                                                householdInfo.percent_restored >=
                                                  75
                                              ? "text-lime-600 bg-lime-50"
                                              : householdInfo &&
                                                householdInfo.percent_restored >=
                                                  50
                                              ? "text-yellow-600 bg-yellow-50"
                                              : householdInfo &&
                                                householdInfo.percent_restored >=
                                                  25
                                              ? "text-orange-600 bg-orange-50"
                                              : "text-red-600 bg-red-50";

                                          return (
                                            <div
                                              key={brgy.barangay_id}
                                              className="p-3 sm:p-4 rounded-lg bg-green-50 border-2 border-green-300"
                                            >
                                              <div className="flex items-center gap-2 mb-3">
                                                <span className="text-base sm:text-lg flex-shrink-0">
                                                  ⚡
                                                </span>
                                                <span className="font-semibold text-gray-900 text-sm sm:text-base break-words">
                                                  {brgy.barangay_name}
                                                </span>
                                              </div>
                                              {householdInfo ? (
                                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5 text-xs sm:text-sm">
                                                  <div>
                                                    <p className="text-gray-600">
                                                      Total House Connections
                                                    </p>
                                                    <p className="font-bold text-gray-900">
                                                      {householdInfo.total_households.toLocaleString()}
                                                    </p>
                                                  </div>
                                                  <div>
                                                    <p className="text-gray-600">
                                                      Restored
                                                    </p>
                                                    <p className="font-bold text-green-700">
                                                      {householdInfo.restored_households.toLocaleString()}
                                                    </p>
                                                  </div>
                                                  <div>
                                                    <p className="text-gray-600">
                                                      For Restoration
                                                    </p>
                                                    <p className="font-bold text-orange-700">
                                                      {householdInfo.for_restoration_households.toLocaleString()}
                                                    </p>
                                                  </div>
                                                  <div className="col-span-2 sm:col-span-1 md:col-span-1">
                                                    <p className="text-gray-600">
                                                      % Restored
                                                    </p>
                                                    <div className="space-y-1 mt-1">
                                                      <div
                                                        className={`text-center font-bold text-xs rounded ${hhPercentColor} py-0.5`}
                                                      >
                                                        {householdInfo.percent_restored.toFixed(
                                                          2
                                                        )}
                                                        %
                                                      </div>
                                                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                                        <div
                                                          className={`h-full ${
                                                            householdInfo.percent_restored ===
                                                            100
                                                              ? "bg-green-500"
                                                              : householdInfo.percent_restored >=
                                                                75
                                                              ? "bg-lime-500"
                                                              : householdInfo.percent_restored >=
                                                                50
                                                              ? "bg-yellow-500"
                                                              : householdInfo.percent_restored >=
                                                                25
                                                              ? "bg-orange-500"
                                                              : "bg-red-500"
                                                          }`}
                                                          style={{
                                                            width: `${householdInfo.percent_restored}%`,
                                                          }}
                                                        />
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              ) : (
                                                <p className="text-gray-600 italic text-xs">
                                                  No household data available
                                                </p>
                                              )}
                                            </div>
                                          );
                                        })}
                                      {muni.energized_barangays === 0 && (
                                        <p className="text-gray-500 italic text-sm col-span-full">
                                          No energized barangays yet
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Non-Energized Barangays */}
                                  {muni.partial_barangays > 0 ||
                                  muni.no_power_barangays > 0 ? (
                                    <div>
                                      <p className="font-bold text-base text-gray-700 mb-3">
                                        Still Restoring (
                                        {barangayDetails
                                          .get(muni.municipality)
                                          ?.filter((b) => !b.is_energized)
                                          .length || 0}
                                        )
                                      </p>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                        {barangayDetails
                                          .get(muni.municipality)
                                          ?.filter((b) => !b.is_energized)
                                          .map((brgy) => (
                                            <div
                                              key={brgy.barangay_id}
                                              className="p-2 rounded text-xs sm:text-sm bg-gray-100 text-gray-700 border border-gray-300"
                                            >
                                              <span className="text-sm mr-2">
                                                ⚠️
                                              </span>
                                              {brgy.barangay_name}
                                            </div>
                                          ))}
                                      </div>
                                    </div>
                                  ) : null}
                                </div>
                              ) : (
                                <div className="text-center py-4 text-gray-600">
                                  No barangay data available
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })
                )}

                {/* Franchise Total Row */}
                {municipalities.length > 0 && (
                  <tr className="bg-gray-200 border-t-2 border-gray-300 font-bold">
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-900 text-xs sm:text-base">
                      QUIRELCO FRANCHISE AREA
                    </td>

                    {/* BARANGAY TOTALS */}
                    <td className="px-2 sm:px-4 py-3 sm:py-4 text-center text-gray-900 text-xs sm:text-base border-l border-gray-300">
                      {municipalities.reduce(
                        (sum, m) => sum + m.total_barangays,
                        0
                      )}
                    </td>
                    <td className="px-2 sm:px-4 py-3 sm:py-4 text-center text-gray-900 text-xs sm:text-base">
                      {municipalities.reduce(
                        (sum, m) => sum + m.energized_barangays,
                        0
                      )}
                    </td>
                    <td className="px-2 sm:px-4 py-3 sm:py-4">
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

                        return (
                          <div className="space-y-1">
                            <div
                              className={`text-center font-bold text-xs sm:text-lg ${percentColor}`}
                            >
                              {totalPercent.toFixed(2)}%
                            </div>
                            <div className="w-full bg-gray-300 rounded-full h-2.5 overflow-hidden">
                              <div
                                className={`h-full ${
                                  totalPercent === 100
                                    ? "bg-green-500"
                                    : totalPercent >= 75
                                    ? "bg-lime-500"
                                    : totalPercent >= 50
                                    ? "bg-yellow-500"
                                    : totalPercent >= 25
                                    ? "bg-orange-500"
                                    : "bg-red-500"
                                } transition-all duration-500`}
                                style={{ width: `${totalPercent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })()}
                    </td>

                    {/* HOUSEHOLD TOTALS */}
                    <td className="px-2 sm:px-4 py-3 sm:py-4 text-center text-gray-900 text-xs sm:text-base border-l border-gray-300">
                      {households
                        .reduce((sum, h) => sum + h.total_households, 0)
                        .toLocaleString()}
                    </td>
                    <td className="px-2 sm:px-4 py-3 sm:py-4 text-center text-gray-900 text-xs sm:text-base">
                      {households
                        .reduce((sum, h) => sum + h.energized_households, 0)
                        .toLocaleString()}
                    </td>
                    <td className="px-2 sm:px-4 py-3 sm:py-4">
                      {(() => {
                        const totalHH = households.reduce(
                          (sum, h) => sum + h.total_households,
                          0
                        );
                        const energizedHH = households.reduce(
                          (sum, h) => sum + h.energized_households,
                          0
                        );
                        const totalPercent =
                          totalHH > 0
                            ? parseFloat(
                                ((energizedHH / totalHH) * 100).toFixed(2)
                              )
                            : 0;
                        const percentColor =
                          totalPercent === 100
                            ? "text-green-600 bg-green-50"
                            : totalPercent >= 75
                            ? "text-lime-600 bg-lime-50"
                            : totalPercent >= 50
                            ? "text-yellow-600 bg-yellow-50"
                            : totalPercent >= 25
                            ? "text-orange-600 bg-orange-50"
                            : totalPercent === 0
                            ? "text-gray-400"
                            : "text-orange-600 bg-orange-50";

                        return (
                          <div className="space-y-1">
                            <div
                              className={`text-center font-bold text-xs sm:text-lg ${percentColor}`}
                            >
                              {totalPercent}%
                            </div>
                            <div className="w-full bg-gray-400 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full ${
                                  totalPercent === 100
                                    ? "bg-green-500"
                                    : totalPercent >= 75
                                    ? "bg-lime-500"
                                    : totalPercent >= 50
                                    ? "bg-yellow-500"
                                    : totalPercent > 0
                                    ? "bg-orange-500"
                                    : "bg-red-500"
                                } transition-all duration-500`}
                                style={{
                                  width: `${totalPercent}%`,
                                }}
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
                ENERGIZED (100%)
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
              <span className="text-xs sm:text-sm text-gray-700">
                50% - 74%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-orange-500 rounded flex-shrink-0"></div>
              <span className="text-xs sm:text-sm text-gray-700">
                25% - 49%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded flex-shrink-0"></div>
              <span className="text-xs sm:text-sm text-gray-700">0% - 24%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
