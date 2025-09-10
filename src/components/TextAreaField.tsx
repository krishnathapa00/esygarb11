import React from "react";
import { UseFormRegister } from "react-hook-form";
import { ProfileFormValues } from "@/services/profileService";

interface TextAreaFieldProps {
  label: string;
  name: keyof ProfileFormValues;
  register: UseFormRegister<ProfileFormValues>;
  error?: any;
  rows?: number;
  required?: boolean;
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  name,
  register,
  required,
  error,
  rows = 3,
}) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium mb-1">
      {label}
    </label>
    <textarea
      id={name}
      rows={rows}
      {...register(name, { required })}
      className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
        error ? "border-red-500 focus:ring-red-500" : "focus:ring-green-500"
      }`}
    />
    {error && (
      <p className="text-red-500 text-sm mt-1">This field is required</p>
    )}
  </div>
);

export default TextAreaField;
