/**
 * Strip EXIF data from image (client-side)
 * Returns a new blob without EXIF metadata
 */
export async function stripEXIF(file: File): Promise<Blob> {
  // Read the image
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas and redraw (removes EXIF)
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to strip EXIF"));
            }
          },
          "image/jpeg",
          0.9
        );
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Extract GPS coordinates from EXIF (if available)
 * Returns null if no GPS data found
 */
export function extractGPSFromEXIF(
  _file: File
): Promise<{ lat: number; lng: number } | null> {
  // For now, return null since we use Geolocation API
  // This is a stub for future enhancement with EXIF parsing library
  return Promise.resolve(null);
}
