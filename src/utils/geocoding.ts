const MAPBOX_TOKEN = 'pk.eyJ1Ijoia3Jpc2huYTEyNDMzNCIsImEiOiJjbWVodG1mZjcwMjhwMnJxczZ1ZWQyeTNlIn0.pl7sk2526OEU-Ub-hB0QTQ';

export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&types=address,poi`
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        return data.features[0].place_name;
      }
    }
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
};

export const parseCoordinatesFromAddress = (address: string): { lat: number; lng: number } | null => {
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
    console.error('Error parsing coordinates:', error);
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