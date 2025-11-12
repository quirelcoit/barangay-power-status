import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Card, useToast, MunicipalityBarangayPicker, PhotoCapture } from "../../components";
import { isLocationInServiceArea } from "../../lib/geo";
import { ArrowLeft, AlertCircle } from "lucide-react";

export function PowerUpdate() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [barangayId, setBarangayId] = useState<string>("");
  const [powerStatus, setPowerStatus] = useState<"no_power" | "partial" | "energized">("no_power");
  const [remarks, setRemarks] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

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

  const handleBarangayChange = (id: string) => {
    setBarangayId(id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!barangayId) {
      addToast("Please select a barangay", "error");
      return;
    }

    setLoading(true);

    try {
      // Get location
      let photoUrl: string | null = null;

      if (!location) {
        addToast("📍 Requesting location...", "info");
        try {
          const { getCurrentLocation } = await import("../../lib/geo");
          const newLocation = await getCurrentLocation();
          setLocation(newLocation);

          if (!isLocationInServiceArea(newLocation.lat, newLocation.lng)) {
            addToast(
              "⚠️ Location is outside service area. Update recorded but location not saved.",
              "info"
            );
          }
        } catch (locError) {
          console.warn("Could not get location:", locError);
        }
      }

      // Upload photo if provided
      if (photoFile) {
        try {
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.jpg`;
          const { error: uploadError } = await supabase.storage
            .from("report-photos")
            .upload(fileName, photoFile, { contentType: "image/jpeg" });

          if (!uploadError) {
            photoUrl = fileName;
            addToast("✅ Photo uploaded", "success");
          }
        } catch (err) {
          console.warn("Photo upload failed:", err);
        }
      }

      // Insert update record
      const { error: insertError } = await supabase
        .from("barangay_updates")
        .insert([
          {
            barangay_id: barangayId,
            power_status: powerStatus,
            remarks: remarks || null,
            photo_url: photoUrl,
            lat: location?.lat || null,
            lng: location?.lng || null,
            updated_by: (await supabase.auth.getSession()).data.session?.user.id,
            is_published: true,
          },
        ]);

      if (insertError) throw insertError;

      addToast("✅ Power status updated successfully!", "success");

      // Reset form
      setBarangayId("");
      setPowerStatus("no_power");
      setRemarks("");
      setPhotoFile(null);
      setLocation(null);
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "Failed to update status",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Checking permissions...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-2xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-power-600 hover:text-power-700 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ⚡ Update Power Status
          </h1>
          <p className="text-gray-600">
            Record the latest power restoration status for a barangay
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Barangay Selection */}
          <MunicipalityBarangayPicker
            value={barangayId}
            onChange={(id: string) => handleBarangayChange(id)}
          />

          {/* Power Status */}
          <div className="space-y-2">
            <label className="font-medium text-gray-700">Power Status *</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "no_power", label: "🔴 No Power", color: "red" },
                { value: "partial", label: "🟡 Partial", color: "yellow" },
                {
                  value: "energized",
                  label: "🟢 Energized",
                  color: "green",
                },
              ].map((status) => (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => setPowerStatus(status.value as any)}
                  className={`p-3 rounded-lg border-2 font-medium transition-colors ${
                    powerStatus === status.value
                      ? `border-${status.color}-500 bg-${status.color}-50 text-${status.color}-700`
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location Info */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
            <span className="text-xl">📍</span>
            <div>
              <p className="font-medium">GPS Auto-Capture</p>
              <p className="text-xs mt-1">
                Location will be automatically captured when you submit this form. Make sure GPS is enabled.
              </p>
            </div>
          </div>

          {/* Photo Capture */}
          <PhotoCapture onPhotoSelect={setPhotoFile} />

          {/* Remarks */}
          <div className="space-y-2">
            <label htmlFor="remarks" className="font-medium text-gray-700">
              Remarks (optional)
            </label>
            <textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="E.g., Restored lines in north sector, awaiting transformer replacement..."
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-power-500"
            />
            <p className="text-xs text-gray-500">{remarks.length}/500</p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !barangayId}
            className="w-full px-4 py-3 bg-power-600 text-white rounded-lg font-medium hover:bg-power-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? "Updating..." : "✅ Update Status"}
          </button>
        </form>

        {/* Info Box */}
        <Card className="mt-8" padding="md">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-1">💡 Tips for Accurate Updates:</p>
              <ul className="space-y-1 text-xs list-disc list-inside">
                <li>Take photos from the barangay area showing actual power lines</li>
                <li>Include relevant remarks about restoration progress</li>
                <li>Enable GPS for accurate location tracking</li>
                <li>Update only when you have verified the current status</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
