import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PhoneNumberInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Remove all non-digits
    const digitsOnly = inputValue.replace(/\D/g, '');
    
    // Limit to 10 digits (after +977)
    const limitedDigits = digitsOnly.slice(0, 10);
    
    onChange(limitedDigits);
  };

  const formatDisplayValue = (digits: string) => {
    if (!digits) return '';
    
    // Format as: 98XXXXXXXX
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
    if (digits.length <= 8) return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
    return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
        Phone Number
      </Label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
          <span className="text-gray-500 font-medium">+977</span>
          <div className="w-px h-6 bg-gray-300 mx-3" />
        </div>
        <Input
          type="tel"
          id="phone"
          placeholder="98 XXX XXX XX"
          value={formatDisplayValue(value)}
          onChange={handleChange}
          disabled={disabled}
          className="pl-20 h-12 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
          maxLength={13} // Formatted length: "98 XXX XXX XX"
        />
      </div>
      <p className="text-xs text-gray-500">
        Enter your 10-digit mobile number
      </p>
    </div>
  );
};

export default PhoneNumberInput;
