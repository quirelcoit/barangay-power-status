import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Card, StatusBadge } from "../components";
import { ArrowLeft, MapPin } from "lucide-react";

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
  contact_hint: string | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
}

interface BarangayItem {
  id: string;
  name: string;
  municipality: string;
  latestStatus?: "no_power" | "partial" | "energized";
}

export function BarangayView() {
  const { barangayId } = useParams();
  const navigate = useNavigate();
  const [barangay, setBarangay] = useState<any>(null);
  const [updates, setUpdates] = useState<BarangayUpdate[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [relatedBarangays, setRelatedBarangays] = useState<BarangayItem[]>([]);

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

        // Load related barangays from same municipality
        if (barangayData) {
          const { data: relatedData, error: relatedError } = await supabase
            .from("barangays")
            .select("id, name, municipality")
            .eq("municipality", barangayData.municipality)
            .order("name", { ascending: true });

          if (relatedError) throw relatedError;

          // Get latest updates for related barangays
          if (relatedData && relatedData.length > 0) {
            const { data: updatesForRelated } = await supabase
              .from("barangay_updates")
              .select("barangay_id, power_status")
              .in(
                "barangay_id",
                relatedData.map((b) => b.id)
              )
              .eq("is_published", true)
              .order("created_at", { ascending: false });

            // Map latest status to each barangay (get most recent)
            const statusMap = new Map();
            (updatesForRelated || []).forEach((update) => {
              if (!statusMap.has(update.barangay_id)) {
                statusMap.set(update.barangay_id, update.power_status);
              }
            });

            const relatedWithStatus = relatedData.map((b) => ({
              ...b,
              latestStatus: statusMap.get(b.id) as any,
            }));

            setRelatedBarangays(relatedWithStatus);
          }
        }
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
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
                {barangay.name}
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                {barangay.municipality}
              </p>
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

            {/* Related Barangays in Same Municipality */}
            {relatedBarangays.length > 1 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-power-600" />
                  Other Barangays in {barangay.municipality}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {relatedBarangays.map((brgy) => (
                    <Card
                      key={brgy.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => navigate(`/barangay/${brgy.id}`)}
                      padding="md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {brgy.name}
                          </p>
                          {brgy.latestStatus && (
                            <div className="mt-2 flex items-center gap-2">
                              <StatusBadge
                                status={brgy.latestStatus}
                                size="sm"
                              />
                            </div>
                          )}
                        </div>
                        <div className="text-xl text-gray-400">→</div>
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
