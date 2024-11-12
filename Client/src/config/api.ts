// API configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4055';

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/login',
  LOGOUT: '/logout',
  REGISTER: '/user/register',
  CHANGE_PASSWORD: '/change-password',

  // Members
  MEMBERS: '/member',
  MEMBER_ID_CARD: '/member/generate-id',
  MEMBER_BULK_ID_CARDS: '/member/generate-all-ids',

  // Notices
  NOTICES: '/notices',

  // Users
  USERS: '/users'
} as const;