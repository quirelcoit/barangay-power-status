/**
 * Get current location using Geolocation API with fallback methods
 */
export async function getCurrentLocation(): Promise<{
  lat: number;
  lng: number;
}> {
  // Try GPS first (most accurate)
  try {
    const gpsLocation = await getGPSLocation();
    return gpsLocation;
  } catch (gpsError) {
    console.warn("GPS failed, trying IP geolocation:", gpsError);
  }

  // Fallback to IP geolocation
  try {
    const ipLocation = await getIPGeolocation();
    return ipLocation;
  } catch (ipError) {
    console.warn("IP geolocation failed:", ipError);
  }

  // If all else fails, throw error
  throw new Error(
    "Unable to get location. Please enable GPS and try again, or ensure an active internet connection."
  );
}

/**
 * Get precise location using GPS (browser Geolocation API)
 */
function getGPSLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        let errorMsg = "Unknown geolocation error";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg =
              "Location permission denied. Please enable GPS in your phone settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg =
              "Location unavailable. Ensure GPS is enabled and you have a clear view of the sky.";
            break;
          case error.TIMEOUT:
            errorMsg =
              "Location request timed out. Please try again with GPS enabled.";
            break;
        }
        reject(new Error(errorMsg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Get approximate location from IP address (50-100km accuracy)
 * Uses free IP geolocation service
 */
async function getIPGeolocation(): Promise<{ lat: number; lng: number }> {
  try {
    const response = await fetch("https://ipapi.co/json/", {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error("IP geolocation service unavailable");

    const data = await response.json();
    if (!data.latitude || !data.longitude) {
      throw new Error("Invalid IP geolocation response");
    }

    return {
      lat: parseFloat(data.latitude),
      lng: parseFloat(data.longitude),
    };
  } catch (err) {
    throw new Error(
      `IP geolocation failed: ${
        err instanceof Error ? err.message : "Unknown error"
      }`
    );
  }
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(lat: number, lng: number): string {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

/**
 * Calculate distance between two points (in km)
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Service Area Boundaries (approximate)
 * Covers: 
 * - All municipalities in Quirino: Aglipay, Cabarroguis, Diffun, Maddela, Nagtipunan, Saguday
 * - San Agustin, Isabela (neighboring consumer area)
 */
const SERVICE_AREA_BOUNDS = {
  minLat: 15.8,   // Southern boundary (San Agustin, Isabela)
  maxLat: 17.5,   // Northern boundary (Quirino)
  minLng: 120.5,  // Western boundary
  maxLng: 122.0,  // Eastern boundary
};

/**
 * Check if a location is within service area (Quirino + San Agustin, Isabela)
 */
export function isLocationInServiceArea(lat: number, lng: number): boolean {
  return (
    lat >= SERVICE_AREA_BOUNDS.minLat &&
    lat <= SERVICE_AREA_BOUNDS.maxLat &&
    lng >= SERVICE_AREA_BOUNDS.minLng &&
    lng <= SERVICE_AREA_BOUNDS.maxLng
  );
}

/**
 * Check if a location is within Quirino Province bounds (legacy function)
 */
export function isLocationInQuirinoBounds(lat: number, lng: number): boolean {
  return isLocationInServiceArea(lat, lng);
}

/**
 * Get service area center for map focusing
 */
export function getQuirinoCenterLocation(): { lat: number; lng: number } {
  return {
    lat: (SERVICE_AREA_BOUNDS.minLat + SERVICE_AREA_BOUNDS.maxLat) / 2,
    lng: (SERVICE_AREA_BOUNDS.minLng + SERVICE_AREA_BOUNDS.maxLng) / 2,
  };
}
