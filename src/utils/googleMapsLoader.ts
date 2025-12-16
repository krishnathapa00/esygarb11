const GOOGLE_MAPS_API_KEY = "AIzaSyADxM5y7WrXu3BRJ_hJQZhh6FLXWyO3E1g";

let isGoogleMapsLoading = false;
let isGoogleMapsLoaded = false;
const loadCallbacks: (() => void)[] = [];

export const loadGoogleMapsScript = (callback?: () => void): Promise<void> => {
  return new Promise((resolve, reject) => {
    // If already loaded, execute callback immediately
    if (isGoogleMapsLoaded && window.google && window.google.maps) {
      callback?.();
      resolve();
      return;
    }

    // If currently loading, add to callback queue
    if (isGoogleMapsLoading) {
      if (callback) {
        loadCallbacks.push(() => {
          callback();
          resolve();
        });
      } else {
        loadCallbacks.push(() => resolve());
      }
      return;
    }

    // Check if script already exists in DOM
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com"]'
    );
    if (existingScript) {
      // Script exists, wait for it to load
      if (window.google && window.google.maps) {
        isGoogleMapsLoaded = true;
        callback?.();
        resolve();
      } else {
        // Wait for existing script to load
        existingScript.addEventListener("load", () => {
          isGoogleMapsLoaded = true;
          callback?.();
          loadCallbacks.forEach((cb) => cb());
          loadCallbacks.length = 0;
          resolve();
        });
      }
      return;
    }

    // Start loading
    isGoogleMapsLoading = true;

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      isGoogleMapsLoaded = true;
      isGoogleMapsLoading = false;
      callback?.();
      loadCallbacks.forEach((cb) => cb());
      loadCallbacks.length = 0;
      resolve();
    };

    script.onerror = (error) => {
      isGoogleMapsLoading = false;
      console.error("Failed to load Google Maps script:", error);
      reject(new Error("Failed to load Google Maps"));
    };

    document.head.appendChild(script);
  });
};

export const isGoogleMapsReady = (): boolean => {
  return isGoogleMapsLoaded && !!window.google?.maps;
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    google: any;
  }
}
