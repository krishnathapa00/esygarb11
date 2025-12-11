import React, { useEffect, useRef } from "react";

interface AddressInputProps {
  value: string;
  setValue: (value: string) => void;
  onSelectValidAddress: (isValid: boolean) => void;
}

const GOOGLE_MAPS_API_KEY = "AIzaSyADxM5y7WrXu3BRJ_hJQZhh6FLXWyO3E1g";

// Singleton script loader
let googleMapsScriptLoading: Promise<void> | null = null;

const loadGoogleMapsScript = (): Promise<void> => {
  if (window.google?.maps) return Promise.resolve();

  if (googleMapsScriptLoading) return googleMapsScriptLoading;

  googleMapsScriptLoading = new Promise((resolve) => {
    const existing = document.getElementById("google-maps-script");
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => resolve();

    script.onerror = () => console.error("Google Maps failed to load");

    document.body.appendChild(script);
  });

  return googleMapsScriptLoading;
};

const AddressInput: React.FC<AddressInputProps> = ({
  value,
  setValue,
  onSelectValidAddress,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    loadGoogleMapsScript().then(() => {
      if (!inputRef.current || autocompleteRef.current) return;

      autocompleteRef.current = new google.maps.places.Autocomplete(
        inputRef.current,
        {
          fields: ["formatted_address", "geometry"],
          componentRestrictions: { country: "np" },
        }
      );

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current?.getPlace();
        if (!place || !place.geometry) {
          onSelectValidAddress(false);
          return;
        }

        setValue(place.formatted_address ?? "");
        onSelectValidAddress(true);
      });
    });

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    onSelectValidAddress(false);
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={handleChange}
      placeholder="Enter your address"
      className="w-full border rounded px-3 py-2 bg-white"
    />
  );
};

export default AddressInput;
