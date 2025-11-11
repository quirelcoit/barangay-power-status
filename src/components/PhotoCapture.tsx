import { useRef, useState } from "react";
import { Camera, Upload, X } from "lucide-react";
import { compressImage } from "../lib/image";

interface PhotoCaptureProps {
  onPhotoSelect: (file: File) => void;
  disabled?: boolean;
}

export function PhotoCapture({
  onPhotoSelect,
  disabled = false,
}: PhotoCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    try {
      setLoading(true);
      setError(null);

      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }

      // Compress the image
      const compressed = await compressImage(file);
      const compressedFile = new File([compressed], file.name, {
        type: "image/jpeg",
      });

      onPhotoSelect(compressedFile);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(compressedFile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process image");
    } finally {
      setLoading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClear = () => {
    setPreview(null);
    setError(null);
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="flex items-center gap-2 font-medium text-gray-700">
        <Camera className="w-4 h-4" />
        Photo
      </label>

      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border border-gray-200"
          />
          <button
            onClick={handleClear}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => cameraInputRef.current?.click()}
            disabled={disabled || loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-power-100 border-2 border-power-300 text-power-700 rounded-lg hover:bg-power-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Camera className="w-5 h-5" />
            Take Photo
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-5 h-5" />
            Upload
          </button>
        </div>
      )}

      {error && <p className="text-sm text-danger-600">{error}</p>}

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileInputChange}
        disabled={disabled}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        disabled={disabled}
        className="hidden"
      />

      {loading && <p className="text-sm text-gray-600">Processing image...</p>}
    </div>
  );
}
