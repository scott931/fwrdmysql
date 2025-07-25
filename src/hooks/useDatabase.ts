// Custom hook for database operations
// This hook provides easy access to database operations throughout the app

import { useState, useEffect, useCallback } from 'react';
import { courseAPI, categoryAPI, instructorAPI, progressAPI, certificateAPI, achievementAPI, analyticsAPI, userAPI, auditLogsAPI } from '../lib/api';
import { Course, Category, Instructor, UserProgress, Certificate, Achievement } from '../types';

// Custom hook for courses
export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllCourses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await courseAPI.getAllCourses();

      // Transform backend data to frontend format
      const transformedCourses = data.map((course: any) => ({
        id: course.id,
        title: course.title,
        instructor: {
          id: course.instructor_id || 'unknown',
          name: course.instructor_name || 'Unknown Instructor',
          title: course.instructor_title || 'Instructor',
          image: course.instructor_image || '/placeholder-avatar.jpg',
          bio: course.instructor_bio || 'Experienced instructor',
          email: course.instructor_email || 'instructor@forwardafrica.com',
          expertise: course.instructor_expertise ? JSON.parse(course.instructor_expertise) : ['Education'],
          experience: course.instructor_experience || 5,
          createdAt: new Date(course.instructor_created_at || Date.now())
        },
        instructorId: course.instructor_id,
        category: course.category_name || course.category || 'General',
        thumbnail: course.thumbnail || '/placeholder-course.jpg',
        banner: course.banner || '/placeholder-course.jpg',
        videoUrl: course.video_url,
        description: course.description || 'Course description coming soon.',
        lessons: course.lessons || [],
        featured: course.featured || false,
        totalXP: course.total_xp || 1000,
        comingSoon: course.coming_soon || false,
        releaseDate: course.release_date
      }));

      setCourses(transformedCourses);
    } catch (err) {
      console.error('Failed to fetch courses from API:', err);
      setError('Failed to load courses from server');
      setCourses([]); // Set empty array instead of mock data
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFeaturedCourses = useCallback(async () => {
    try {
      const data = await courseAPI.getFeaturedCourses();

      // Transform backend data to frontend format
      const transformedCourses = data.map((course: any) => ({
        id: course.id,
        title: course.title,
        instructor: {
          id: course.instructor_id || 'unknown',
          name: course.instructor_name || 'Unknown Instructor',
          title: course.instructor_title || 'Instructor',
          image: course.instructor_image || '/placeholder-avatar.jpg',
          bio: course.instructor_bio || 'Experienced instructor',
          email: course.instructor_email || 'instructor@forwardafrica.com',
          expertise: course.instructor_expertise ? JSON.parse(course.instructor_expertise) : ['Education'],
          experience: course.instructor_experience || 5,
          createdAt: new Date(course.instructor_created_at || Date.now())
        },
        instructorId: course.instructor_id,
        category: course.category_name || course.category || 'General',
        thumbnail: course.thumbnail || '/placeholder-course.jpg',
        banner: course.banner || '/placeholder-course.jpg',
        videoUrl: course.video_url,
        description: course.description || 'Course description coming soon.',
        lessons: course.lessons || [],
        featured: course.featured || false,
        totalXP: course.total_xp || 1000,
        comingSoon: course.coming_soon || false,
        releaseDate: course.release_date
      }));

      setFeaturedCourses(transformedCourses);
    } catch (err) {
      console.error('Failed to fetch featured courses from API:', err);
      setFeaturedCourses([]); // Set empty array instead of mock data
    }
  }, []);

  return {
    courses,
    featuredCourses,
    loading,
    error,
    fetchAllCourses,
    fetchFeaturedCourses
  };
};



// Custom hook for audit logs
export const useAuditLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAuditLogs = useCallback(async (filters?: {
    action?: string;
    resource_type?: string;
    user_id?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
  }) => {
    setLoading(true);
    setError(null);

    try {
      console.log('📋 Fetching audit logs...');
      const data = await auditLogsAPI.getAuditLogs(filters);
      console.log('📋 Audit logs received:', data);
      setLogs(data);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
      setError('Failed to load audit logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAuditLog = useCallback(async (auditData: {
    action: string;
    resource_type: string;
    resource_id?: string;
    details?: any;
  }) => {
    try {
      await auditLogsAPI.createAuditLog(auditData);
      // Refresh logs after creating new one
      await fetchAuditLogs();
    } catch (err) {
      console.error('Failed to create audit log:', err);
      throw err;
    }
  }, [fetchAuditLogs]);

  return {
    logs,
    loading,
    error,
    fetchAuditLogs,
    createAuditLog
  };
};

// Custom hook for categories
export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await categoryAPI.getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError('Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    categories,
    loading,
    error,
    fetchAllCategories
  };
};

// Custom hook for instructors
export const useInstructors = () => {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllInstructors = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await instructorAPI.getAllInstructors();
      setInstructors(data);
    } catch (err) {
      console.error('Failed to fetch instructors:', err);
      setError('Failed to load instructors');
      setInstructors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    instructors,
    loading,
    error,
    fetchAllInstructors
  };
};

