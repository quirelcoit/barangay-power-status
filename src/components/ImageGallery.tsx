import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Card } from "./Card";
import { useToast } from "./Toast";

interface Photo {
  id: string;
  report_id: string;
  storage_path: string;
  created_at: string;
  report?: {
    category: string;
    description: string | null;
    barangay_id: string | null;
    custom_location: string | null;
    lat: number | null;
    lng: number | null;
  };
  barangay?: {
    name: string;
    municipality: string;
  };
  url?: string;
}

interface ImageGalleryProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  broken_pole: "#dc2626",
  fallen_wire: "#ef4444",
  tree_on_line: "#22c55e",
  transformer_noise: "#f59e0b",
  kwh_meter_damage: "#3b82f6",
  other: "#8b5cf6",
};

const CATEGORY_LABELS: Record<string, string> = {
  broken_pole: "🚩 Broken Pole",
  fallen_wire: "⚡ Fallen Wire",
  tree_on_line: "🌳 Tree on Line",
  transformer_noise: "🔊 Transformer Noise",
  kwh_meter_damage: "📊 KWH Meter Damage",
  other: "❓ Other",
};

export function ImageGallery({ isOpen, onClose }: ImageGalleryProps) {
  const { addToast } = useToast();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stats, setStats] = useState({
    total: 0,
    byCategory: {} as Record<string, number>,
  });

  useEffect(() => {
    if (isOpen) {
      loadPhotos();
    }
  }, [isOpen]);

  const loadPhotos = async () => {
    try {
      setLoading(true);

      // Get photos with report details
      const { data: photosData, error: photosError } = await supabase
        .from("report_photos")
        .select(
          `
          id,
          report_id,
          storage_path,
          created_at,
          reports(
            category,
            description,
            barangay_id,
            custom_location,
            lat,
            lng,
            barangays(name, municipality)
          )
        `
        )
        .order("created_at", { ascending: false });

      console.log("📸 Gallery query result:", { photosData, photosError });

      if (photosError) throw photosError;

      // Generate signed URLs for photos
      const photosWithUrls = await Promise.all(
        (photosData || []).map(async (photo: any) => {
          const { data: signedUrlData } = await supabase.storage
            .from("report-photos")
            .createSignedUrl(photo.storage_path, 3600); // 1 hour expiry

          return {
            ...photo,
            report: photo.reports,
            barangay: photo.reports?.barangays,
            url: signedUrlData?.signedUrl || null,
          };
        })
      );

      setPhotos(photosWithUrls);

      // Calculate stats
      const byCategory: Record<string, number> = {};
      photosWithUrls.forEach((photo) => {
        if (photo.report?.category) {
          byCategory[photo.report.category] =
            (byCategory[photo.report.category] || 0) + 1;
        }
      });

      setStats({
        total: photosWithUrls.length,
        byCategory,
      });
      console.log("✅ Photos loaded successfully:", photosWithUrls.length);
    } catch (err) {
      console.error("❌ Failed to load photos:", err);
      addToast("Failed to load photos", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredPhotos =
    categoryFilter === "all"
      ? photos
      : photos.filter((p) => p.report?.category === categoryFilter);

  const currentPhoto = filteredPhotos[selectedIndex];

  const downloadPhoto = async (photo: Photo) => {
    if (!photo.url) return;
    const link = document.createElement("a");
    link.href = photo.url;
    link.download = `report-${photo.report_id}-${photo.storage_path}`;
    link.click();
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading photos...</p>
        </div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card padding="lg" className="max-w-md">
          <div className="text-center">
            <p className="text-2xl mb-2">📸</p>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Photos</h2>
            <p className="text-gray-600">No report photos available yet.</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 bg-gray-50 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              📸 Report Photos
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {filteredPhotos.length} of {photos.length} photos
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* Photo Viewer */}
          <div className="flex-1 bg-black flex flex-col items-center justify-center p-4 min-h-64">
            {currentPhoto?.url ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={currentPhoto.url}
                  alt={`Report ${currentPhoto.report_id}`}
                  className="max-w-full max-h-full object-contain"
                />
                {/* Navigation */}
                {filteredPhotos.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setSelectedIndex(
                          (selectedIndex - 1 + filteredPhotos.length) %
                            filteredPhotos.length
                        )
                      }
                      className="absolute left-4 bg-white/80 hover:bg-white p-2 rounded-full text-gray-900"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() =>
                        setSelectedIndex(
                          (selectedIndex + 1) % filteredPhotos.length
                        )
                      }
                      className="absolute right-4 bg-white/80 hover:bg-white p-2 rounded-full text-gray-900"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>
            ) : (
              <p className="text-white">Image not available</p>
            )}
          </div>

          {/* Sidebar - Photo Details & Filters */}
          <div className="w-full lg:w-80 border-l border-gray-200 bg-gray-50 flex flex-col overflow-hidden">
            {/* Category Filter */}
            <div className="border-b border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                Filter by Category:
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCategoryFilter("all")}
                  className={`text-xs px-2 py-1 rounded transition-all ${
                    categoryFilter === "all"
                      ? "bg-power-600 text-white font-semibold"
                      : "bg-white border border-gray-300 text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  All ({photos.length})
                </button>
                {Object.entries(CATEGORY_LABELS).map(([category, label]) => {
                  const count = stats.byCategory[category] || 0;
                  if (count === 0) return null;
                  return (
                    <button
                      key={category}
                      onClick={() => setCategoryFilter(category)}
                      className={`text-xs px-2 py-1 rounded transition-all flex items-center gap-1 ${
                        categoryFilter === category
                          ? "text-white font-semibold"
                          : "bg-white border border-gray-300 text-gray-800 hover:bg-gray-100"
                      }`}
                      style={
                        categoryFilter === category
                          ? { backgroundColor: CATEGORY_COLORS[category] }
                          : {}
                      }
                    >
                      <span>{label.split(" ")[0]}</span>
                      <span className="font-bold">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Photo Details */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentPhoto ? (
                <>
                  {/* Report Category */}
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">
                      Category:
                    </p>
                    <div className="flex items-center gap-2 p-2 bg-white rounded border">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            CATEGORY_COLORS[
                              currentPhoto.report?.category || "other"
                            ],
                        }}
                      />
                      <span className="text-sm font-semibold text-gray-900">
                        {
                          CATEGORY_LABELS[
                            currentPhoto.report?.category || "other"
                          ]
                        }
                      </span>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">
                      📍 Location:
                    </p>
                    <p className="text-sm text-gray-800 bg-white p-2 rounded border">
                      {currentPhoto.barangay
                        ? `${currentPhoto.barangay.name}, ${currentPhoto.barangay.municipality}`
                        : currentPhoto.report?.custom_location || "Unknown"}
                    </p>
                  </div>

                  {/* Coordinates */}
                  {currentPhoto.report?.lat && currentPhoto.report?.lng && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1">
                        🗺️ Coordinates:
                      </p>
                      <p className="text-xs text-gray-700 bg-white p-2 rounded border font-mono">
                        {currentPhoto.report.lat.toFixed(6)},{" "}
                        {currentPhoto.report.lng.toFixed(6)}
                      </p>
                    </div>
                  )}

                  {/* Description */}
                  {currentPhoto.report?.description && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1">
                        Description:
                      </p>
                      <p className="text-sm text-gray-700 bg-white p-2 rounded border">
                        "{currentPhoto.report.description}"
                      </p>
                    </div>
                  )}

                  {/* Date */}
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">
                      📅 Date:
                    </p>
                    <p className="text-sm text-gray-700 bg-white p-2 rounded border">
                      {new Date(currentPhoto.created_at).toLocaleString()}
                    </p>
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={() => downloadPhoto(currentPhoto)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download Photo
                  </button>

                  {/* Photo Number */}
                  <div className="text-center pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-600">
                      Photo {selectedIndex + 1} of {filteredPhotos.length}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-gray-600 text-center">
                  No photo details available
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Thumbnail Strip */}
        <div className="border-t border-gray-200 bg-gray-100 p-2 overflow-x-auto">
          <div className="flex gap-2">
            {filteredPhotos.map((photo, idx) => (
              <button
                key={photo.id}
                onClick={() => setSelectedIndex(idx)}
                className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  idx === selectedIndex
                    ? "border-power-600 shadow-lg"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                {photo.url ? (
                  <img
                    src={photo.url}
                    alt={`Thumbnail ${idx}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                    <span className="text-xs">?</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
