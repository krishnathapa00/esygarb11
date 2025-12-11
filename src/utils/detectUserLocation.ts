export const detectUserLocation = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error("Geolocation not supported by your browser."));
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        let message = "Failed to get location.";

        switch (error.code) {
          case 1:
            message =
              "Location permission denied. Please enable it in browser settings.";
            break;
          case 2:
            message = "Location unavailable. Try again.";
            break;
          case 3:
            message = "Location request timed out. Please retry.";
            break;
        }

        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
};
