import React, { useState, useEffect } from "react";

import provincesData from "@/data/nepal/provinces.json";
import districtsData from "@/data/nepal/districts.json";
import localLevelsData from "@/data/nepal/local_levels.json";

interface AddressInputProps {
  value: string;
  setValue: (value: string) => void;
  onValidChange?: (isValid: boolean) => void;
}

const AddressInput: React.FC<AddressInputProps> = ({
  value,
  setValue,
  onValidChange,
}) => {
  const provinces = provincesData;
  const districts = districtsData;
  const localLevels = localLevelsData;

  const [provinceId, setProvinceId] = useState<number | null>(null);
  const [districtId, setDistrictId] = useState<number | null>(null);
  const [localId, setLocalId] = useState<number | null>(null);
  const [locality, setLocality] = useState<string>("");

  useEffect(() => {
    if (!provinceId || !districtId || !localId) {
      setValue("");
      onValidChange?.(false);
      return;
    }

    const localName = localLevels.find(
      (l) => l.municipality_id === localId
    )?.name;
    const formatted = `${locality ? locality + ", " : ""}${localName}`;
    setValue(formatted);
    onValidChange?.(true);
  }, [provinceId, districtId, localId, locality, setValue, onValidChange]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Province */}
        <div>
          <label className="font-medium text-sm">Province</label>
          <select
            className="w-full p-2 border rounded"
            value={provinceId ?? ""}
            onChange={(e) => {
              const id = Number(e.target.value);
              setProvinceId(id);
              setDistrictId(null);
              setLocalId(null);
              setLocality("");
              setValue("");
            }}
          >
            <option value="">Select Province</option>
            {provinces.map((p) => (
              <option key={p.province_id} value={p.province_id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* District */}
        <div>
          <label className="font-medium text-sm">District</label>
          <select
            className="w-full p-2 border rounded"
            disabled={!provinceId}
            value={districtId ?? ""}
            onChange={(e) => {
              const id = Number(e.target.value);
              setDistrictId(id);
              setLocalId(null);
              setLocality("");
              setValue("");
            }}
          >
            <option value="">Select District</option>
            {districts
              .filter((d) => d.province_id === provinceId)
              .map((d) => (
                <option key={d.district_id} value={d.district_id}>
                  {d.name}
                </option>
              ))}
          </select>
          {!provinceId && (
            <p className="text-xs text-red-500">Select province first</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Local Body */}
        <div>
          <label className="font-medium text-sm">Local Government</label>
          <select
            className="w-full p-2 border rounded"
            disabled={!districtId}
            value={localId ?? ""}
            onChange={(e) => setLocalId(Number(e.target.value))}
          >
            <option value="">Select Municipality / Rural Municipality</option>
            {localLevels
              .filter((l) => l.district_id === districtId)
              .map((l) => (
                <option key={l.municipality_id} value={l.municipality_id}>
                  {l.name}
                </option>
              ))}
          </select>
          {!districtId && (
            <p className="text-xs text-red-500">Select district first</p>
          )}
        </div>

        <div>
          <label className="font-medium text-sm">Locality</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={locality}
            onChange={(e) => setLocality(e.target.value)}
            placeholder="e.g., Kalimati, New Baneshwor"
            disabled={!localId}
          />
          {!localId && (
            <p className="text-xs text-red-500">Select local body first</p>
          )}
        </div>
      </div>

      {value && (
        <p className="text-sm text-gray-600 italic mt-2">Selected: {value}</p>
      )}
    </div>
  );
};

export default AddressInput;
