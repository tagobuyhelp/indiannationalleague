import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronRight, ChevronLeft } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

interface Location {
  _id: string;
  name: string;
  countryId?: string;
  stateId?: string;
  districtId?: string;
}

const LocationManagement = () => {
  const [countries, setCountries] = useState<Location[]>([]);
  const [states, setStates] = useState<Location[]>([]);
  const [districts, setDistricts] = useState<Location[]>([]);
  const [constituencies, setConstituencies] = useState<Location[]>([]);

  const [selectedCountry, setSelectedCountry] = useState<Location | null>(null);
  const [selectedState, setSelectedState] = useState<Location | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<Location | null>(null);

  const [newName, setNewName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'country' | 'state' | 'district' | 'constituency'>('country');

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      fetchStates(selectedCountry._id);
    } else {
      setStates([]);
      setSelectedState(null);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedState) {
      fetchDistricts(selectedState._id);
    } else {
      setDistricts([]);
      setSelectedDistrict(null);
    }
  }, [selectedState]);

  useEffect(() => {
    if (selectedDistrict) {
      fetchConstituencies(selectedDistrict._id);
    } else {
      setConstituencies([]);
    }
  }, [selectedDistrict]);

  const fetchCountries = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/countries`);
      if (!response.ok) throw new Error('Failed to fetch countries');
      const data = await response.json();
      setCountries(data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load countries');
      console.error('Error fetching countries:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStates = async (countryId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/states/${countryId}`);
      if (!response.ok) throw new Error('Failed to fetch states');
      const data = await response.json();
      setStates(data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load states');
      console.error('Error fetching states:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDistricts = async (stateId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/districts/${stateId}`);
      if (!response.ok) throw new Error('Failed to fetch districts');
      const data = await response.json();
      setDistricts(data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load districts');
      console.error('Error fetching districts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConstituencies = async (districtId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/parliamentconstituencies/${districtId}`);
      if (!response.ok) throw new Error('Failed to fetch constituencies');
      const data = await response.json();
      setConstituencies(data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load constituencies');
      console.error('Error fetching constituencies:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async (type: 'country' | 'state' | 'district' | 'constituency') => {
    if (!newName.trim()) return;

    try {
      setIsLoading(true);
      setError(null);

      const payload: any = { name: newName.trim() };
      let endpoint = '';

      switch (type) {
        case 'country':
          endpoint = '/countries';
          break;
        case 'state':
          endpoint = '/states';
          payload.countryId = selectedCountry?._id;
          break;
        case 'district':
          endpoint = '/districts';
          payload.stateId = selectedState?._id;
          break;
        case 'constituency':
          endpoint = '/parliamentconstituencies';
          payload.districtId = selectedDistrict?._id;
          break;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to add ${type}`);
      }

      // Refresh the appropriate list
      switch (type) {
        case 'country':
          await fetchCountries();
          break;
        case 'state':
          await fetchStates(selectedCountry!._id);
          break;
        case 'district':
          await fetchDistricts(selectedState!._id);
          break;
        case 'constituency':
          await fetchConstituencies(selectedDistrict!._id);
          break;
      }

      setNewName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (type: 'country' | 'state' | 'district' | 'constituency', id: string) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      setIsLoading(true);
      setError(null);

      let endpoint = '';
      switch (type) {
        case 'country':
          endpoint = `/countries/${id}`;
          break;
        case 'state':
          endpoint = `/states/${id}`;
          break;
        case 'district':
          endpoint = `/districts/${id}`;
          break;
        case 'constituency':
          endpoint = `/parliamentconstituencies/${id}`;
          break;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete ${type}`);
      }

      // Refresh the appropriate list
      switch (type) {
        case 'country':
          await fetchCountries();
          if (selectedCountry?._id === id) setSelectedCountry(null);
          break;
        case 'state':
          await fetchStates(selectedCountry!._id);
          if (selectedState?._id === id) setSelectedState(null);
          break;
        case 'district':
          await fetchDistricts(selectedState!._id);
          if (selectedDistrict?._id === id) setSelectedDistrict(null);
          break;
        case 'constituency':
          await fetchConstituencies(selectedDistrict!._id);
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getActiveSectionTitle = () => {
    switch (activeSection) {
      case 'country':
        return 'Countries';
      case 'state':
        return 'States';
      case 'district':
        return 'Districts';
      case 'constituency':
        return 'Parliament Constituencies';
    }
  };

  const getActiveSectionItems = () => {
    switch (activeSection) {
      case 'country':
        return countries;
      case 'state':
        return states;
      case 'district':
        return districts;
      case 'constituency':
        return constituencies;
    }
  };

  const navigateBack = () => {
    switch (activeSection) {
      case 'state':
        setActiveSection('country');
        setSelectedState(null);
        setSelectedDistrict(null);
        break;
      case 'district':
        setActiveSection('state');
        setSelectedDistrict(null);
        break;
      case 'constituency':
        setActiveSection('district');
        break;
    }
  };

  const navigateForward = (item: Location) => {
    switch (activeSection) {
      case 'country':
        setSelectedCountry(item);
        setActiveSection('state');
        break;
      case 'state':
        setSelectedState(item);
        setActiveSection('district');
        break;
      case 'district':
        setSelectedDistrict(item);
        setActiveSection('constituency');
        break;
    }
  };

  const LocationList = ({ 
    title, 
    items, 
    onSelect, 
    selected, 
    onAdd, 
    onDelete,
    addDisabled = false,
    type
  }: {
    title: string;
    items: Location[];
    onSelect?: (item: Location) => void;
    selected?: Location | null;
    onAdd?: () => void;
    onDelete?: (id: string) => void;
    addDisabled?: boolean;
    type: 'country' | 'state' | 'district' | 'constituency';
  }) => (
    <div className="bg-white rounded-lg shadow-sm p-4 h-[calc(100vh-16rem)]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        {onAdd && (
          <button
            onClick={onAdd}
            disabled={addDisabled || isLoading}
            className="bg-blue-600 text-white px-3 py-1 rounded-lg flex items-center space-x-1 text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        )}
      </div>
      <div className="space-y-2 overflow-y-auto h-[calc(100%-4rem)]">
        {items.map(item => (
          <div
            key={item._id}
            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer ${
              selected?._id === item._id ? 'bg-blue-50' : 'hover:bg-gray-50'
            }`}
            onClick={() => onSelect?.(item)}
          >
            <div className="flex items-center space-x-2">
              {onSelect && <ChevronRight className="w-4 h-4 text-gray-400" />}
              <span>{item.name}</span>
            </div>
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item._id);
                }}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No {type}s found
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Location Management</h1>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Desktop View */}
      <div className="hidden md:flex space-x-4">
        <div className="w-72">
          <LocationList
            title="Countries"
            items={countries}
            onSelect={setSelectedCountry}
            selected={selectedCountry}
            onAdd={() => handleAdd('country')}
            onDelete={(id) => handleDelete('country', id)}
            type="country"
          />
        </div>

        <div className="w-72">
          <LocationList
            title="States"
            items={states}
            onSelect={setSelectedState}
            selected={selectedState}
            onAdd={() => handleAdd('state')}
            onDelete={(id) => handleDelete('state', id)}
            addDisabled={!selectedCountry}
            type="state"
          />
        </div>

        <div className="w-72">
          <LocationList
            title="Districts"
            items={districts}
            onSelect={setSelectedDistrict}
            selected={selectedDistrict}
            onAdd={() => handleAdd('district')}
            onDelete={(id) => handleDelete('district', id)}
            addDisabled={!selectedState}
            type="district"
          />
        </div>

        <div className="w-72">
          <LocationList
            title="Parliament Constituencies"
            items={constituencies}
            onAdd={() => handleAdd('constituency')}
            onDelete={(id) => handleDelete('constituency', id)}
            addDisabled={!selectedDistrict}
            type="constituency"
          />
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between p-4 border-b">
            {activeSection !== 'country' && (
              <button
                onClick={navigateBack}
                className="flex items-center text-gray-600"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back
              </button>
            )}
            <h2 className="text-lg font-semibold flex-1 text-center">
              {getActiveSectionTitle()}
            </h2>
            <button
              onClick={() => {
                if (activeSection === 'constituency' && selectedDistrict) handleAdd('constituency');
                else if (activeSection === 'district' && selectedState) handleAdd('district');
                else if (activeSection === 'state' && selectedCountry) handleAdd('state');
                else handleAdd('country');
              }}
              disabled={isLoading || (activeSection !== 'country' && !selectedCountry)}
              className="bg-blue-600 text-white px-3 py-1 rounded-lg flex items-center space-x-1 text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>

          <div className="divide-y">
            {getActiveSectionItems().map(item => (
              <div
                key={item._id}
                className="flex items-center justify-between p-4 hover:bg-gray-50"
                onClick={() => activeSection !== 'constituency' && navigateForward(item)}
              >
                <div className="flex items-center space-x-2">
                  <span>{item.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {activeSection !== 'constituency' && (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(activeSection, item._id);
                    }}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {getActiveSectionItems().length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No {activeSection}s found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add New Location Form */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:p-6">
        <div className="max-w-7xl mx-auto flex items-center space-x-4">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Enter location name..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => {
              if (selectedDistrict) handleAdd('constituency');
              else if (selectedState) handleAdd('district');
              else if (selectedCountry) handleAdd('state');
              else handleAdd('country');
            }}
            disabled={isLoading || !newName.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
          >
            {isLoading ? 'Adding...' : 'Add Location'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationManagement;