export const detectLocation = async (
  apiKey: string
): Promise<{ lat: number; lng: number }> => {
  let browserCoords: { lat?: number; lng?: number } = {};

  try {
    await new Promise<void>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          browserCoords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          resolve();
        },
        () => resolve(), // ignore browser errors
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  } catch {}

  // Google Geolocation API
  const response = await fetch(
    `https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`,
    {
      method: "POST",
      body: JSON.stringify({
        considerIp: true,
        fallback_location: browserCoords,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Google Geolocation API request failed");
  }

  const data = await response.json();

  return {
    lat: data.location.lat,
    lng: data.location.lng,
  };
};
