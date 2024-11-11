import React, { useEffect, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

interface FilterOptions {
  states: string[];
  districts: string[];
  parliamentConstituencies: string[];
  assemblyConstituencies: string[];
  panchayats: string[];
}

interface SearchFilterProps {
  onSearch: (value: string) => void;
  onFilterStatus: (status: string) => void;
  onFilterType: (type: string) => void;
  onFilterLocation: (field: string, value: string) => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({ 
  onSearch, 
  onFilterStatus, 
  onFilterType,
  onFilterLocation 
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = React.useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    states: [],
    districts: [],
    parliamentConstituencies: [],
    assemblyConstituencies: [],
    panchayats: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/member/filter-options`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch filter options');
      }

      const data = await response.json();
      setFilterOptions({
        states: data.states || [],
        districts: data.districts || [],
        parliamentConstituencies: data.parliamentConstituencies || [],
        assemblyConstituencies: data.assemblyConstituencies || [],
        panchayats: data.panchayats || []
      });
    } catch (error) {
      console.error('Error fetching filter options:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
            </select>
            <select 
              onChange={(e) => onFilterType(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="">All Types</option>
              <option value="general">General</option>
              <option value="active">Active</option>
            </select>
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Advanced Filters
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <select
              onChange={(e) => onFilterLocation('state', e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2"
              disabled={isLoading}
            >
              <option value="">All States</option>
              {filterOptions.states.map((state) => (
                <option key={state} value={state.toLowerCase()}>{state}</option>
              ))}
            </select>

            <select
              onChange={(e) => onFilterLocation('district', e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2"
              disabled={isLoading}
            >
              <option value="">All Districts</option>
              {filterOptions.districts.map((district) => (
                <option key={district} value={district.toLowerCase()}>{district}</option>
              ))}
            </select>

            <select
              onChange={(e) => onFilterLocation('parliamentConstituency', e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2"
              disabled={isLoading}
            >
              <option value="">All Parliament Constituencies</option>
              {filterOptions.parliamentConstituencies.map((constituency) => (
                <option key={constituency} value={constituency.toLowerCase()}>{constituency}</option>
              ))}
            </select>

            <select
              onChange={(e) => onFilterLocation('assemblyConstituency', e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2"
              disabled={isLoading}
            >
              <option value="">All Assembly Constituencies</option>
              {filterOptions.assemblyConstituencies.map((constituency) => (
                <option key={constituency} value={constituency.toLowerCase()}>{constituency}</option>
              ))}
            </select>

            <select
              onChange={(e) => onFilterLocation('panchayat', e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2"
              disabled={isLoading}
            >
              <option value="">All Panchayats</option>
              {filterOptions.panchayats.map((panchayat) => (
                <option key={panchayat} value={panchayat.toLowerCase()}>{panchayat}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFilter;