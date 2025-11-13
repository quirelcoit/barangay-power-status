import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useToast } from "../../components";
import { ArrowLeft, Check } from "lucide-react";

interface Municipality {
  value: string;
  label: string;
  totalBarangays: number;
}

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

export function PowerUpdate() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [updates, setUpdates] = useState<{
    [key: string]: { 
      energized: number; 
      remarks: string; 
      photo: File | null;
      totalHouseholds: number;
      energizedHouseholds: number;
    };
  }>({});
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

      // Fetch latest municipality data to pre-populate form
      await loadLatestData();
      setInitialized(true);
    } catch (err) {
      console.error("Auth check failed:", err);
      navigate("/admin/login");
    }
  };

  const loadLatestData = async () => {
    try {
      const { data, error } = await supabase
        .from("municipality_status")
        .select("*")
        .order("municipality");

      if (error) throw error;

      const newUpdates: { [key: string]: any } = {};
      MUNICIPALITIES.forEach((muni) => {
        const latest = data?.find((d) => d.municipality === muni.label);
        newUpdates[muni.value] = {
          energized: latest?.energized_barangays || 0,
          remarks: latest?.remarks || "",
          photo: null,
          totalHouseholds: 0,
          energizedHouseholds: 0,
        };
      });

      setUpdates(newUpdates);
    } catch (err) {
      console.warn("Could not load latest data:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if at least one municipality has data
    const hasUpdates = Object.values(updates).some((u) => u.energized > 0);
    if (!hasUpdates) {
      addToast(
        "Please enter at least one municipality's energized barangays",
        "error"
      );
      return;
    }

    setLoading(true);

    try {
      const { data: session } = await supabase.auth.getSession();

      // Convert local datetime-local to ISO string with timezone
      // datetime-local value is "YYYY-MM-DDTHH:mm", convert to ISO with timezone
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

        // Insert household update if household data is provided
        if (update.totalHouseholds > 0) {
          const { error: hhError } = await supabase
            .from("household_updates")
            .insert([
              {
                municipality: muni.label,
                total_households: update.totalHouseholds,
                energized_households: update.energizedHouseholds,
                remarks: update.remarks || null,
                updated_by: session?.session?.user?.id,
                is_published: true,
                as_of_time: asOfDateTime,
              },
            ]);

          if (hhError) throw hhError;
        }
      }

      setSubmitted(true);
      addToast(
        "✅ All power status updates submitted successfully!",
        "success"
      );

      setTimeout(() => {
        setUpdates({});
        setSubmitted(false);
      }, 2000);
    } catch (err) {
      console.error("Submission error:", err);
      addToast(
        err instanceof Error ? err.message : "Failed to update power status",
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

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Instructions & Date/Time Picker */}
            <div className="p-3 sm:p-6 bg-blue-50 border-b border-blue-200 space-y-3 sm:space-y-4">
              <p className="text-xs sm:text-sm text-blue-900">
                ℹ️ Enter the number of energized barangays for each
                municipality. Leave blank or zero to skip.
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

            {/* Table */}
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
                      Energized *
                    </th>
                    <th className="px-2 sm:px-6 py-3 sm:py-4 text-center font-bold text-green-600 text-xs sm:text-base">
                      %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {MUNICIPALITIES.map((muni, idx) => {
                    const bgColor = idx % 2 === 0 ? "bg-white" : "bg-gray-50";
                    const energized = updates[muni.value]?.energized || 0;
                    const percentage =
                      energized > 0
                        ? ((energized / muni.totalBarangays) * 100).toFixed(2)
                        : (0).toFixed(2);

                    return (
                      <tr
                        key={muni.value}
                        className={`${bgColor} border-b border-gray-200`}
                      >
                        <td className="px-3 sm:px-6 py-3 sm:py-4 font-semibold text-gray-900 text-xs sm:text-base">
                          {muni.label}
                        </td>
                        <td className="px-2 sm:px-6 py-3 sm:py-4 text-center font-semibold text-gray-900 text-xs sm:text-base">
                          {muni.totalBarangays}
                        </td>
                        <td className="px-2 sm:px-6 py-3 sm:py-4 text-center">
                          <input
                            type="number"
                            min="0"
                            max={muni.totalBarangays}
                            value={energized}
                            onChange={(e) => {
                              const val = Math.max(
                                0,
                                Math.min(
                                  muni.totalBarangays,
                                  parseInt(e.target.value) || 0
                                )
                              );
                              setUpdates({
                                ...updates,
                                [muni.value]: {
                                  energized: val,
                                  remarks: updates[muni.value]?.remarks || "",
                                  photo: updates[muni.value]?.photo || null,
                                  totalHouseholds: updates[muni.value]?.totalHouseholds || 0,
                                  energizedHouseholds: updates[muni.value]?.energizedHouseholds || 0,
                                },
                              });
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
                  {/* Total Row */}
                  <tr className="bg-gray-200 border-t-2 border-gray-300 font-bold">
                    <td className="px-6 py-4 text-gray-900">TOTAL</td>
                    <td className="px-6 py-4 text-center text-gray-900">
                      {MUNICIPALITIES.reduce(
                        (sum, m) => sum + m.totalBarangays,
                        0
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-900">
                      {MUNICIPALITIES.reduce(
                        (sum, m) => sum + (updates[m.value]?.energized || 0),
                        0
                      )}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-lg">
                      {(() => {
                        const totalBgy = MUNICIPALITIES.reduce(
                          (sum, m) => sum + m.totalBarangays,
                          0
                        );
                        const energizedBgy = MUNICIPALITIES.reduce(
                          (sum, m) => sum + (updates[m.value]?.energized || 0),
                          0
                        );
                        const totalPercent =
                          totalBgy > 0
                            ? ((energizedBgy / totalBgy) * 100).toFixed(2)
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

            {/* Household Data Section */}
            <div className="mt-8 border-t-2 border-gray-300">
              <div className="p-3 sm:p-6 bg-blue-50 border-b border-blue-200">
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2">
                  Household Connection Status
                </h2>
                <p className="text-xs sm:text-sm text-blue-900">
                  ℹ️ Enter household data (optional). If provided, households data will be recorded alongside barangay data.
                </p>
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
                        Total HH *
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
                      const totalHH = updates[muni.value]?.totalHouseholds || 0;
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
                          <td className="px-2 sm:px-6 py-3 sm:py-4 text-center">
                            <input
                              type="number"
                              min="0"
                              value={totalHH}
                              onChange={(e) => {
                                const val = Math.max(0, parseInt(e.target.value) || 0);
                                setUpdates({
                                  ...updates,
                                  [muni.value]: {
                                    ...updates[muni.value],
                                    totalHouseholds: val,
                                  },
                                });
                              }}
                              className="w-16 sm:w-20 mx-auto px-2 sm:px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-sm sm:text-base"
                              placeholder="0"
                            />
                          </td>
                          <td className="px-2 sm:px-6 py-3 sm:py-4 text-center">
                            <input
                              type="number"
                              min="0"
                              max={totalHH || undefined}
                              value={energizedHH}
                              onChange={(e) => {
                                const val = Math.max(
                                  0,
                                  Math.min(
                                    totalHH || Infinity,
                                    parseInt(e.target.value) || 0
                                  )
                                );
                                setUpdates({
                                  ...updates,
                                  [muni.value]: {
                                    ...updates[muni.value],
                                    energizedHouseholds: val,
                                  },
                                });
                              }}
                              className="w-16 sm:w-20 mx-auto px-2 sm:px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-sm sm:text-base"
                              placeholder="0"
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
                          (sum, m) =>
                            sum + (updates[m.value]?.totalHouseholds || 0),
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
                            (sum, m) =>
                              sum + (updates[m.value]?.totalHouseholds || 0),
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

              <div className="p-3 sm:p-6 bg-gray-50 border-t border-gray-200">
                <p className="text-xs sm:text-xs text-gray-600">
                  * Optional: Total Households and Energized Households. Leave blank if not available.
                </p>
              </div>
            </div>

            {/* Notes & Submit */}
            <div className="p-3 sm:p-6 bg-gray-50 border-t border-gray-200">
              <p className="text-xs sm:text-xs text-gray-600 mb-3 sm:mb-4 leading-relaxed">
                * Percentage calculates automatically. Leave energized barangays
                empty or zero to skip that municipality.
              </p>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 sm:py-3 rounded-lg transition text-sm sm:text-base"
              >
                {loading ? "⏳ Submitting..." : "✅ Submit All Updates"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