// Hook for managing user progress
export const useUserProgress = (userId: string) => {
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProgress = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await progressAPI.getAllUserProgress(userId);
      setProgress(data);
    } catch (err) {
      setError('Failed to fetch user progress');
      console.error('Error fetching user progress:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updateProgress = useCallback(async (courseId: string, progressData: Partial<UserProgress>) => {
    setLoading(true);
    setError(null);
    try {
      await progressAPI.updateProgress(userId, courseId, progressData);
      await fetchUserProgress(); // Refresh data
    } catch (err) {
      setError('Failed to update progress');
      console.error('Error updating progress:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, fetchUserProgress]);

  const createProgress = useCallback(async (progressData: Partial<UserProgress>) => {
    setLoading(true);
    setError(null);
    try {
      await progressAPI.createProgress(progressData);
      await fetchUserProgress(); // Refresh data
    } catch (err) {
      setError('Failed to create progress');
      console.error('Error creating progress:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchUserProgress]);

  return {
    progress,
    loading,
    error,
    fetchUserProgress,
    updateProgress,
    createProgress,
  };
};

// Hook for managing certificates
export const useCertificates = (userId: string) => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserCertificates = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await certificateAPI.getUserCertificates(userId);
      setCertificates(data);
    } catch (err) {
      setError('Failed to fetch certificates');
      console.error('Error fetching certificates:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const verifyCertificate = useCallback(async (verificationCode: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await certificateAPI.verifyCertificate(verificationCode);
      return data;
    } catch (err) {
      setError('Failed to verify certificate');
      console.error('Error verifying certificate:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    certificates,
    loading,
    error,
    fetchUserCertificates,
    verifyCertificate,
  };
};

// Hook for managing achievements
export const useAchievements = (userId: string) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserAchievements = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await achievementAPI.getUserAchievements(userId);
      setAchievements(data);
    } catch (err) {
      setError('Failed to fetch achievements');
      console.error('Error fetching achievements:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return {
    achievements,
    loading,
    error,
    fetchUserAchievements,
  };
};

// Hook for managing users
export const useUsers = () => {
  const [users, setUsers] = useState<any[]>([]); // Changed to any[] as User type is removed
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
          try {
        const data = await userAPI.getUsers();
        setUsers(data);
      } catch (err) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserById = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
          try {
        const data = await userAPI.getUser(userId);
        return data;
      } catch (err) {
      setError('Failed to fetch user');
      console.error('Error fetching user:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (userData: Partial<any>) => { // Changed to any
    setLoading(true);
    setError(null);
          try {
        const result = await userAPI.createUser(userData);
        await fetchAllUsers(); // Refresh data
        return result;
      } catch (err) {
      setError('Failed to create user');
      console.error('Error creating user:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchAllUsers]);

  const updateUser = useCallback(async (userId: string, userData: Partial<any>) => { // Changed to any
    setLoading(true);
    setError(null);
          try {
        await userAPI.updateUser(userId, userData);
        await fetchAllUsers(); // Refresh data
      } catch (err) {
      setError('Failed to update user');
      console.error('Error updating user:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchAllUsers]);

  return {
    users,
    loading,
    error,
    fetchAllUsers,
    fetchUserById,
    createUser,
    updateUser,
  };
};

// Hook for platform analytics
export const useAnalytics = () => {
  const [stats, setStats] = useState<any>(null);
  const [detailedStats, setDetailedStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlatformStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('📊 Fetching platform stats...');
      const data = await analyticsAPI.getPlatformStats();
      console.log('📊 Platform stats received:', data);
      setStats(data);
    } catch (err) {
      setError('Failed to fetch platform stats');
      console.error('Error fetching platform stats:', err);
      // Set fallback data
      setStats({
        totalUsers: 0,
        totalCourses: 0,
        totalLessons: 0,
        totalCertificates: 0,
        totalInstructors: 0,
        completedCourses: 0,
        activeStudents: 0,
        totalXP: 0
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDetailedAnalytics = useCallback(async () => {
    try {
      console.log('📈 Fetching detailed analytics...');
      const data = await analyticsAPI.getDetailedAnalytics();
      console.log('📈 Detailed analytics received:', data);
      setDetailedStats(data);
    } catch (err) {
      console.error('Failed to fetch detailed analytics:', err);
      setError('Failed to load detailed analytics');
    }
  }, []);

  return {
    stats,
    detailedStats,
    loading,
    error,
    fetchPlatformStats,
    fetchDetailedAnalytics,
  };
};

// Example usage in components:
/*
import { useCourses, useUserProgress } from '../hooks/useDatabase';

const HomePage = () => {
  const { featuredCourses, loading, fetchFeaturedCourses } = useCourses();
  const { progress, fetchUserProgress } = useUserProgress(userId);

  useEffect(() => {
    fetchFeaturedCourses();
    fetchUserProgress();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {featuredCourses.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
};
*/