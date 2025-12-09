export const detectUserLocation = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      return reject(new Error("Geolocation is not supported by this browser."));
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;

        // Save in localStorage
        localStorage.setItem(
          "esygrab_location",
          JSON.stringify({ coordinates: { lat, lng }, detected: true })
        );

        resolve({ lat, lng });
      },
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
};
