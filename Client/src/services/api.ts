import { API_BASE_URL } from '../config/api';

export interface Member {
  _id: string;
  memberId: string;
  fullname: string;
  email: string;
  phone: string;
  aadhaar: string;
  dob: string;
  address: string;
  state: string;
  district: string;
  pinCode: string;
  parliamentConstituency: string;
  assemblyConstituency: string;
  panchayat: string;
  membershipStatus: string;
  membershipType: string;
  photo?: string;
  idCard?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMemberPayload {
  fullname: string;
  email: string;
  phone: string;
  aadhaar: string;
  dob: string;
  address: string;
  state: string;
  district: string;
  pinCode: string;
  parliamentConstituency: string;
  assemblyConstituency: string;
  panchayat: string;
  membershipType: string;
  photo?: File;
}

interface SingleResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

interface ListResponse<T> {
  statusCode: number;
  data: {
    total: number;
    page: number;
    limit: number;
    data: T[];
  };
  message: string;
  success: boolean;
}

const handleResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'An error occurred');
    }
    return data;
  } else {
    const text = await response.text();
    const errorMatch = text.match(/<pre>Error: (.+?)<br>/);
    throw new Error(errorMatch ? errorMatch[1] : 'An error occurred');
  }
};

export const memberService = {
  getMembers: async (): Promise<ListResponse<Member>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/member`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching members:', error);
      throw error;
    }
  },

  createMember: async (data: FormData): Promise<SingleResponse<Member>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/member/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: data,
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error creating member:', error);
      throw error;
    }
  },

  updateMember: async (id: string, data: FormData): Promise<SingleResponse<Member>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/member/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: data,
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error updating member:', error);
      throw error;
    }
  },

  deleteMember: async (id: string): Promise<SingleResponse<null>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/member/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error deleting member:', error);
      throw error;
    }
  },

  checkMembership: async (email: string, phone: string): Promise<SingleResponse<Member>> => {
    const data = {
      email: email,
      phone: phone,
    };
  
    try {
      const url = new URL(`${API_BASE_URL}/member/check-memberships`);
  
      const response = await fetch(url.toString(), {
        method: 'POST', // Changed to POST
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json', // Ensure Content-Type is set for JSON body
        },
        body: JSON.stringify(data),
      });
  
      return handleResponse(response);
    } catch (error) {
      console.error('Error checking membership:', error);
      throw error;
    }
  },
  

  downloadIdCard: async (idCardUrl: string): Promise<void> => {
    try {
      // Get the full URL from the backend
      const fullUrl = idCardUrl.startsWith('http') ? idCardUrl : `${API_BASE_URL}${idCardUrl}`;
      
      const response = await fetch(fullUrl, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      if (!response.ok) {
        return handleResponse(response);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'id-card.png';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading ID card:', error);
      throw error;
    }
  },

  generateIdCard: async (memberId: string): Promise<SingleResponse<string>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/member/generate-id-card/${memberId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Accept': 'application/json',
        },
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error generating ID card:', error);
      throw error;
    }
  },
};