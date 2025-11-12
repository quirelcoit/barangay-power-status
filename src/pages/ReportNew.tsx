import { useState } from "react";
import { supabase } from "../lib/supabase";
import {
  Card,
  MunicipalityBarangayPicker,
  GPSChip,
  PhotoCapture,
  useToast,
} from "../components";
import { addToQueue, getQueue } from "../store/reportQueue";
import { useOnlineQueue } from "../hooks/useOnlineQueue";
import { AlertCircle, Wifi, WifiOff } from "lucide-react";

const CATEGORIES = [
  {
    id: "broken_pole",
    label: "🚩 Broken Pole",
    description: "Damaged or leaning utility pole",
  },
  {
    id: "fallen_wire",
    label: "⚡ Fallen Wire",
    description: "Downed power line",
  },
  {
    id: "tree_on_line",
    label: "🌳 Tree on Line",
    description: "Tree branches or trunk on wires",
  },
  {
    id: "transformer_noise",
    label: "🔊 Transformer Noise",
    description: "Buzzing or humming transformer",
  },
  {
    id: "kwh_meter_damage",
    label: "📊 KWH Meter Damage",
    description: "Broken or damaged meter",
  },
  { id: "other", label: "❓ Other", description: "Other hazard" },
];

export function ReportNew() {
  const { addToast } = useToast();
  const { isOnline } = useOnlineQueue();

  const [category, setCategory] = useState<string>("");
  const [barangayId, setBarangayId] = useState<string>("");
  const [customLocation, setCustomLocation] = useState<string | undefined>();
  const [description, setDescription] = useState("");
  const [contactHint, setContactHint] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleBarangayChange = (id: string, custom?: string) => {
    setBarangayId(id);
    setCustomLocation(custom);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if valid barangay selected
    const isCustomLocation = barangayId.startsWith("__CUSTOM__:");
    const actualBarangayId = isCustomLocation
      ? customLocation // Will be stored as the location text
      : barangayId;

    // GPS is now REQUIRED
    if (!category || !actualBarangayId || !location) {
      if (!location) {
        addToast("GPS location is required to submit a report", "error");
      } else {
        addToast("Please fill in all required fields", "error");
      }
      return;
    }

    setLoading(true);

    try {
      let photoBase64: string | undefined;

      if (photoFile) {
        photoBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(photoFile);
        });
      }

      if (isOnline) {
        // Upload immediately
        const reportData: Record<string, unknown> = {
          category,
          description: description || null,
          contact_hint: contactHint || null,
          lat: location.lat,
          lng: location.lng,
          turnstile_ok: true,
        };

        // If custom location, store it in a notes field; otherwise use barangay_id
        if (isCustomLocation && customLocation) {
          reportData.custom_location = customLocation;
        } else {
          reportData.barangay_id = actualBarangayId;
        }

        console.log("📤 Submitting report data:", reportData);

        const { data: insertedReport, error: reportError } = await supabase
          .from("reports")
          .insert([reportData])
          .select();

        if (reportError) {
          console.error("❌ Supabase error:", reportError);
          throw reportError;
        }
        console.log("✅ Report inserted:", insertedReport);

        if (photoFile && insertedReport && insertedReport.length > 0) {
          const fileName = `${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}.jpg`;

          const { error: uploadError } = await supabase.storage
            .from("report-photos")
            .upload(fileName, photoFile, {
              contentType: "image/jpeg",
            });

          if (!uploadError) {
            await supabase.from("report_photos").insert([
              {
                report_id: insertedReport[0].id,
                storage_path: fileName,
              },
            ]);
          }
        }

        addToast("Report submitted successfully!", "success");
      } else {
        // Queue for later
        addToQueue({
          barangayId: isCustomLocation ? undefined : actualBarangayId,
          customLocation: isCustomLocation ? customLocation : undefined,
          category,
          description: description || "",
          contactHint: contactHint || "",
          lat: location.lat,
          lng: location.lng,
          photoBase64,
        });

        addToast(
          "Offline: Report queued and will be sent when online",
          "info",
          4000
        );
      }

      // Show success message but DON'T redirect - let user submit another report
      addToast("Report submitted successfully!", "success");
      
      // Reset ONLY optional fields - keep required fields for next report
      setDescription("");
      setContactHint("");
      setPhotoFile(null);
      // Keep: category, barangayId, customLocation, location for easy re-submit
    } catch (err) {
      console.error("Failed to submit report:", err);
      addToast(
        err instanceof Error ? err.message : "Failed to submit report",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const queuedCount = getQueue().length;

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Report Hazard</h1>
        <p className="text-gray-600 mb-6">
          Help us keep everyone safe by reporting power hazards
        </p>

        {/* Connectivity Banner */}
        <div
          className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
            isOnline
              ? "bg-power-50 border border-power-200 text-power-800"
              : "bg-yellow-50 border border-yellow-200 text-yellow-800"
          }`}
        >
          {isOnline ? (
            <Wifi className="w-5 h-5 flex-shrink-0" />
          ) : (
            <WifiOff className="w-5 h-5 flex-shrink-0" />
          )}
          <div className="flex-1">
            <p className="font-medium">
              {isOnline ? "Online" : "Offline Mode"}
            </p>
            <p className="text-sm">
              {isOnline
                ? "Reports will be sent immediately"
                : `Reports will be queued and sent when online. (${queuedCount} pending)`}
            </p>
          </div>
        </div>

        <Card padding="lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Safety Warning */}
            <div className="bg-danger-50 border border-danger-200 p-4 rounded-lg flex gap-3 text-danger-800">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">
                ⚠️ <strong>Do not approach fallen wires or hazards.</strong>{" "}
                Assume all lines are energized.
              </p>
            </div>

            {/* Category Selection */}
            <div className="space-y-2">
              <label className="font-medium text-gray-700">Category *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={`p-3 text-left rounded-lg border-2 transition-colors ${
                      category === c.id
                        ? "border-power-500 bg-power-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <p className="font-medium">{c.label}</p>
                    <p className="text-xs text-gray-600">{c.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Barangay - Municipality & Barangay Two-tier */}
            <MunicipalityBarangayPicker
              value={barangayId}
              customLocation={customLocation}
              onChange={handleBarangayChange}
            />

            {/* Location */}
            <div className="space-y-2">
              <GPSChip onLocation={(lat, lng) => setLocation({ lat, lng })} />
              {location ? (
                <div className="flex items-center gap-2 p-2 bg-power-50 border border-power-200 rounded-lg">
                  <div className="w-2 h-2 bg-power-600 rounded-full"></div>
                  <span className="text-sm text-power-700 font-medium">
                    ✅ GPS acquired ({location.lat.toFixed(4)},{" "}
                    {location.lng.toFixed(4)})
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse"></div>
                  <span className="text-sm text-yellow-700 font-medium">
                    📍 GPS location required to submit
                  </span>
                </div>
              )}
            </div>

            {/* Photo */}
            <PhotoCapture onPhotoSelect={setPhotoFile} />

            {/* Description */}
            <div className="space-y-2">
              <label
                htmlFor="description"
                className="font-medium text-gray-700"
              >
                Description (optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide additional details about the hazard..."
                maxLength={200}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-power-500"
              />
              <p className="text-xs text-gray-500">{description.length}/200</p>
            </div>

            {/* Contact Hint */}
            <div className="space-y-2">
              <label htmlFor="contact" className="font-medium text-gray-700">
                Contact Hint (optional, e.g., first name)
              </label>
              <input
                id="contact"
                type="text"
                value={contactHint}
                onChange={(e) => setContactHint(e.target.value)}
                placeholder="E.g., Juan"
                maxLength={50}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-power-500"
              />
              <p className="text-xs text-gray-500">
                We do not store personal information
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={
                loading ||
                !category ||
                !barangayId ||
                !location ||
                (barangayId.startsWith("__CUSTOM__:") && !customLocation)
              }
              className="w-full px-4 py-3 bg-power-600 text-white rounded-lg font-medium hover:bg-power-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "Submit Report"}
            </button>
          </form>
        </Card>

        <p className="mt-4 text-sm text-gray-600 text-center">
          Your report helps us respond faster to hazards and keep your barangay
          safe.
        </p>
      </div>
    </div>
  );
}
