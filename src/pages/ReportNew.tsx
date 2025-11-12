import { useState } from "react";
import { supabase } from "../lib/supabase";
import {
  Card,
  MunicipalityBarangayPicker,
  PhotoCapture,
  useToast,
} from "../components";
import { addToQueue, getQueue } from "../store/reportQueue";
import { useOnlineQueue } from "../hooks/useOnlineQueue";
import { isLocationInQuirinoBounds } from "../lib/geo";
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
  const [contactName, setContactName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleBarangayChange = (id: string, custom?: string) => {
    console.log("📍 Barangay changed:", id);
    setBarangayId(id);
    setCustomLocation(custom);
  };

  const handleSubmit = async (e?: any) => {
    if (e) e.preventDefault();

    // Prevent double-submit
    if (loading) {
      return;
    }

    // Check if valid barangay selected
    const isCustomLocation = barangayId.startsWith("__CUSTOM__:");
    const actualBarangayId = isCustomLocation
      ? customLocation // Will be stored as the location text
      : barangayId;

    // Check required fields (excluding GPS first)
    if (!category || !actualBarangayId) {
      addToast("Please fill in all required fields", "error");
      return;
    }

    setLoading(true);

    try {
      // Capture location (GPS with fallback methods)
      let finalLocation = location;
      if (!finalLocation) {
        addToast("📍 Requesting location...", "info");
        try {
          const { getCurrentLocation } = await import("../lib/geo");
          finalLocation = await getCurrentLocation();
          setLocation(finalLocation);
          addToast("✅ Location acquired!", "success");
        } catch (locError) {
          const errorMsg =
            locError instanceof Error ? locError.message : "Unknown error";
          addToast(errorMsg, "error");
          setLoading(false);
          return;
        }
      }

      if (!finalLocation) {
        addToast("Unable to determine location. Please try again.", "error");
        setLoading(false);
        return;
      }

      // Validate location is within Quirino Province
      if (!isLocationInQuirinoBounds(finalLocation.lat, finalLocation.lng)) {
        addToast(
          "❌ Your location is outside the service area. Please recapture GPS or move to Quirino Province or San Agustin, Isabela.",
          "error"
        );
        setLocation(finalLocation);
        setLoading(false);
        return;
      }

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
          contact_name: contactName || null,
          contact_number: contactNumber || null,
          lat: finalLocation.lat,
          lng: finalLocation.lng,
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

          console.log("📤 Uploading photo:", fileName);
          const { error: uploadError } = await supabase.storage
            .from("report-photos")
            .upload(fileName, photoFile, {
              contentType: "image/jpeg",
            });

          if (uploadError) {
            console.error("❌ Photo upload failed:", uploadError);
            addToast("⚠️ Photo upload failed, but report was saved", "info");
          } else {
            console.log("✅ Photo uploaded successfully");
            const { error: photoRecordError } = await supabase
              .from("report_photos")
              .insert([
                {
                  report_id: insertedReport[0].id,
                  storage_path: fileName,
                },
              ]);

            if (photoRecordError) {
              console.error(
                "❌ Failed to create photo record:",
                photoRecordError
              );
              addToast(
                "⚠️ Photo saved to storage but database record failed",
                "info"
              );
            } else {
              console.log("✅ Photo record created in database");
            }
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
          contactName: contactName || "",
          contactNumber: contactNumber || "",
          lat: finalLocation.lat,
          lng: finalLocation.lng,
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
      setContactName("");
      setContactNumber("");
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Report Hazard
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mb-6">
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
          <div className="space-y-6">
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

            {/* Location Info */}
            <div className="space-y-2">
              <label className="font-medium text-gray-700">Location *</label>
              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
                <span className="text-xl">📍</span>
                <div>
                  <p className="font-medium">GPS will be captured on submit</p>
                  <p className="text-xs mt-1">
                    When you click "Submit Report", we'll request your GPS
                    location. Make sure GPS is enabled on your phone for
                    accurate coordinates. If GPS unavailable, we'll use your
                    internet connection.
                  </p>
                </div>
              </div>
              {location && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 bg-power-50 border border-power-200 rounded-lg">
                    <div className="w-2 h-2 bg-power-600 rounded-full"></div>
                    <span className="text-sm text-power-700 font-medium">
                      ✅ Location ready: ({location.lat.toFixed(4)},{" "}
                      {location.lng.toFixed(4)})
                    </span>
                  </div>
                  
                  {/* Location Validation Warning */}
                  {!isLocationInQuirinoBounds(location.lat, location.lng) && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-300 rounded-lg text-red-800 text-sm">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">⚠️ Location Outside Service Area</p>
                        <p className="text-xs mt-1 mb-2">
                          Your GPS location is outside our service area (Quirino Province + San Agustin, Isabela). Reports can only be submitted from within the service area.
                        </p>
                        <button
                          type="button"
                          onClick={async () => {
                            setLoading(true);
                            try {
                              const { getCurrentLocation } = await import("../lib/geo");
                              const newLocation = await getCurrentLocation();
                              setLocation(newLocation);
                              if (isLocationInQuirinoBounds(newLocation.lat, newLocation.lng)) {
                                addToast("✅ Location is now valid!", "success");
                              } else {
                                addToast("⚠️ New location is still outside Quirino Province", "info");
                              }
                            } catch (err) {
                              addToast(
                                err instanceof Error ? err.message : "Failed to get location",
                                "error"
                              );
                            } finally {
                              setLoading(false);
                            }
                          }}
                          disabled={loading}
                          className="text-xs bg-red-200 hover:bg-red-300 disabled:bg-gray-300 px-3 py-1 rounded font-medium transition-colors"
                        >
                          🔄 Recapture GPS
                        </button>
                      </div>
                    </div>
                  )}
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
              <label className="font-medium text-gray-700">
                Contact Information (optional)
              </label>
              <p className="text-xs text-gray-500 mb-2">
                🔒 Only visible to admin staff for follow-up. Not shown
                publicly.
              </p>

              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="contactName"
                    className="text-sm text-gray-600"
                  >
                    Name
                  </label>
                  <input
                    id="contactName"
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                    placeholder="E.g., Juan Dela Cruz"
                    maxLength={100}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-power-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contactNumber"
                    className="text-sm text-gray-600"
                  >
                    Contact Number
                  </label>
                  <input
                    id="contactNumber"
                    type="tel"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                    placeholder="E.g., 09171234567"
                    maxLength={20}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-power-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={async (e) => {
                e.preventDefault();
                await handleSubmit(e as any);
              }}
              disabled={
                loading ||
                !category ||
                !barangayId ||
                (barangayId.startsWith("__CUSTOM__:") && !customLocation)
              }
              className="w-full px-4 py-3 bg-power-600 text-white rounded-lg font-medium hover:bg-power-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Getting location and submitting..." : "Submit Report"}
            </button>
          </div>
        </Card>

        <p className="mt-4 text-sm text-gray-600 text-center">
          Your report helps us respond faster to hazards and keep your barangay
          safe.
        </p>
      </div>
    </div>
  );
}
