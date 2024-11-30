import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import Select from 'react-select';
import useLocationData from '../hooks/useLocationData';

interface SearchFilterProps {
  onSearch: (value: string) => void;
  onFilterStatus: (status: string) => void;
  onFilterType: (type: string) => void;
  onFilterLocation?: (location: {
    country?: string;
    state?: string;
    district?: string;
    parliamentConstituency?: string;
  }) => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({ 
  onSearch, 
  onFilterStatus, 
  onFilterType,
  onFilterLocation 
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const { 
    selectedLocations,
    countries,
    states,
    districts,
    constituencies,
    handleCountryChange,
    handleStateChange,
    handleDistrictChange,
    handleConstituencyChange,
    isLoading,
    error
  } = useLocationData();

  useEffect(() => {
    if (onFilterLocation) {
      const locationFilter: any = {};
      
      if (selectedLocations.constituency) {
        locationFilter.parliamentConstituency = selectedLocations.constituency.label;
      } else if (selectedLocations.district) {
        locationFilter.district = selectedLocations.district.label;
      } else if (selectedLocations.state) {
        locationFilter.state = selectedLocations.state.label;
      } else if (selectedLocations.country) {
        locationFilter.country = selectedLocations.country.label;
      }

      onFilterLocation(locationFilter);
    }
  }, [selectedLocations, onFilterLocation]);

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex flex-col space-y-4">
        {/* Basic Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search members..."
              onChange={(e) => onSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full md:w-64"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select 
              onChange={(e) => onFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
              <option value="pending">Pending</option>
            </select>
            <select 
              onChange={(e) => onFilterType(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="">All Types</option>
              <option value="general">General</option>
              <option value="active">Active</option>
              <option value="lifetime">Lifetime</option>
            </select>
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {showAdvancedFilters ? 'Hide Filters' : 'Advanced Filters'}
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <Select
                value={selectedLocations.country}
                onChange={handleCountryChange}
                options={countries.map(c => ({ value: c._id, label: c.name }))}
                isLoading={isLoading.countries}
                isClearable
                placeholder="Select Country"
                className={error.country ? 'border-red-300' : ''}
              />
              {error.country && (
                <p className="mt-1 text-sm text-red-600">{error.country}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <Select
                value={selectedLocations.state}
                onChange={handleStateChange}
                options={states.map(s => ({ value: s._id, label: s.name }))}
                isLoading={isLoading.states}
                isDisabled={!selectedLocations.country}
                isClearable
                placeholder="Select State"
                className={error.state ? 'border-red-300' : ''}
              />
              {error.state && (
                <p className="mt-1 text-sm text-red-600">{error.state}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
              <Select
                value={selectedLocations.district}
                onChange={handleDistrictChange}
                options={districts.map(d => ({ value: d._id, label: d.name }))}
                isLoading={isLoading.districts}
                isDisabled={!selectedLocations.state}
                isClearable
                placeholder="Select District"
                className={error.district ? 'border-red-300' : ''}
              />
              {error.district && (
                <p className="mt-1 text-sm text-red-600">{error.district}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parliament Constituency</label>
              <Select
                value={selectedLocations.constituency}
                onChange={handleConstituencyChange}
                options={constituencies.map(c => ({ value: c._id, label: c.name }))}
                isLoading={isLoading.constituencies}
                isDisabled={!selectedLocations.district}
                isClearable
                placeholder="Select Constituency"
                className={error.constituency ? 'border-red-300' : ''}
              />
              {error.constituency && (
                <p className="mt-1 text-sm text-red-600">{error.constituency}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFilter;