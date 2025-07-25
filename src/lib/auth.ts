// Authentication Service
// Handles login, registration, and token management

import { API_BASE_URL } from './mysql';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'content_manager' | 'community_manager' | 'user_support' | 'super_admin';
  permissions: string[];
  avatar_url?: string;
  onboarding_completed: boolean;
  industry?: string;
  experience_level?: string;
  business_stage?: string;
  country?: string;
  state_province?: string;
  city?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  education_level?: string;
  job_title?: string;
  topics_of_interest?: string[];
  industry?: string;
  experience_level?: string;
  business_stage?: string;
  country?: string;
  state_province?: string;
  city?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
  message: string;
}

// Token management
const TOKEN_KEY = 'forward_africa_token';
const USER_KEY = 'forward_africa_user';

export const authService = {
  // Store token and user data
  setAuthData: (token: string, user: AuthUser) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  // Get stored token
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  // Get stored user data
  getUser: (): AuthUser | null => {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  // Clear auth data
  clearAuthData: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!authService.getToken();
  },

  // Check if user has specific role
  hasRole: (role: string): boolean => {
    const user = authService.getUser();
    return user?.role === role;
  },

  // Check if user has admin privileges
  isAdmin: (): boolean => {
    const user = authService.getUser();
    return user?.role === 'super_admin';
  },

  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

        const data: AuthResponse = await response.json();
    authService.setAuthData(data.token, data.user);

    return data;
  },

  // Register user
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const data: AuthResponse = await response.json();
    authService.setAuthData(data.token, data.user);
    return data;
  },

  // Logout user
  logout: () => {
    authService.clearAuthData();
  },

  // Get current user profile
  getProfile: async (): Promise<AuthUser> => {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token');
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    const user: AuthUser = await response.json();
    // Update stored user data
    authService.setAuthData(token, user);
    return user;
  },

  // Update user profile
  updateProfile: async (updates: Partial<AuthUser>): Promise<AuthUser> => {
    const token = authService.getToken();
    const user = authService.getUser();

    if (!token || !user) {
      throw new Error('No authentication token');
    }

    console.log('Updating profile for user:', user.id);
    console.log('Update data:', updates);
    console.log('API URL:', `${API_BASE_URL}/users/${user.id}`);

    const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      try {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to update profile`);
      } catch (parseError) {
        console.error('Failed to parse error response:', parseError);
        throw new Error(`HTTP ${response.status}: Failed to update profile`);
      }
    }

    const updatedUser: AuthUser = await response.json();
    console.log('Updated user data:', updatedUser);
    authService.setAuthData(token, updatedUser);
    return updatedUser;
  },
};

// API request helper with authentication
export const authenticatedRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = authService.getToken();

  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    authService.logout();
    throw new Error('Session expired. Please login again.');
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
};