import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useToast } from "../../components";
import { ArrowLeft, Check, ChevronDown } from "lucide-react";

interface Municipality {
  value: string;
  label: string;
  totalBarangays: number;
}

interface Barangay {
  id: string;
  name: string;
}

interface UpdateState {
  energized: number;
  remarks: string;
  photo: File | null;
  energizedHouseholds: number;
  energizedBarangayIds: string[];
}

// TODO: Interface for barangay household updates (coming soon)
// interface BarangayHouseholdUpdate {
//   barangayId: string;
//   barangayName: string;
//   totalHouseholds: number;
//   restoredHouseholds: number;
// }

const MUNICIPALITIES: Municipality[] = [
  { value: "diffun", label: "Diffun", totalBarangays: 33 },
  { value: "cabarroguis", label: "Cabarroguis", totalBarangays: 17 },
  { value: "saguday", label: "Saguday", totalBarangays: 9 },
  { value: "maddela", label: "Maddela", totalBarangays: 32 },
  { value: "aglipay", label: "Aglipay", totalBarangays: 25 },
  { value: "nagtipunan", label: "Nagtipunan", totalBarangays: 16 },
  {
    value: "san_agustin_isabela",
    label: "San Agustin, Isabela",
    totalBarangays: 18,
  },
];

// Fixed household totals per municipality
const HOUSEHOLD_TOTALS: { [key: string]: number } = {
  diffun: 15013,
  cabarroguis: 9204,
  saguday: 4468,
  maddela: 10102,
  aglipay: 7308,
  nagtipunan: 4701,
  san_agustin_isabela: 4194,
};

