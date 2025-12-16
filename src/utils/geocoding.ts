const GOOGLE_MAPS_API_KEY = "AIzaSyADxM5y7WrXu3BRJ_hJQZhh6FLXWyO3E1g";

export const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<string> => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
    );

    if (response.ok) {
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results[0].formatted_address;
      }
    }
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
};

export const parseCoordinatesFromAddress = (
  address: string
): { lat: number; lng: number } | null => {
  try {
    // Check if address contains coordinates in format "lat,lng" or "lat, lng"
    const coordMatch = address.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
    return null;
  } catch (error) {
    console.error("Error parsing coordinates:", error);
    return null;
  }
};

export const formatLocationName = async (address: string): Promise<string> => {
  // Check if address looks like coordinates
  const coords = parseCoordinatesFromAddress(address);
  if (coords) {
    // Convert coordinates to readable location name
    return await reverseGeocode(coords.lat, coords.lng);
  }
  return address;
};
