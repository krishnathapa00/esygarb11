import React, { useState, useRef } from "react";
import { useLoadScript, Autocomplete } from "@react-google-maps/api";

interface AddressInputProps {
  value: string;
  setValue: (value: string) => void;
}

const libraries: "places"[] = ["places"];

const AddressInput: React.FC<AddressInputProps> = ({ value, setValue }) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyADxM5y7WrXu3BRJ_hJQZhh6FLXWyO3E1g",
    libraries,
  });

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState(value);
  const [selected, setSelected] = useState(false);

  const cleanAddress = (address: string): string => {
    return address.replace(/\s*\d{3,6}\s*/g, "").trim();
  };

  const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (!autocompleteRef.current) return;

    const place = autocompleteRef.current.getPlace();
    if (place.formatted_address) {
      const cleaned = cleanAddress(place.formatted_address);

      setInputValue(cleaned);
      setValue(cleaned);
      setSelected(true);
    }
  };

  return !isLoaded ? (
    <input
      placeholder="Loading..."
      className="w-full border rounded px-3 py-2"
      value={value}
      readOnly
    />
  ) : (
    <Autocomplete
      onLoad={onLoad}
      onPlaceChanged={onPlaceChanged}
      options={{ componentRestrictions: { country: "np" } }}
    >
      <input
        type="text"
        placeholder="Enter your address"
        value={inputValue}
        onChange={(e) => !selected && setInputValue(e.target.value)}
        readOnly={selected}
        className={`w-full border rounded px-3 py-2 ${
          selected ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
      />
    </Autocomplete>
  );
};

export default AddressInput;
