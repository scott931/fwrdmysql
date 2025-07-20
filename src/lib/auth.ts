// Authentication Service
// Handles login, registration, and token management

import { API_BASE_URL } from './mysql';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'content_manager' | 'admin' | 'super_admin';
  avatar_url?: string;
  onboarding_completed: boolean;
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
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // Get stored token
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Get stored user data
  getUser: (): AuthUser | null => {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  // Clear auth data
  clearAuthData: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
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
    return user?.role === 'admin' || user?.role === 'super_admin';
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

    const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    const updatedUser: AuthUser = await response.json();
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