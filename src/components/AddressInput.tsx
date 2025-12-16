import React from "react";

interface AddressInputProps {
  value: string;
  setValue: (value: string) => void;
}

const AddressInput: React.FC<AddressInputProps> = ({ value, setValue }) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Enter your address"
      className="w-full border rounded px-3 py-2 bg-white"
    />
  );
};

export default AddressInput;
