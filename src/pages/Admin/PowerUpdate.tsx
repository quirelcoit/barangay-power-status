import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Card, useToast, PhotoCapture } from "../../components";
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
  { value: "san_agustin_isabela", label: "San Agustin, Isabela", totalBarangays: 18 },
];

export function PowerUpdate() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [municipality, setMunicipality] = useState<string>("");
  const [totalBarangays, setTotalBarangays] = useState<number>(0);
  const [energizedBarangays, setEnergizedBarangays] = useState<number>(0);
  const [partialBarangays, setPartialBarangays] = useState<number>(0);
  const [remarks, setRemarks] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
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
    } catch (err) {
      console.error("Auth check failed:", err);
      navigate("/admin/login");
    }
  };

  const handleMunicipalityChange = (value: string) => {
    setMunicipality(value);
    const muni = MUNICIPALITIES.find((m) => m.value === value);
    if (muni) {
      setTotalBarangays(muni.totalBarangays);
      setEnergizedBarangays(0);
      setPartialBarangays(0);
    }
  };

  const calculateNopower = (): number => {
    return Math.max(0, totalBarangays - energizedBarangays - partialBarangays);
  };

  const calculatePercentage = (): number => {
    return totalBarangays > 0
      ? Math.round((energizedBarangays / totalBarangays) * 100)
      : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!municipality) {
      addToast("Please select a municipality", "error");
      return;
    }

    if (energizedBarangays + partialBarangays > totalBarangays) {
      addToast(
        "Energized + Partial barangays cannot exceed total barangays",
        "error"
      );
      return;
    }

    setLoading(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      let photoUrl: string | null = null;

      // Upload photo if provided
      if (photoFile) {
        try {
          const fileName = `${Date.now()}-${Math.random()
            .toString(36)
            .substring(7)}.jpg`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("report-photos")
            .upload(fileName, photoFile, {
              cacheControl: "3600",
              upsert: false,
            });

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage
            .from("report-photos")
            .getPublicUrl(uploadData.path);

          photoUrl = urlData.publicUrl;
        } catch (photoErr) {
          console.warn("Photo upload failed:", photoErr);
          addToast("Photo upload failed, continuing without photo", "info");
        }
      }

      // Insert municipality update
      const { error } = await supabase.from("municipality_updates").insert([
        {
          municipality: municipality,
          total_barangays: totalBarangays,
          energized_barangays: energizedBarangays,
          partial_barangays: partialBarangays,
          no_power_barangays: calculateNopower(),
          remarks: remarks || null,
          photo_url: photoUrl,
          updated_by: session?.session?.user?.id,
          is_published: true,
        },
      ]);

      if (error) throw error;

      setSubmitted(true);
      addToast("✅ Power status updated successfully!", "success");

      setTimeout(() => {
        // Reset form
        setMunicipality("");
        setTotalBarangays(0);
        setEnergizedBarangays(0);
        setPartialBarangays(0);
        setRemarks("");
        setPhotoFile(null);
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-2">
          <button
            onClick={() => navigate("/admin")}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold">Power Status Update</h1>
        </div>

        {/* Success message */}
        {submitted && (
          <Card
            className="mb-6 bg-green-50 border-green-200"
            padding="md"
          >
            <div className="flex items-center gap-3">
              <Check size={24} className="text-green-600" />
              <div>
                <p className="font-semibold text-green-900">Update Recorded</p>
                <p className="text-sm text-green-700">
                  The power status has been successfully updated. Consumers will
                  see this in the Power Progress dashboard.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card padding="lg">
            {/* Municipality Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">
                Municipality / City
              </label>
              <select
                value={municipality}
                onChange={(e) => handleMunicipalityChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a municipality...</option>
                {MUNICIPALITIES.map((muni) => (
                  <option key={muni.value} value={muni.value}>
                    {muni.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Power Status Grid */}
            {municipality && (
              <>
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold mb-4 text-blue-900">
                    Power Status
                  </h3>

                  {/* Total Barangays (Read-only) */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2">
                      Total Barangays
                    </label>
                    <input
                      type="number"
                      value={totalBarangays}
                      disabled
                      className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
                    />
                  </div>

                  {/* Energized Barangays */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2">
                      🟢 Energized Barangays
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={totalBarangays}
                      value={energizedBarangays}
                      onChange={(e) =>
                        setEnergizedBarangays(Math.max(0, parseInt(e.target.value) || 0))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  {/* Partial Barangays */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2">
                      🟡 Partial Power Barangays
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={totalBarangays}
                      value={partialBarangays}
                      onChange={(e) =>
                        setPartialBarangays(Math.max(0, parseInt(e.target.value) || 0))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>

                  {/* No Power (Calculated) */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2">
                      🔴 No Power Barangays
                    </label>
                    <input
                      type="number"
                      value={calculateNopower()}
                      disabled
                      className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
                    />
                  </div>

                  {/* Percentage */}
                  <div className="pt-4 border-t border-blue-200">
                    <p className="text-sm text-gray-600 mb-2">
                      Overall Energization Rate:
                    </p>
                    <p className="text-4xl font-bold text-green-600">
                      {calculatePercentage()}%
                    </p>
                  </div>
                </div>

                {/* Remarks */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2">
                    Remarks (Optional)
                  </label>
                  <textarea
                    value={remarks}
                    onChange={(e) =>
                      setRemarks(e.target.value.substring(0, 500))
                    }
                    maxLength={500}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Any additional notes about the power restoration progress..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {remarks.length}/500 characters
                  </p>
                </div>

                {/* Photo Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2">
                    Photo (Optional)
                  </label>
                  <PhotoCapture
                    onPhotoSelect={setPhotoFile}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition"
                >
                  {loading ? "⏳ Updating..." : "📤 Submit Update"}
                </button>
              </>
            )}
          </Card>
        </form>
      </div>
    </div>
  );
}
