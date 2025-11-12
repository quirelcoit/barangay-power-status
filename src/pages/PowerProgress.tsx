import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Card, useToast } from "../components";
import { TrendingUp, AlertCircle, Zap } from "lucide-react";

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
  const [totalStats, setTotalStats] = useState({
    total: 0,
    energized: 0,
    partial: 0,
    no_power: 0,
  });
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

      // Calculate totals
      const totals = (data || []).reduce(
        (acc, m) => ({
          total: acc.total + m.total_barangays,
          energized: acc.energized + m.energized_barangays,
          partial: acc.partial + m.partial_barangays,
          no_power: acc.no_power + m.no_power_barangays,
        }),
        { total: 0, energized: 0, partial: 0, no_power: 0 }
      );

      setTotalStats(totals);
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "Failed to load status",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (percent: number): string => {
    if (percent === 100) return "bg-green-500";
    if (percent >= 75) return "bg-lime-500";
    if (percent >= 50) return "bg-yellow-500";
    if (percent >= 25) return "bg-orange-500";
    return "bg-red-500";
  };

  const getStatusLabel = (percent: number): string => {
    if (percent === 100) return "✅ Fully Energized";
    if (percent >= 75) return "🟢 Mostly Energized";
    if (percent >= 50) return "🟡 Partially Energized";
    if (percent >= 25) return "🟠 Mostly No Power";
    return "🔴 No Power";
  };

  if (loading && municipalities.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading power status...</p>
      </div>
    );
  }

  const overallPercent =
    totalStats.total > 0
      ? Math.round((totalStats.energized / totalStats.total) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header with "As of" timestamp */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            ⚡ Power Restoration Progress
          </h1>
          {latestTimestamp && (
            <p className="text-lg font-semibold text-blue-600 mb-2">
              As of {formatTimestamp(latestTimestamp)}
            </p>
          )}
          <p className="text-sm sm:text-base text-gray-600">
            Real-time power restoration progress across municipalities
          </p>
        </div>

        {/* Overall Summary */}
        <Card className="mb-8" padding="lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Franchise-Wide Status
              </h2>
              <Zap className="w-6 h-6 text-yellow-500" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">
                  Overall Progress
                </span>
                <span className="text-2xl font-bold text-green-600">
                  {overallPercent}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full ${getStatusColor(
                    overallPercent
                  )} transition-all duration-500`}
                  style={{ width: `${overallPercent}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {totalStats.energized} / {totalStats.total} barangays energized
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-xs text-gray-600">Energized</p>
                <p className="text-2xl font-bold text-green-600">
                  {totalStats.energized}
                </p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <p className="text-xs text-gray-600">Partial</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {totalStats.partial}
                </p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <p className="text-xs text-gray-600">No Power</p>
                <p className="text-2xl font-bold text-red-600">
                  {totalStats.no_power}
                </p>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg border border-gray-300">
                <p className="text-xs text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-700">
                  {totalStats.total}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Municipalities */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            By Municipality
          </h2>

          {municipalities.length === 0 ? (
            <Card padding="lg" className="text-center">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No municipalities found</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {municipalities.map((muni) => (
                <Card key={muni.municipality} padding="md">
                  <div className="space-y-3">
                    {/* Municipality Name & Percent */}
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg text-gray-900">
                        {muni.municipality}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-2xl font-bold ${
                            muni.percent_energized === 100
                              ? "text-green-600"
                              : muni.percent_energized >= 75
                              ? "text-lime-600"
                              : muni.percent_energized >= 50
                              ? "text-yellow-600"
                              : muni.percent_energized >= 25
                              ? "text-orange-600"
                              : "text-red-600"
                          }`}
                        >
                          {muni.percent_energized}%
                        </span>
                        <TrendingUp className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full ${getStatusColor(
                          muni.percent_energized
                        )} transition-all duration-500`}
                        style={{ width: `${muni.percent_energized}%` }}
                      />
                    </div>

                    {/* Status Label & Barangay Count */}
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-700">
                        {getStatusLabel(muni.percent_energized)}
                      </p>
                      <p className="text-xs text-gray-600">
                        {muni.energized_barangays} / {muni.total_barangays}{" "}
                        barangays energized
                      </p>
                    </div>

                    {/* Breakdown */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-green-50 p-2 rounded border border-green-200">
                        <p className="text-green-700 font-semibold">
                          {muni.energized_barangays}
                        </p>
                        <p className="text-green-600 text-xs">Energized</p>
                      </div>
                      <div className="bg-yellow-50 p-2 rounded border border-yellow-200">
                        <p className="text-yellow-700 font-semibold">
                          {muni.partial_barangays}
                        </p>
                        <p className="text-yellow-600 text-xs">Partial</p>
                      </div>
                      <div className="bg-red-50 p-2 rounded border border-red-200">
                        <p className="text-red-700 font-semibold">
                          {muni.no_power_barangays}
                        </p>
                        <p className="text-red-600 text-xs">No Power</p>
                      </div>
                    </div>

                    {/* Last Updated */}
                    {muni.last_updated && (
                      <p className="text-xs text-gray-500">
                        Last updated:{" "}
                        {new Date(muni.last_updated).toLocaleString()}
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Refresh Info */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <p>🔄 Data auto-refreshes every 2 minutes</p>
        </div>
      </div>
    </div>
  );
}
