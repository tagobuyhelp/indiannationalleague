import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

interface Location {
  _id: string;
  name: string;
  country?: string;
  state?: string;
  district?: string;
}

interface LocationOption {
  value: string;
  label: string;
}

interface SelectedLocations {
  country: LocationOption | null;
  state: LocationOption | null;
  district: LocationOption | null;
  constituency: LocationOption | null;
}

interface LoadingState {
  countries: boolean;
  states: boolean;
  districts: boolean;
  constituencies: boolean;
}

interface ErrorState {
  country: string | null;
  state: string | null;
  district: string | null;
  constituency: string | null;
}

const useLocationData = () => {
  const [selectedLocations, setSelectedLocations] = useState<SelectedLocations>({
    country: null,
    state: null,
    district: null,
    constituency: null
  });

  const [countries, setCountries] = useState<Location[]>([]);
  const [states, setStates] = useState<Location[]>([]);
  const [districts, setDistricts] = useState<Location[]>([]);
  const [constituencies, setConstituencies] = useState<Location[]>([]);

  const [isLoading, setIsLoading] = useState<LoadingState>({
    countries: false,
    states: false,
    districts: false,
    constituencies: false
  });

  const [error, setError] = useState<ErrorState>({
    country: null,
    state: null,
    district: null,
    constituency: null
  });

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      setIsLoading(prev => ({ ...prev, countries: true }));
      const response = await fetch(`${API_BASE_URL}/countries`);
      if (!response.ok) throw new Error('Failed to fetch countries');
      const data = await response.json();
      setCountries(data.data || []);
      setError(prev => ({ ...prev, country: null }));
    } catch (err) {
      setError(prev => ({ ...prev, country: 'Failed to load countries' }));
      console.error('Error fetching countries:', err);
    } finally {
      setIsLoading(prev => ({ ...prev, countries: false }));
    }
  };

  const fetchStates = async (countryId: string) => {
    try {
      setIsLoading(prev => ({ ...prev, states: true }));
      const response = await fetch(`${API_BASE_URL}/states/${countryId}`);
      if (!response.ok) throw new Error('Failed to fetch states');
      const data = await response.json();
      setStates(data.data || []);
      setError(prev => ({ ...prev, state: null }));
    } catch (err) {
      setError(prev => ({ ...prev, state: 'Failed to load states' }));
      console.error('Error fetching states:', err);
    } finally {
      setIsLoading(prev => ({ ...prev, states: false }));
    }
  };

  const fetchDistricts = async (stateId: string) => {
    try {
      setIsLoading(prev => ({ ...prev, districts: true }));
      const response = await fetch(`${API_BASE_URL}/districts/${stateId}`);
      if (!response.ok) throw new Error('Failed to fetch districts');
      const data = await response.json();
      setDistricts(data.data || []);
      setError(prev => ({ ...prev, district: null }));
    } catch (err) {
      setError(prev => ({ ...prev, district: 'Failed to load districts' }));
      console.error('Error fetching districts:', err);
    } finally {
      setIsLoading(prev => ({ ...prev, districts: false }));
    }
  };

  const fetchConstituencies = async (districtId: string) => {
    try {
      setIsLoading(prev => ({ ...prev, constituencies: true }));
      const response = await fetch(`${API_BASE_URL}/parliamentconstituencies/${districtId}`);
      if (!response.ok) throw new Error('Failed to fetch constituencies');
      const data = await response.json();
      setConstituencies(data.data || []);
      setError(prev => ({ ...prev, constituency: null }));
    } catch (err) {
      setError(prev => ({ ...prev, constituency: 'Failed to load constituencies' }));
      console.error('Error fetching constituencies:', err);
    } finally {
      setIsLoading(prev => ({ ...prev, constituencies: false }));
    }
  };

  const handleCountryChange = (option: LocationOption | null) => {
    setSelectedLocations({
      country: option,
      state: null,
      district: null,
      constituency: null
    });
    
    setStates([]);
    setDistricts([]);
    setConstituencies([]);

    if (option) {
      fetchStates(option.value);
    }
  };

  const handleStateChange = (option: LocationOption | null) => {
    setSelectedLocations(prev => ({
      ...prev,
      state: option,
      district: null,
      constituency: null
    }));

    setDistricts([]);
    setConstituencies([]);

    if (option) {
      fetchDistricts(option.value);
    }
  };

  const handleDistrictChange = (option: LocationOption | null) => {
    setSelectedLocations(prev => ({
      ...prev,
      district: option,
      constituency: null
    }));

    setConstituencies([]);

    if (option) {
      fetchConstituencies(option.value);
    }
  };

  const handleConstituencyChange = (option: LocationOption | null) => {
    setSelectedLocations(prev => ({
      ...prev,
      constituency: option
    }));
  };

  return {
    selectedLocations,
    setSelectedLocations,
    isLoading,
    error,
    countries,
    states,
    districts,
    constituencies,
    handleCountryChange,
    handleStateChange,
    handleDistrictChange,
    handleConstituencyChange
  };
};

export default useLocationData;