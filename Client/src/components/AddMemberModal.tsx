import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import LocationSelect from './LocationSelect';
import PhotoUpload from './PhotoUpload';
import useLocationData from '../hooks/useLocationData';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    fullname: '',
    phone: '',
    email: '',
    aadhaar: '',
    dob: '',
    address: '',
    pinCode: '',
    assemblyConstituency: '',
    panchayat: '',
    membershipType: 'general',
    photo: ''
  });

  const { 
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
  } = useLocationData();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataPayload = new FormData();
      
      // Add basic form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'photo') {
          formDataPayload.append(key, value.toString());
        }
      });

      // Add location fields using names instead of IDs
      if (selectedLocations.country) {
        formDataPayload.append('country', selectedLocations.country.label);
      }
      if (selectedLocations.state) {
        formDataPayload.append('state', selectedLocations.state.label);
      }
      if (selectedLocations.district) {
        formDataPayload.append('district', selectedLocations.district.label);
      }
      if (selectedLocations.constituency) {
        formDataPayload.append('parliamentConstituency', selectedLocations.constituency.label);
      }

      // Handle photo upload
      if (formData.photo) {
        const base64Response = await fetch(formData.photo);
        const blob = await base64Response.blob();
        formDataPayload.append('photo', blob, 'photo.jpg');
      }

      await onSubmit(formDataPayload);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to add member. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePhotoChange = (base64: string) => {
    setFormData(prev => ({
      ...prev,
      photo: base64
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-xl font-semibold">Add New Member</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>

              <PhotoUpload
                value={formData.photo}
                onChange={handlePhotoChange}
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  name="fullname"
                  required
                  value={formData.fullname}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  pattern="[0-9]{10}"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Aadhaar Number</label>
                <input
                  type="text"
                  name="aadhaar"
                  required
                  pattern="[0-9]{12}"
                  value={formData.aadhaar}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  required
                  value={formData.dob}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Location Information</h3>

              <LocationSelect
                label="Country"
                options={countries.map(c => ({ value: c._id, label: c.name }))}
                value={selectedLocations.country}
                onChange={handleCountryChange}
                isLoading={isLoading.countries}
                error={error.country}
              />

              <LocationSelect
                label="State"
                options={states.map(s => ({ value: s._id, label: s.name }))}
                value={selectedLocations.state}
                onChange={handleStateChange}
                isLoading={isLoading.states}
                isDisabled={!selectedLocations.country}
                error={error.state}
              />

              <LocationSelect
                label="District"
                options={districts.map(d => ({ value: d._id, label: d.name }))}
                value={selectedLocations.district}
                onChange={handleDistrictChange}
                isLoading={isLoading.districts}
                isDisabled={!selectedLocations.state}
                error={error.district}
              />

              <LocationSelect
                label="Parliament Constituency"
                options={constituencies.map(c => ({ value: c._id, label: c.name }))}
                value={selectedLocations.constituency}
                onChange={handleConstituencyChange}
                isLoading={isLoading.constituencies}
                isDisabled={!selectedLocations.district}
                error={error.constituency}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700">Assembly Constituency</label>
                <input
                  type="text"
                  name="assemblyConstituency"
                  required
                  value={formData.assemblyConstituency}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Panchayat</label>
                <input
                  type="text"
                  name="panchayat"
                  required
                  value={formData.panchayat}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">PIN Code</label>
                <input
                  type="text"
                  name="pinCode"
                  required
                  pattern="[0-9]{6}"
                  value={formData.pinCode}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Membership Type</label>
                <select
                  name="membershipType"
                  value={formData.membershipType}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="general">General</option>
                  <option value="active">Active</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;