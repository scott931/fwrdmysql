// API Service for Database Operations
// This service handles all HTTP requests to your backend server

import { API_BASE_URL } from './mysql';
import { Course, Category, Instructor, User, UserProgress, Certificate, Achievement } from '../types';

// Generic API request function with authentication
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  // Check if we're on the client side before accessing localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('forward_africa_token') : null;

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);

    if (response.status === 401) {
      // Clear auth data and redirect to login (only on client side)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('forward_africa_token');
        localStorage.removeItem('forward_africa_user');
        window.location.href = '/login';
      }
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// User API
export const userAPI = {
  // Get all users
  getUsers: () => apiRequest('/users'),

  // Get user by ID
  getUser: (userId: string) => apiRequest(`/users/${userId}`),

  // Get user by email
  getUserByEmail: (email: string) => apiRequest(`/users/email/${email}`),

  // Create new user
  createUser: (userData: Partial<User>) =>
    apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  // Update user
  updateUser: (userId: string, userData: Partial<User>) =>
    apiRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),

  // Delete user
  deleteUser: (userId: string) =>
    apiRequest(`/users/${userId}`, {
      method: 'DELETE',
    }),
};

// Course API
export const courseAPI = {
  // Get all courses
  getAllCourses: () => apiRequest('/courses'),

  // Get course by ID
  getCourse: (courseId: string) => apiRequest(`/courses/${courseId}`),

  // Get featured courses
  getFeaturedCourses: () => apiRequest('/courses/featured'),

  // Get courses by category
  getCoursesByCategory: (categoryId: string) =>
    apiRequest(`/courses/category/${categoryId}`),

  // Create new course
  createCourse: (courseData: Partial<Course>) =>
    apiRequest('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    }),

  // Update course
  updateCourse: (courseId: string, courseData: Partial<Course>) =>
    apiRequest(`/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    }),

  // Delete course
  deleteCourse: (courseId: string) =>
    apiRequest(`/courses/${courseId}`, {
      method: 'DELETE',
    }),
};

// Category API
export const categoryAPI = {
  // Get all categories
  getAllCategories: () => apiRequest('/categories'),

  // Get category by ID
  getCategory: (categoryId: string) => apiRequest(`/categories/${categoryId}`),

  // Create new category
  createCategory: (categoryData: Partial<Category>) =>
    apiRequest('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    }),

  // Update category
  updateCategory: (categoryId: string, categoryData: Partial<Category>) =>
    apiRequest(`/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    }),

  // Delete category
  deleteCategory: (categoryId: string) =>
    apiRequest(`/categories/${categoryId}`, {
      method: 'DELETE',
    }),
};

// Instructor API
export const instructorAPI = {
  // Get all instructors
  getAllInstructors: () => apiRequest('/instructors'),

  // Get instructor by ID
  getInstructor: (instructorId: string) => apiRequest(`/instructors/${instructorId}`),

  // Create new instructor
  createInstructor: (instructorData: Partial<Instructor>) =>
    apiRequest('/instructors', {
      method: 'POST',
      body: JSON.stringify(instructorData),
    }),

  // Update instructor
  updateInstructor: (instructorId: string, instructorData: Partial<Instructor>) =>
    apiRequest(`/instructors/${instructorId}`, {
      method: 'PUT',
      body: JSON.stringify(instructorData),
    }),

  // Delete instructor
  deleteInstructor: (instructorId: string) =>
    apiRequest(`/instructors/${instructorId}`, {
      method: 'DELETE',
    }),
};

// User Progress API
export const progressAPI = {
  // Get user progress for a course
  getUserProgress: (userId: string, courseId: string) =>
    apiRequest(`/progress/${userId}/${courseId}`),

  // Get all user progress
  getAllUserProgress: (userId: string) => apiRequest(`/progress/${userId}`),

  // Update user progress
  updateProgress: (userId: string, courseId: string, progressData: Partial<UserProgress>) =>
    apiRequest(`/progress/${userId}/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(progressData),
    }),

  // Create user progress
  createProgress: (progressData: Partial<UserProgress>) =>
    apiRequest('/progress', {
      method: 'POST',
      body: JSON.stringify(progressData),
    }),
};

// Certificate API
export const certificateAPI = {
  // Get user certificates
  getUserCertificates: (userId: string) => apiRequest(`/certificates/${userId}`),

  // Get certificate by ID
  getCertificate: (certificateId: string) => apiRequest(`/certificates/id/${certificateId}`),

  // Verify certificate
  verifyCertificate: (verificationCode: string) =>
    apiRequest(`/certificates/verify/${verificationCode}`),

  // Create certificate
  createCertificate: (certificateData: Partial<Certificate>) =>
    apiRequest('/certificates', {
      method: 'POST',
      body: JSON.stringify(certificateData),
    }),
};

// Achievement API
export const achievementAPI = {
  // Get user achievements
  getUserAchievements: (userId: string) => apiRequest(`/achievements/${userId}`),

  // Create achievement
  createAchievement: (achievementData: Partial<Achievement>) =>
    apiRequest('/achievements', {
      method: 'POST',
      body: JSON.stringify(achievementData),
    }),

  // Update achievement progress
  updateAchievementProgress: (achievementId: string, progress: number) =>
    apiRequest(`/achievements/${achievementId}/progress`, {
      method: 'PUT',
      body: JSON.stringify({ progress }),
    }),
};

// Analytics API
export const analyticsAPI = {
  // Get platform statistics
  getPlatformStats: () => apiRequest('/analytics/platform'),

  // Get detailed analytics
  getDetailedAnalytics: () => apiRequest('/analytics/detailed'),

  // Get user statistics
  getUserStats: (userId: string) => apiRequest(`/analytics/user/${userId}`),

  // Get course statistics
  getCourseStats: (courseId: string) => apiRequest(`/analytics/course/${courseId}`),
};

// Audit Logs API
export const auditLogsAPI = {
  // Get all audit logs with optional filtering
  getAuditLogs: (filters?: {
    action?: string;
    resource_type?: string;
    user_id?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    return apiRequest(`/audit-logs?${params.toString()}`);
  },

  // Create audit log
  createAuditLog: (auditData: {
    action: string;
    resource_type: string;
    resource_id?: string;
    details?: any;
  }) =>
    apiRequest('/audit-logs', {
      method: 'POST',
      body: JSON.stringify(auditData),
    }),
};

// Export all APIs
export const api = {
  user: userAPI,
  course: courseAPI,
  category: categoryAPI,
  instructor: instructorAPI,
  progress: progressAPI,
  certificate: certificateAPI,
  achievement: achievementAPI,
  analytics: analyticsAPI,
  auditLogs: auditLogsAPI,
};