export function PowerUpdate() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<"barangay" | "household" | "barangay_household">(
    "barangay"
  );
  const [expandedMunicipality, setExpandedMunicipality] = useState<string | null>(null);
  const [barangays, setBarangays] = useState<{ [key: string]: Barangay[] }>({});
  const [loadingBarangays, setLoadingBarangays] = useState<Set<string>>(new Set());
  const [expandedBarangayMunicipality, setExpandedBarangayMunicipality] = useState<string | null>(null);
  // TODO: Implement full barangay household updating

  const [updates, setUpdates] = useState<{
    [key: string]: UpdateState;
  }>(() => {
    // Try to restore from localStorage on initial mount
    try {
      const saved = localStorage.getItem("powerUpdateFormData");
      if (saved) {
        const parsed = JSON.parse(saved) as { [key: string]: any };
        const restored: { [key: string]: UpdateState } = {};
        for (const [key, value] of Object.entries(parsed)) {
          restored[key] = {
            ...(value as any),
            photo: null,
            energizedBarangayIds: (value as any).energizedBarangayIds || [],
          };
        }
        console.log("✅ Restored form data from localStorage:", restored);
        return restored;
      }
    } catch (e) {
      console.warn("Could not restore from localStorage:", e);
    }
    return {};
  });
  const [asOfTime, setAsOfTime] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Initialize asOfTime with current local time in datetime-local format
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const date = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    setAsOfTime(`${year}-${month}-${date}T${hours}:${minutes}`);

    checkAdmin();
  }, []);

  const loadBarangaysForMunicipality = async (municipality: string) => {
    try {
      setLoadingBarangays(prev => new Set(prev).add(municipality));

      // Find the municipality label from MUNICIPALITIES array
      const muniObj = MUNICIPALITIES.find(m => m.value === municipality);
      if (!muniObj) return;

      const { data: brgyData, error } = await supabase
        .from("barangays")
        .select("id, name")
        .eq("municipality", muniObj.label)
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) throw error;

      setBarangays(prev => ({
        ...prev,
        [municipality]: brgyData || [],
      }));
    } catch (err) {
      console.warn("Could not load barangays:", err);
      addToast("Failed to load barangays", "error");
    } finally {
      setLoadingBarangays(prev => {
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
      if (!barangays[municipality]) {
        loadBarangaysForMunicipality(municipality);
      }
    }
  };

  const toggleBarangaySelection = (municipality: string, barangayId: string) => {
    setUpdates(prev => {
      const muniUpdate = prev[municipality] || {
        energized: 0,
        remarks: "",
        photo: null,
        energizedHouseholds: 0,
        energizedBarangayIds: [],
      };

      const energizedBarangayIds = muniUpdate.energizedBarangayIds || [];
      const isSelected = energizedBarangayIds.includes(barangayId);

      const newBarangayIds = isSelected
        ? energizedBarangayIds.filter(id => id !== barangayId)
        : [...energizedBarangayIds, barangayId];

      return {
        ...prev,
        [municipality]: {
          ...muniUpdate,
          energizedBarangayIds: newBarangayIds,
          energized: newBarangayIds.length,
        },
      };
    });
  };

  // Save form data to localStorage whenever updates change
  useEffect(() => {
    if (Object.keys(updates).length > 0) {
      try {
        // Create a copy without File objects (photos can't be serialized)
        const serializableUpdates: { [key: string]: any } = {};
        for (const [key, value] of Object.entries(updates)) {
          serializableUpdates[key] = {
            energized: value.energized,
            remarks: value.remarks,
            energizedHouseholds: value.energizedHouseholds,
            energizedBarangayIds: value.energizedBarangayIds || [],
            // Exclude photo field since File objects can't be serialized
          };
        }
        localStorage.setItem(
          "powerUpdateFormData",
          JSON.stringify(serializableUpdates)
        );
      } catch (e) {
        console.warn("Could not save form data to localStorage:", e);
      }
    }
  }, [updates]);

  const checkAdmin = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session?.user) {
        addToast("Please log in to update power status", "error");
        navigate("/admin/login");
        return;
      }

      const { data: staff } = await supabase
        .from("staff_profiles")
        .select("role")
        .eq("uid", data.session.user.id)
        .single();

      if (!staff || (staff.role !== "admin" && staff.role !== "moderator")) {
        addToast("You don't have permission to update power status", "error");
        navigate("/");
        return;
      }

      setIsAdmin(true);

      await loadLatestData();
      setInitialized(true);
    } catch (err) {
      console.error("Auth check failed:", err);
      navigate("/admin/login");
    }
  };

  const loadLatestData = async () => {
    try {
      // Check if there's saved form data in localStorage
      const savedUpdates = localStorage.getItem("powerUpdateFormData");
      if (savedUpdates) {
        try {
          const parsedUpdates = JSON.parse(savedUpdates) as {
            [key: string]: any;
          };
          // Restore photo field as null since it was excluded from serialization
          const restoredUpdates: { [key: string]: UpdateState } = {};
          for (const [key, value] of Object.entries(parsedUpdates)) {
            restoredUpdates[key] = {
              ...(value as any),
              photo: null,
              energizedBarangayIds: (value as any).energizedBarangayIds || [],
            };
          }
          setUpdates(restoredUpdates);
          console.log("✅ Loaded saved form data from localStorage");
          return;
        } catch (e) {
          console.warn("Could not parse saved form data:", e);
        }
      }

      // If no saved data, initialize with empty values
      const newUpdates: { [key: string]: UpdateState } = {};
      MUNICIPALITIES.forEach((muni) => {
        newUpdates[muni.value] = {
          energized: 0,
          remarks: "",
          photo: null,
          energizedHouseholds: 0,
          energizedBarangayIds: [],
        };
      });

      setUpdates(newUpdates);
      console.log("✅ Initialized empty form data");
    } catch (err) {
      console.warn("Could not load latest data:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Determine what type of submission this is based on activeTab
    if (activeTab === "barangay") {
      await submitBarangayUpdates();
    } else if (activeTab === "household") {
      await submitHouseholdUpdates();
    }
  };

  const submitBarangayUpdates = async () => {
    // Check if at least one municipality has data
    const hasUpdates = Object.values(updates).some((u) => u.energized > 0);
    if (!hasUpdates) {
      addToast(
        "Please select at least one energized barangay",
        "error"
      );
      return;
    }

    setLoading(true);

    try {
      const { data: session } = await supabase.auth.getSession();

      // Convert local datetime-local to ISO string with timezone
      const asOfDateTime = new Date(`${asOfTime}:00`).toISOString();

      // Process each municipality that has updates
      for (const muni of MUNICIPALITIES) {
        const update = updates[muni.value];
        if (!update || update.energized === 0) continue;

        let photoUrl: string | null = null;

        // Upload photo if provided for this municipality
        if (update.photo) {
          try {
            const fileName = `${Date.now()}-${Math.random()
              .toString(36)
              .substring(7)}.jpg`;
            const { data: uploadData, error: uploadError } =
              await supabase.storage
                .from("report-photos")
                .upload(fileName, update.photo, {
                  cacheControl: "3600",
                  upsert: false,
                });

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
              .from("report-photos")
              .getPublicUrl(uploadData.path);

            photoUrl = urlData.publicUrl;
          } catch (photoErr) {
            console.warn(`Photo upload failed for ${muni.label}:`, photoErr);
          }
        }

        // Calculate no power
        const noPower = Math.max(0, muni.totalBarangays - update.energized);

        // Insert municipality update
        const { error } = await supabase.from("municipality_updates").insert([
          {
            municipality: muni.label,
            total_barangays: muni.totalBarangays,
            energized_barangays: update.energized,
            partial_barangays: 0,
            no_power_barangays: noPower,
            remarks: update.remarks || null,
            photo_url: photoUrl,
            updated_by: session?.session?.user?.id,
            is_published: true,
            as_of_time: asOfDateTime,
          },
        ]);

        if (error) throw error;

        // Now insert individual barangay updates for energized barangays
        // Get all barangays for this municipality
        const muniObj = MUNICIPALITIES.find(m => m.value === muni.value);
        if (!muniObj) continue;

        const { data: allBarangays } = await supabase
          .from("barangays")
          .select("id")
          .eq("municipality", muniObj.label);

        if (allBarangays) {
          const energizedIds = update.energizedBarangayIds || [];

          // Insert energized updates
          for (const barangayId of energizedIds) {
            await supabase.from("barangay_updates").insert([
              {
                barangay_id: barangayId,
                headline: `Power Status Update - ${asOfDateTime}`,
                body: update.remarks || null,
                power_status: "energized",
                eta: null,
                author_uid: session?.session?.user?.id,
                is_published: true,
              },
            ]);
          }

          // Insert no_power updates for non-energized barangays
          const nonEnergizedIds = (allBarangays || [])
            .filter(b => !energizedIds.includes(b.id))
            .map(b => b.id);

          for (const barangayId of nonEnergizedIds) {
            await supabase.from("barangay_updates").insert([
              {
                barangay_id: barangayId,
                headline: `Power Status Update - ${asOfDateTime}`,
                body: update.remarks || null,
                power_status: "no_power",
                eta: null,
                author_uid: session?.session?.user?.id,
                is_published: true,
              },
            ]);
          }
        }
      }

      setSubmitted(true);
      addToast(
        "✅ Barangay power status updates submitted successfully!",
        "success"
      );

      // Keep form data in localStorage - user can see what they submitted
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 3000);
    } catch (err) {
      console.error("Barangay submission error:", err);
      addToast(
        err instanceof Error ? err.message : "Failed to update barangay status",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const submitHouseholdUpdates = async () => {
    // Check if at least one municipality has household data
    const hasUpdates = Object.values(updates).some(
      (u) => u.energizedHouseholds > 0
    );
    if (!hasUpdates) {
      addToast(
        "Please enter at least one municipality's energized households",
        "error"
      );
      return;
    }

    setLoading(true);

    try {
      const { data: session } = await supabase.auth.getSession();

      // Convert local datetime-local to ISO string with timezone
      const asOfDateTime = new Date(`${asOfTime}:00`).toISOString();

      // Process each municipality that has household updates
      for (const muni of MUNICIPALITIES) {
        const update = updates[muni.value];
        if (!update || update.energizedHouseholds === 0) continue;

        const totalHH = HOUSEHOLD_TOTALS[muni.value] || 0;

        // Insert household update
        const { error } = await supabase.from("household_updates").insert([
          {
            municipality: muni.label,
            total_households: totalHH,
            energized_households: update.energizedHouseholds,
            remarks: update.remarks || null,
            updated_by: session?.session?.user?.id,
            is_published: true,
            as_of_time: asOfDateTime,
          },
        ]);

        if (error) throw error;
      }

      setSubmitted(true);
      addToast(
        "✅ Household energization updates submitted successfully!",
        "success"
      );

      // Keep form data in localStorage - user can see what they submitted
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 3000);
    } catch (err) {
      console.error("Household submission error:", err);
      addToast(
        err instanceof Error
          ? err.message
          : "Failed to update household status",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!isAdmin || !initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex items-center gap-2">
          <button
            onClick={() => navigate("/admin")}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
            Power Status Update
          </h1>
        </div>

        {/* Success Message */}
        {submitted && (
          <div className="mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Check size={20} className="text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-900 text-sm sm:text-base">
                  Updates Submitted
                </p>
                <p className="text-xs sm:text-sm text-green-700">
                  All power status updates have been successfully recorded.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-300">
          <button
            onClick={() => setActiveTab("barangay")}
            className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold text-sm sm:text-base transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "barangay"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Barangay Update
          </button>
          <button
            onClick={() => setActiveTab("household")}
            className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold text-sm sm:text-base transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "household"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Household Update
          </button>
          <button
            onClick={() => setActiveTab("barangay_household")}
            className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold text-sm sm:text-base transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "barangay_household"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Barangay Households
          </button>
        </div>

        {/* Barangay Form */}
        {activeTab === "barangay" && (
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* Instructions & Date/Time Picker */}
              <div className="p-3 sm:p-6 bg-blue-50 border-b border-blue-200 space-y-3 sm:space-y-4">
                <p className="text-xs sm:text-sm text-blue-900">
                  ℹ️ Click on a municipality to expand and select which barangays are energized. The count will update automatically.
                </p>
                <div>
                  <label
                    htmlFor="as_of_time"
                    className="block text-xs sm:text-sm font-semibold text-blue-900 mb-2"
                  >
                    Report As Of Date & Time
                  </label>
                  <input
                    id="as_of_time"
                    type="datetime-local"
                    value={asOfTime}
                    onChange={(e) => setAsOfTime(e.target.value)}
                    className="w-full sm:w-64 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              {/* Municipalities List */}
              <div className="space-y-2 p-3 sm:p-6">
                {MUNICIPALITIES.map((muni) => {
                  const energized = updates[muni.value]?.energized || 0;
                  const percentage =
                    energized > 0
                      ? ((energized / muni.totalBarangays) * 100).toFixed(2)
                      : (0).toFixed(2);
                  const isExpanded = expandedMunicipality === muni.value;
                  const muniBarangays = barangays[muni.value] || [];
                  const energizedBarangayIds = updates[muni.value]?.energizedBarangayIds || [];
                  const isLoading = loadingBarangays.has(muni.value);

                  return (
                    <div key={muni.value} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Municipality Header - Clickable */}
                      <button
                        type="button"
                        onClick={() => toggleMunicipalityExpand(muni.value)}
                        className="w-full bg-gray-50 hover:bg-blue-50 transition px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between"
                      >
                        <div className="text-left flex-1">
                          <p className="font-semibold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                            <ChevronDown
                              className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                            />
                            {muni.label}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            Total: {muni.totalBarangays} | Energized: {energized} | {percentage}%
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-xs sm:text-sm font-bold px-2 py-1 rounded ${
                              parseFloat(percentage) === 100
                                ? "bg-green-100 text-green-800"
                                : parseFloat(percentage) >= 75
                                ? "bg-lime-100 text-lime-800"
                                : parseFloat(percentage) >= 50
                                ? "bg-yellow-100 text-yellow-800"
                                : parseFloat(percentage) > 0
                                ? "bg-orange-100 text-orange-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {percentage}%
                          </span>
                        </div>
                      </button>

                      {/* Expanded Barangay List */}
                      {isExpanded && (
                        <div className="bg-white border-t border-gray-200 p-3 sm:p-6">
                          {isLoading ? (
                            <p className="text-center text-gray-600 py-4">Loading barangays...</p>
                          ) : muniBarangays.length === 0 ? (
                            <p className="text-center text-gray-600 py-4">No barangays found</p>
                          ) : (
                            <div className="space-y-2">
                              <p className="text-xs sm:text-sm text-gray-600 mb-4">
                                Click checkboxes to mark energized barangays:
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                                {muniBarangays.map((brgy) => {
                                  const isChecked = energizedBarangayIds.includes(brgy.id);
                                  return (
                                    <label
                                      key={brgy.id}
                                      className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-blue-50 transition"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() =>
                                          toggleBarangaySelection(muni.value, brgy.id)
                                        }
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                      />
                                      <span
                                        className={`text-sm ${
                                          isChecked
                                            ? "font-medium text-blue-900"
                                            : "text-gray-700"
                                        }`}
                                      >
                                        {brgy.name}
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                              <p className="text-xs text-gray-500 mt-3">
                                Selected: {energizedBarangayIds.length} / {muniBarangays.length}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Summary */}
                <div className="mt-4 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs sm:text-sm font-semibold text-blue-900">
                    Total Energized Barangays:{" "}
                    <span className="text-lg font-bold">
                      {MUNICIPALITIES.reduce(
                        (sum, m) => sum + (updates[m.value]?.energized || 0),
                        0
                      )}
                    </span>
                    {" "}/
                    {" "}
                    <span>
                      {MUNICIPALITIES.reduce(
                        (sum, m) => sum + m.totalBarangays,
                        0
                      )}
                    </span>
                  </p>
                  <div className="mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{
                        width: `${
                          MUNICIPALITIES.reduce(
                            (sum, m) => sum + (updates[m.value]?.energized || 0),
                            0
                          ) / MUNICIPALITIES.reduce(
                            (sum, m) => sum + m.totalBarangays,
                            0
                          ) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Notes & Submit */}
              <div className="p-3 sm:p-6 bg-gray-50 border-t border-gray-200">
                <p className="text-xs sm:text-xs text-gray-600 mb-3 sm:mb-4 leading-relaxed">
                  * Select energized barangays using checkboxes. Count updates automatically. These selections will sync with the main dashboard.
                </p>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 sm:py-3 rounded-lg transition text-sm sm:text-base"
                >
                  {loading ? "⏳ Submitting..." : "✅ Submit Barangay Updates"}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Household Form */}
        {activeTab === "household" && (
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* Instructions & Date/Time Picker */}
              <div className="p-3 sm:p-6 bg-blue-50 border-b border-blue-200 space-y-3 sm:space-y-4">
                <p className="text-xs sm:text-sm text-blue-900">
                  ℹ️ Enter the number of energized households for each
                  municipality. Leave blank or zero to skip.
                </p>
                <div>
                  <label
                    htmlFor="as_of_time_hh"
                    className="block text-xs sm:text-sm font-semibold text-blue-900 mb-2"
                  >
                    Report As Of Date & Time
                  </label>
                  <input
                    id="as_of_time_hh"
                    type="datetime-local"
                    value={asOfTime}
                    onChange={(e) => setAsOfTime(e.target.value)}
                    className="w-full sm:w-64 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              {/* Household Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-bold text-gray-900 text-xs sm:text-base">
                        Municipality / Town
                      </th>
                      <th className="px-2 sm:px-6 py-3 sm:py-4 text-center font-bold text-gray-900 text-xs sm:text-base">
                        Total HH
                      </th>
                      <th className="px-2 sm:px-6 py-3 sm:py-4 text-center font-bold text-gray-900 text-xs sm:text-base">
                        Energized HH *
                      </th>
                      <th className="px-2 sm:px-6 py-3 sm:py-4 text-center font-bold text-green-600 text-xs sm:text-base">
                        %
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {MUNICIPALITIES.map((muni, idx) => {
                      const bgColor = idx % 2 === 0 ? "bg-white" : "bg-gray-50";
                      const totalHH = HOUSEHOLD_TOTALS[muni.value] || 0;
                      const energizedHH =
                        updates[muni.value]?.energizedHouseholds || 0;
                      const percentage =
                        totalHH > 0
                          ? ((energizedHH / totalHH) * 100).toFixed(2)
                          : (0).toFixed(2);

                      return (
                        <tr
                          key={`hh-${muni.value}`}
                          className={`${bgColor} border-b border-gray-200`}
                        >
                          <td className="px-3 sm:px-6 py-3 sm:py-4 font-semibold text-gray-900 text-xs sm:text-base">
                            {muni.label}
                          </td>
                          <td className="px-2 sm:px-6 py-3 sm:py-4 text-center font-semibold text-gray-900 text-xs sm:text-base">
                            {totalHH}
                          </td>
                          <td className="px-2 sm:px-6 py-3 sm:py-4 text-center">
                            <input
                              type="number"
                              min="0"
                              max={totalHH}
                              value={energizedHH === 0 ? "" : energizedHH}
                              placeholder="0"
                              onChange={(e) => {
                                const val = Math.max(
                                  0,
                                  Math.min(
                                    totalHH,
                                    parseInt(e.target.value) || 0
                                  )
                                );
                                setUpdates({
                                  ...updates,
                                  [muni.value]: {
                                    energized:
                                      updates[muni.value]?.energized || 0,
                                    remarks: updates[muni.value]?.remarks || "",
                                    photo: updates[muni.value]?.photo || null,
                                    energizedHouseholds: val,
                                    energizedBarangayIds: updates[muni.value]?.energizedBarangayIds || [],
                                  },
                                });
                              }}
                              onFocus={(e) => {
                                // Clear the field on focus for better UX
                                if (energizedHH === 0) {
                                  e.target.value = "";
                                }
                              }}
                              onBlur={(e) => {
                                // Reset to 0 if empty on blur
                                if (e.target.value === "") {
                                  setUpdates({
                                    ...updates,
                                    [muni.value]: {
                                      energized:
                                        updates[muni.value]?.energized || 0,
                                      remarks:
                                        updates[muni.value]?.remarks || "",
                                      photo: updates[muni.value]?.photo || null,
                                      energizedHouseholds: 0,
                                      energizedBarangayIds: updates[muni.value]?.energizedBarangayIds || [],
                                    },
                                  });
                                }
                              }}
                              className="w-16 sm:w-20 mx-auto px-2 sm:px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-sm sm:text-base"
                            />
                          </td>
                          <td
                            className={`px-2 sm:px-6 py-3 sm:py-4 text-center font-bold text-xs sm:text-lg ${
                              parseFloat(percentage) === 100
                                ? "text-green-600 bg-green-50"
                                : parseFloat(percentage) >= 75
                                ? "text-lime-600"
                                : parseFloat(percentage) >= 50
                                ? "text-yellow-600"
                                : parseFloat(percentage) > 0
                                ? "text-orange-600"
                                : "text-gray-400"
                            }`}
                          >
                            {percentage}%
                          </td>
                        </tr>
                      );
                    })}
                    {/* Total Row for Households */}
                    <tr className="bg-gray-200 border-t-2 border-gray-300 font-bold">
                      <td className="px-6 py-4 text-gray-900">TOTAL</td>
                      <td className="px-6 py-4 text-center text-gray-900">
                        {MUNICIPALITIES.reduce(
                          (sum, m) => sum + (HOUSEHOLD_TOTALS[m.value] || 0),
                          0
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-900">
                        {MUNICIPALITIES.reduce(
                          (sum, m) =>
                            sum + (updates[m.value]?.energizedHouseholds || 0),
                          0
                        )}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-lg">
                        {(() => {
                          const totalHH = MUNICIPALITIES.reduce(
                            (sum, m) => sum + (HOUSEHOLD_TOTALS[m.value] || 0),
                            0
                          );
                          const energizedHH = MUNICIPALITIES.reduce(
                            (sum, m) =>
                              sum +
                              (updates[m.value]?.energizedHouseholds || 0),
                            0
                          );
                          const totalPercent =
                            totalHH > 0
                              ? ((energizedHH / totalHH) * 100).toFixed(2)
                              : (0).toFixed(2);
                          return (
                            <span
                              className={
                                parseFloat(totalPercent) === 100
                                  ? "text-green-600 bg-green-50 px-2 py-1 rounded"
                                  : parseFloat(totalPercent) >= 75
                                  ? "text-lime-600"
                                  : parseFloat(totalPercent) >= 50
                                  ? "text-yellow-600"
                                  : parseFloat(totalPercent) > 0
                                  ? "text-orange-600"
                                  : "text-gray-400"
                              }
                            >
                              {totalPercent}%
                            </span>
                          );
                        })()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Notes & Submit */}
              <div className="p-3 sm:p-6 bg-gray-50 border-t border-gray-200">
                <p className="text-xs sm:text-xs text-gray-600 mb-3 sm:mb-4 leading-relaxed">
                  * Percentage calculates automatically. Leave energized
                  households empty or zero to skip that municipality.
                </p>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 sm:py-3 rounded-lg transition text-sm sm:text-base"
                >
                  {loading ? "⏳ Submitting..." : "✅ Submit Household Updates"}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Barangay Household Form */}
        {activeTab === "barangay_household" && (
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* Instructions & Date/Time Picker */}
              <div className="p-3 sm:p-6 bg-blue-50 border-b border-blue-200 space-y-3 sm:space-y-4">
                <p className="text-xs sm:text-sm text-blue-900">
                  ℹ️ Click on a municipality to expand and enter restored households for each barangay. The percentage will calculate automatically.
                </p>
                <div>
                  <label
                    htmlFor="as_of_time_brgy_hh"
                    className="block text-xs sm:text-sm font-semibold text-blue-900 mb-2"
                  >
                    Report As Of Date & Time
                  </label>
                  <input
                    id="as_of_time_brgy_hh"
                    type="datetime-local"
                    value={asOfTime}
                    onChange={(e) => setAsOfTime(e.target.value)}
                    className="w-full sm:w-64 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              {/* Municipalities List */}
              <div className="space-y-2 p-3 sm:p-6">
                {MUNICIPALITIES.map((muni) => {
                  const isExpanded = expandedBarangayMunicipality === muni.value;

                  return (
                    <div key={`brgy_hh_${muni.value}`} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Municipality Header - Clickable */}
                      <button
                        type="button"
                        onClick={() => {
                          if (isExpanded) {
                            setExpandedBarangayMunicipality(null);
                          } else {
                            setExpandedBarangayMunicipality(muni.value);
                          }
                        }}
                        className="w-full bg-gray-50 hover:bg-blue-50 transition px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between"
                      >
                        <span className="font-semibold text-gray-900 text-sm sm:text-base">{muni.label}</span>
                        <span className="text-gray-600">{isExpanded ? "▼" : "▶"}</span>
                      </button>

                      {/* Expanded Barangay List */}
                      {isExpanded && (
                        <div className="p-3 sm:p-6 bg-white space-y-3">
                          <p className="text-xs sm:text-sm text-gray-600 mb-4">Coming soon: Enter household restoration per barangay</p>
                          <div className="bg-blue-50 p-3 rounded border border-blue-200 text-xs sm:text-sm text-blue-900">
                            Barangay household data will be displayed here. Enter the number of restored households for each barangay.
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Notes & Submit */}
              <div className="p-3 sm:p-6 bg-gray-50 border-t border-gray-200">
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 leading-relaxed">
                  Household restoration tracking per barangay is coming soon.
                </p>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 sm:py-3 rounded-lg transition text-sm sm:text-base"
                >
                  {loading ? "⏳ Submitting..." : "✅ Submit Barangay Household Updates"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
