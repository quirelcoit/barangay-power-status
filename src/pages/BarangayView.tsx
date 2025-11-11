import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Card, StatusBadge } from "../components";
import { ArrowLeft } from "lucide-react";

interface BarangayUpdate {
  id: string;
  created_at: string;
  headline: string;
  body: string | null;
  power_status: "no_power" | "partial" | "energized";
  eta: string | null;
}

interface Report {
  id: string;
  category: string;
  description: string | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
}

export function BarangayView() {
  const { barangayId } = useParams();
  const navigate = useNavigate();
  const [barangay, setBarangay] = useState<any>(null);
  const [updates, setUpdates] = useState<BarangayUpdate[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!barangayId) return;

      try {
        setLoading(true);

        // Load barangay
        const { data: barangayData, error: barangayError } = await supabase
          .from("barangays")
          .select("*")
          .eq("id", barangayId)
          .single();

        if (barangayError) throw barangayError;
        setBarangay(barangayData);

        // Load updates
        const { data: updatesData, error: updatesError } = await supabase
          .from("barangay_updates")
          .select("*")
          .eq("barangay_id", barangayId)
          .eq("is_published", true)
          .order("created_at", { ascending: false });

        if (updatesError) throw updatesError;
        setUpdates(updatesData || []);

        // Load reports (approved only for now)
        const { data: reportsData, error: reportsError } = await supabase
          .from("reports")
          .select("*")
          .eq("barangay_id", barangayId)
          .eq("status", "resolved")
          .order("created_at", { ascending: false })
          .limit(10);

        if (reportsError) throw reportsError;
        setReports(reportsData || []);
      } catch (err) {
        console.error("Failed to load barangay view:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [barangayId]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const latestUpdate = updates[0];

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-2 text-power-600 hover:text-power-700 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : !barangay ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Barangay not found</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-1">
                {barangay.name}
              </h1>
              <p className="text-gray-600">{barangay.municipality}</p>
            </div>

            {/* Latest Status */}
            {latestUpdate ? (
              <Card className="mb-8" padding="lg">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <StatusBadge status={latestUpdate.power_status} />
                    <span className="text-xs text-gray-500">
                      {formatTime(latestUpdate.created_at)}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {latestUpdate.headline}
                  </h2>
                  {latestUpdate.body && (
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {latestUpdate.body}
                    </p>
                  )}
                  {latestUpdate.eta && (
                    <p className="text-sm bg-yellow-50 border border-yellow-200 p-3 rounded text-yellow-800">
                      <strong>ETA:</strong> {latestUpdate.eta}
                    </p>
                  )}
                </div>
              </Card>
            ) : (
              <Card className="mb-8" padding="lg">
                <p className="text-gray-600 italic">No official updates yet</p>
              </Card>
            )}

            {/* Recent Updates Timeline */}
            {updates.length > 1 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Update History
                </h2>
                <div className="space-y-3">
                  {updates.slice(1).map((update) => (
                    <Card key={update.id} padding="md">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {update.headline}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTime(update.created_at)}
                          </p>
                        </div>
                        <StatusBadge status={update.power_status} size="sm" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Reports */}
            {reports.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Resolved Reports
                </h2>
                <div className="space-y-3">
                  {reports.map((report) => (
                    <Card key={report.id} padding="md">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <p className="font-medium text-gray-900">
                            {report.category.replace(/_/g, " ").toUpperCase()}
                          </p>
                          <span className="text-xs text-gray-500">
                            {formatTime(report.created_at)}
                          </span>
                        </div>
                        {report.description && (
                          <p className="text-sm text-gray-700">
                            {report.description}
                          </p>
                        )}
                        {report.lat && report.lng && (
                          <p className="text-xs text-gray-600 font-mono">
                            📍 {report.lat.toFixed(4)}, {report.lng.toFixed(4)}
                          </p>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
