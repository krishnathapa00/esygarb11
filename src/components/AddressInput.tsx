import React from "react";

interface AddressInputProps {
  value: string;
}

const AddressInput: React.FC<AddressInputProps> = ({ value }) => {
  return (
    <input
      type="text"
      value={value}
      readOnly
      placeholder="Click 'Detect Location' to fill your address"
      className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
    />
  );
};

export default AddressInput;
