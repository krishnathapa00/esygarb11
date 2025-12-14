export const detectLocation = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    let settled = false;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (settled) return;
        settled = true;

        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.warn("GPS error (ignored initially):", error);

        if (error.code === error.PERMISSION_DENIED) {
          return;
        }

        if (!settled) {
          settled = true;
          reject(new Error("Unable to detect location"));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );

    setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error("Location detection timed out"));
      }
    }, 22000);
  });
};
