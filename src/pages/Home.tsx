import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Card, StatusBadge } from "../components";
import { Search } from "lucide-react";

interface BarangayWithUpdate {
  id: string;
  name: string;
  municipality: string;
  latestUpdate?: {
    id: string;
    headline: string;
    power_status: "no_power" | "partial" | "energized";
    created_at: string;
  };
}

export function Home() {
  const navigate = useNavigate();
  const [barangays, setBarangays] = useState<BarangayWithUpdate[]>([]);
  const [filtered, setFiltered] = useState<BarangayWithUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const { data: barangaysData, error: barangaysError } = await supabase
          .from("barangays")
          .select("id, name, municipality")
          .eq("is_active", true)
          .order("municipality")
          .order("name");

        if (barangaysError) throw barangaysError;

        // Get latest updates for each barangay
        const { data: updatesData, error: updatesError } = await supabase
          .from("barangay_updates")
          .select("id, barangay_id, headline, power_status, created_at")
          .eq("is_published", true)
          .order("created_at", { ascending: false });

        if (updatesError) throw updatesError;

        // Map updates to barangays
        const barangaysWithUpdates: BarangayWithUpdate[] = (
          barangaysData || []
        ).map((b) => ({
          ...b,
          latestUpdate: (updatesData || []).find((u) => u.barangay_id === b.id),
        }));

        setBarangays(barangaysWithUpdates);
        setFiltered(barangaysWithUpdates);
      } catch (err) {
        console.error("Failed to load barangays:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleSearch = (query: string) => {
    setSearch(query);
    const q = query.toLowerCase();
    setFiltered(
      barangays.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.municipality.toLowerCase().includes(q)
      )
    );
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Hero */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Barangay Power Status
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Stay informed about power outages and hazard reports in your
            barangay
          </p>
        </div>

        {/* Search */}
        <Card className="mb-8" padding="lg">
          <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search barangay or municipality..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500"
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Found {filtered.length} barangay(s)
          </p>
        </Card>

        {/* Barangay List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading barangays...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No barangays found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((barangay) => (
              <Card
                key={barangay.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/barangay/${barangay.id}`)}
                padding="md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {barangay.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {barangay.municipality}
                    </p>

                    {barangay.latestUpdate ? (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <StatusBadge
                            status={barangay.latestUpdate.power_status}
                          />
                          <span className="text-xs text-gray-500">
                            Updated{" "}
                            {formatTime(barangay.latestUpdate.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">
                          {barangay.latestUpdate.headline}
                        </p>
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-gray-500 italic">
                        No updates yet
                      </p>
                    )}
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <span className="text-2xl">→</span>
                  </div>
                </div>
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
