import React from "react";
import { UseFormRegister, FieldError } from "react-hook-form";
import { ProfileFormValues } from "@/services/profileService";

interface InputFieldProps {
  label: string;
  name: keyof ProfileFormValues;
  register: UseFormRegister<ProfileFormValues>;
  required?: boolean;
  pattern?: { value: RegExp; message: string };
  error?: FieldError | null;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  register,
  required,
  pattern,
  error,
}) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium mb-1">
      {label}
    </label>
    <input
      id={name}
      type="text"
      {...register(name, { required, pattern })}
      className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
        error ? "border-red-500 focus:ring-red-500" : "focus:ring-green-500"
      }`}
    />
    {error && (
      <p className="text-red-500 text-sm mt-1">
        {error.message || "This field is required"}
      </p>
    )}
  </div>
);

export default InputField;
