import {
  useLoadScript,
  Autocomplete as GoogleAutocomplete,
} from "@react-google-maps/api";
import { useRef } from "react";

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

  const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (!autocompleteRef.current) return;
    const place = autocompleteRef.current.getPlace();
    if (place.formatted_address) {
      setValue(place.formatted_address);
    }
  };

  if (!isLoaded)
    return <input placeholder="Loading..." value={value} readOnly />;

  return (
    <GoogleAutocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
      <input
        type="text"
        placeholder="Enter your address"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full border rounded px-3 py-2"
      />
    </GoogleAutocomplete>
  );
};

export default AddressInput;
