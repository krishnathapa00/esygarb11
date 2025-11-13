import { useLoadScript, Autocomplete } from "@react-google-maps/api";
import { useState, useRef } from "react";

interface AddressInputProps {
  value: string;
  setValue: (val: string) => void;
}

const AddressInput: React.FC<AddressInputProps> = ({ value, setValue }) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyADxM5y7WrXu3BRJ_hJQZhh6FLXWyO3E1g",
    libraries: ["places"],
  });

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [selected, setSelected] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.formatted_address) {
        setInputValue(place.formatted_address);
        setValue(place.formatted_address);
        setSelected(true); // lock input
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // prevent manual editing after selection
    if (!selected) {
      setInputValue(e.target.value);
    }
  };

  if (!isLoaded)
    return <input placeholder="Loading..." value={value} readOnly />;

  return (
    <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
      <input
        type="text"
        placeholder="Select your address"
        value={inputValue}
        onChange={handleInputChange}
        readOnly={selected}
        className={`w-full border rounded px-3 py-2 ${
          selected ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
      />
    </Autocomplete>
  );
};

export default AddressInput;
