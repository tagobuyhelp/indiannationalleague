import { API_BASE_URL } from '../config/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

interface PaginatedResponse<T> {
  statusCode: number;
  data: string;
  message: {
    total: number;
    page: number;
    limit: number;
    data: T[];
  };
  success: boolean;
}

interface SingleResponse<T> {
  statusCode: number;
  data: string;
  message: T;
  success: boolean;
}

export interface Member {
  _id: string;
  memberId: string;
  fullname: string;
  phone: string;
  aadhaar: string;
  email: string;
  dob: string;
  address: string;
  state: string;
  pinCode: string;
  district: string;
  parliamentConstituency: string;
  assemblyConstituency: string;
  panchayat: string;
  membershipStatus: string;
  membershipType: string;
  photo: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMemberPayload {
  aadhaar: string;
  phone: string;
  email: string;
  fullname: string;
  dob: string;
  address: string;
  state: string;
  pinCode: string;
  district: string;
  parliamentConstituency: string;
  assemblyConstituency: string;
  panchayat: string;
  membershipType: string;
  photo?: string;
}

export const memberService = {
  getMembers: async (page = 1, limit = 10): Promise<PaginatedResponse<Member>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/member?page=${page}&limit=${limit}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch members');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching members:', error);
      throw error;
    }
  },

  getMemberById: async (id: string): Promise<SingleResponse<Member>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/member/${id}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch member');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching member:', error);
      throw error;
    }
  },

  createMember: async (data: CreateMemberPayload): Promise<SingleResponse<Member>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/member/register`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create member');
      }
      return response.json();
    } catch (error) {
      console.error('Error creating member:', error);
      throw error;
    }
  },

  updateMember: async (id: string, data: Partial<CreateMemberPayload>): Promise<SingleResponse<Member>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/member/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ updates: data }), // Wrap the data in updates object
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update member');
      }
      return response.json();
    } catch (error) {
      console.error('Error updating member:', error);
      throw error;
    }
  },

  deleteMember: async (id: string): Promise<SingleResponse<null>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/member/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to delete member');
      }
      return response.json();
    } catch (error) {
      console.error('Error deleting member:', error);
      throw error;
    }
  },
};