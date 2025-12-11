import React, { useEffect, useRef, useState } from "react";

interface AddressInputProps {
  value: string;
  setValue: (value: string) => void;
  onSelectValidAddress: (isValid: boolean) => void;
}

const GOOGLE_MAPS_API_KEY = "AIzaSyADxM5y7WrXu3BRJ_hJQZhh6FLXWyO3E1g";

const loadGoogleMapsScript = (callback: () => void) => {
  if (document.getElementById("google-maps-script")) {
    callback();
    return;
  }

  const script = document.createElement("script");
  script.id = "google-maps-script";
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
  script.async = true;
  script.defer = true;
  script.onload = callback;
  document.body.appendChild(script);
};

const AddressInput: React.FC<AddressInputProps> = ({
  value,
  setValue,
  onSelectValidAddress,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadGoogleMapsScript(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded || !window.google || !inputRef.current) return;

    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ["geocode"],
        componentRestrictions: { country: "np" },
      }
    );

    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace();
      if (place?.formatted_address) {
        setValue(place.formatted_address);
        onSelectValidAddress(true);
      }
    });

    return () => {
      if (autocompleteRef.current) autocompleteRef.current.unbindAll();
    };
  }, [loaded, setValue, onSelectValidAddress]);

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
