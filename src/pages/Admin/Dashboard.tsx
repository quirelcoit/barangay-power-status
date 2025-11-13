import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Card, StatusBadge, useToast, ImageGallery } from "../../components";
import { Check, X, LogOut } from "lucide-react";

interface Report {
  id: string;
  barangay_id: string;
  barangay_name?: string;
  category: string;
  description: string | null;
  contact_name: string | null;
  contact_number: string | null;
  status: string;
  created_at: string;
  lat: number | null;
  lng: number | null;
}

interface Tab {
  id: string;
  label: string;
  status: string;
}

const TABS: Tab[] = [
  { id: "new", label: "NEW", status: "new" },
  { id: "triaged", label: "TRIAGED", status: "triaged" },
  { id: "in_progress", label: "IN PROGRESS", status: "in_progress" },
  { id: "resolved", label: "RESOLVED", status: "resolved" },
];

export function Dashboard() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState("new");
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session) {
        navigate("/admin/login");
        return;
      }
      setUser(authData.session.user);
      loadReports();
    }

    checkAuth();
  }, [navigate]);

  async function loadReports() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("reports")
        .select(
          `
          id,
          barangay_id,
          category,
          description,
          contact_name,
          contact_number,
          status,
          created_at,
          lat,
          lng,
          barangays(name)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mapped = (data || []).map((r: any) => ({
        ...r,
        barangay_name: r.barangays?.name,
      }));

      setReports(mapped);
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "Failed to load reports",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  const handleStatusChange = async (reportId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("reports")
        .update({ status: newStatus })
        .eq("id", reportId);

      if (error) throw error;

      setReports(
        reports.map((r) =>
          r.id === reportId ? { ...r, status: newStatus } : r
        )
      );
      addToast("Status updated", "success");
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "Failed to update status",
        "error"
      );
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const activeTabReports = reports.filter((r) => r.status === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            {user && <p className="text-sm text-gray-600">{user.email}</p>}
          </div>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full">
            <button
              onClick={() => navigate("/admin/power-update")}
              className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm md:text-base whitespace-nowrap"
            >
              ⚡ <span className="hidden sm:inline">Power Update</span><span className="sm:hidden">Update</span>
            </button>
            <button
              onClick={() => navigate("/admin/map")}
              className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm md:text-base whitespace-nowrap"
            >
              📍 <span className="hidden sm:inline">View Map</span><span className="sm:hidden">Map</span>
            </button>
            <button
              onClick={() => setIsGalleryOpen(true)}
              className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs sm:text-sm md:text-base whitespace-nowrap"
            >
              📸 <span className="hidden sm:inline">Photos</span><span className="sm:hidden">Photo</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-danger-600 text-white rounded-lg hover:bg-danger-700 transition-colors text-xs sm:text-sm md:text-base whitespace-nowrap"
            >
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Logout</span><span className="sm:hidden">Out</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-200 overflow-x-auto">
          {TABS.map((tab) => {
            const count = reports.filter((r) => r.status === tab.status).length;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2 sm:px-4 py-2 sm:py-3 font-medium text-xs sm:text-base transition-colors border-b-2 whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id
                    ? "border-power-600 text-power-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.substring(0, 3)}</span>
                <span className="ml-1">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Reports List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading reports...</p>
          </div>
        ) : activeTabReports.length === 0 ? (
          <Card padding="lg" className="text-center">
            <p className="text-gray-600">No reports in this category</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {activeTabReports.map((report) => (
              <Card key={report.id} padding="md">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">
                        {report.barangay_name}
                      </h3>
                      <StatusBadge
                        status={
                          report.status as
                            | "new"
                            | "triaged"
                            | "in_progress"
                            | "resolved"
                            | "rejected"
                        }
                        size="sm"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {report.category.replace(/_/g, " ").toUpperCase()}
                    </p>
                    {report.description && (
                      <p className="text-sm text-gray-700 mt-2">
                        {report.description}
                      </p>
                    )}
                    {(report.contact_name || report.contact_number) && (
                      <div className="text-xs text-gray-600 mt-2 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                        <p className="font-semibold text-blue-900 mb-1">
                          📞 Contact Info (Admin Only):
                        </p>
                        {report.contact_name && (
                          <p>Name: {report.contact_name}</p>
                        )}
                        {report.contact_number && (
                          <p>Number: {report.contact_number}</p>
                        )}
                      </div>
                    )}
                    {report.lat && report.lng && (
                      <p className="text-xs text-gray-500 mt-2 font-mono">
                        📍 {report.lat.toFixed(4)}, {report.lng.toFixed(4)}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(report.created_at).toLocaleString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="ml-0 sm:ml-4 mt-3 sm:mt-0 grid grid-cols-2 sm:flex gap-1 sm:gap-2 w-full sm:w-auto">
                    {report.status === "new" && (
                      <button
                        onClick={() => handleStatusChange(report.id, "triaged")}
                        className="flex items-center justify-center sm:justify-start gap-1 px-2 sm:px-3 py-2 sm:py-1 bg-power-100 text-power-700 rounded hover:bg-power-200 text-xs sm:text-sm flex-1 sm:flex-none"
                      >
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="hidden sm:inline">Triage</span><span className="sm:hidden">Tri</span>
                      </button>
                    )}
                    {report.status !== "resolved" && (
                      <button
                        onClick={() =>
                          handleStatusChange(report.id, "in_progress")
                        }
                        className="flex items-center justify-center sm:justify-start gap-1 px-2 sm:px-3 py-2 sm:py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-xs sm:text-sm flex-1 sm:flex-none"
                      >
                        <span className="hidden sm:inline">Progress</span><span className="sm:hidden">Prog</span>
                      </button>
                    )}
                    {report.status !== "resolved" && (
                      <button
                        onClick={() =>
                          handleStatusChange(report.id, "resolved")
                        }
                        className="flex items-center justify-center sm:justify-start gap-1 px-2 sm:px-3 py-2 sm:py-1 bg-power-100 text-power-700 rounded hover:bg-power-200 text-xs sm:text-sm flex-1 sm:flex-none"
                      >
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="hidden sm:inline">Done</span><span className="sm:hidden">Done</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleStatusChange(report.id, "rejected")}
                      className="flex items-center justify-center sm:justify-start gap-1 px-2 sm:px-3 py-2 sm:py-1 bg-danger-100 text-danger-700 rounded hover:bg-danger-200 text-xs sm:text-sm flex-1 sm:flex-none"
                    >
                      <X className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="hidden sm:inline">Reject</span><span className="sm:hidden">Rej</span>
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate("/admin/updates")}
            className="px-4 py-3 bg-power-600 text-white rounded-lg font-medium hover:bg-power-700 transition-colors"
          >
            Post Update
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>

      {/* Image Gallery Modal */}
      {isGalleryOpen && (
        <ImageGallery
          isOpen={isGalleryOpen}
          onClose={() => setIsGalleryOpen(false)}
        />
      )}
    </div>
  );
}
