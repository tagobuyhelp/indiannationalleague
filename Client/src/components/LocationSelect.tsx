import React from 'react';
import Select from 'react-select';

interface Option {
  value: string;
  label: string;
}

interface LocationSelectProps {
  label: string;
  options: Option[];
  value: Option | null;
  onChange: (option: Option | null) => void;
  isLoading?: boolean;
  isDisabled?: boolean;
  error?: string;
}

const LocationSelect: React.FC<LocationSelectProps> = ({
  label,
  options,
  value,
  onChange,
  isLoading = false,
  isDisabled = false,
  error
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <Select
        value={value}
        onChange={onChange}
        options={options}
        isLoading={isLoading}
        isDisabled={isDisabled}
        className={error ? 'border-red-300' : ''}
        classNamePrefix="select"
        placeholder={`Select ${label}`}
        isClearable
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default LocationSelect;