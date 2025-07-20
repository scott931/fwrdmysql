/**
 * Core type definitions for the application
 */

/**
 * User Profile
 * Represents a user account with personal and learning information
 */
export interface User {
  /** Unique identifier for the user */
  id: string;
  /** User's email address */
  email: string;
  /** User's full name */
  fullName: string;
  /** URL to user's avatar image */
  avatarUrl?: string;
  /** User's education level */
  educationLevel?: 'high-school' | 'associate' | 'bachelor' | 'master' | 'phd' | 'professional' | 'other';
  /** User's job title */
  jobTitle?: string;
  /** Topics the user is interested in learning */
  topicsOfInterest?: string[];
  /** Whether the user has completed onboarding */
  onboardingCompleted: boolean;
  /** User's role in the system */
  role: 'user' | 'content_manager' | 'admin' | 'super_admin';
  /** Date when user account was created */
  createdAt: Date;
  /** Date when user account was last updated */
  updatedAt: Date;
}

/**
 * Instructor Profile
 * Represents a course instructor with their personal and professional information
 */
export interface Instructor {
  /** Unique identifier for the instructor */
  id: string;
  /** Full name of the instructor */
  name: string;
  /** Professional title or role */
  title: string;
  /** URL to instructor's profile image */
  image: string;
  /** Professional biography */
  bio: string;
  /** Email address */
  email: string;
  /** Phone number */
  phone?: string;
  /** Areas of expertise */
  expertise: string[];
  /** Years of experience */
  experience: number;
  /** Social media links */
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  /** Date when instructor was added */
  createdAt: Date;
}

/**
 * Course Lesson
 * Individual video lesson within a course
 */
export interface Lesson {
  /** Unique identifier for the lesson */
  id: string;
  /** Lesson title */
  title: string;
  /** Duration in format "MM:SS" */
  duration: string;
  /** URL to lesson thumbnail image */
  thumbnail: string;
  /** URL to video content */
  videoUrl: string;
  /** Detailed lesson description */
  description: string;
  /** XP points earned for completing the lesson */
  xpPoints: number;
}

/**
 * Course
 * Complete course information including instructor and lessons
 */
export interface Course {
  /** Unique identifier for the course */
  id: string;
  /** Course title */
  title: string;
  /** Course instructor details */
  instructor: Instructor;
  /** Instructor ID reference */
  instructorId?: string;
  /** Category identifier */
  category: string;
  /** URL to course thumbnail image */
  thumbnail: string;
  /** URL to course banner image */
  banner: string;
  /** URL to course video (for hero banner) */
  videoUrl?: string;
  /** Course description */
  description: string;
  /** Array of course lessons */
  lessons: Lesson[];
  /** Whether the course is featured */
  featured?: boolean;
  /** Total XP points available for the course */
  totalXP: number;
  /** Whether the course is coming soon */
  comingSoon?: boolean;
  /** Expected release date for coming soon courses */
  releaseDate?: string;
}

/**
 * Course Category
 * Course classification and grouping
 */
export interface Category {
  /** Unique identifier for the category */
  id: string;
  /** Category name */
  name: string;
}

/**
 * Achievement
 * Represents a user achievement or badge
 */
export interface Achievement {
  /** Unique identifier for the achievement */
  id: string;
  /** Achievement title */
  title: string;
  /** Achievement description */
  description: string;
  /** Icon name for the achievement */
  icon: string;
  /** XP points awarded for earning the achievement */
  xpPoints: number;
  /** Date when the achievement was earned */
  earnedDate?: Date;
  /** Progress towards earning the achievement (0-100) */
  progress: number;
  /** Type of achievement */
  type: 'course' | 'streak' | 'social' | 'milestone';
}

/**
 * Learning Streak
 * Tracks daily learning consistency
 */
export interface LearningStreak {
  /** Current streak count (days) */
  current: number;
  /** Longest streak achieved */
  longest: number;
  /** Last learning activity date */
  lastActivityDate: Date;
  /** Streak history (last 30 days) */
  history: {
    date: Date;
    completed: boolean;
  }[];
}

/**
 * User Level
 * Represents user progression level
 */
export interface UserLevel {
  /** Current level number */
  current: number;
  /** XP points in current level */
  currentXP: number;
  /** XP points needed for next level */
  nextLevelXP: number;
  /** Total XP points earned */
  totalXP: number;
}

/**
 * Certificate
 * Represents a course completion certificate
 */
export interface Certificate {
  /** Unique identifier for the certificate */
  id: string;
  /** Course the certificate is for */
  courseId: string;
  /** Course title */
  courseTitle: string;
  /** Date certificate was earned */
  earnedDate: Date;
  /** Student name on certificate */
  studentName: string;
  /** Instructor who signed the certificate */
  instructor: string;
  /** Certificate verification code */
  verificationCode: string;
}

/**
 * User Progress
 * Tracks a user's progress through a course
 */
export interface UserProgress {
  /** Course identifier */
  courseId: string;
  /** Current lesson identifier */
  lessonId: string;
  /** Whether the course is completed */
  completed: boolean;
  /** Progress percentage (0-100) */
  progress: number;
  /** ISO date string of last watched timestamp */
  lastWatched: string;
  /** Certificate earned upon completion */
  certificate?: Certificate;
  /** XP points earned in this course */
  xpEarned: number;
  /** Completed lesson IDs */
  completedLessons: string[];
}

/**
 * Course Progress
 * Extends Course with progress tracking information
 */
export interface CourseProgress extends Course {
  /** Progress percentage (0-100) */
  progress: number;
  /** Current lesson being watched */
  currentLesson: Lesson;
  /** ISO date string of last watched timestamp */
  lastWatched: string;
  /** Certificate earned upon completion */
  certificate?: Certificate;
  /** XP points earned in this course */
  xpEarned: number;
  /** Completed lesson IDs */
  completedLessons: string[];
}