import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/layout/Layout';
import HeroBanner from '../components/ui/HeroBanner';
import CategoryRow from '../components/ui/CategoryRow';
import ContinueLearningRow from '../components/ui/ContinueLearningRow';
import { CourseProgress, Course } from '../types';
import { Award, Users, Star, BookOpen } from 'lucide-react';
import { useCourses, useUserProgress, useAnalytics } from '../hooks/useDatabase';
import { useAuth } from '../contexts/AuthContext';

// Fallback data to prevent flickering
const fallbackCourse: Course = {
  id: 'fallback-course',
  title: 'Welcome to Forward Africa',
  description: 'Discover amazing courses and advance your skills with expert instructors.',
  thumbnail: '/placeholder-course.jpg',
  banner: '/placeholder-course.jpg',
  category: 'Featured',
  instructor: {
    id: 'fallback-instructor',
    name: 'Expert Instructor',
    title: 'Course Creator',
    image: '/placeholder-avatar.jpg',
    bio: 'Experienced instructor with years of teaching experience.',
    email: 'instructor@forwardafrica.com',
    expertise: ['Education', 'Technology'],
    experience: 5,
    createdAt: new Date()
  },
  lessons: [],
  videoUrl: 'https://youtu.be/q5_PrTvNypY',
  featured: true,
  totalXP: 1000
};

const HomePage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [inProgressCourses, setInProgressCourses] = useState<CourseProgress[]>([]);

  // Database hooks
  const {
    courses: allCourses,
    featuredCourses,
    loading: coursesLoading,
    error: coursesError,
    fetchAllCourses,
    fetchFeaturedCourses
  } = useCourses();

  const {
    progress: userProgress,
    loading: progressLoading,
    fetchUserProgress
  } = useUserProgress(user?.id || '');

  const {
    stats: platformStats,
    loading: statsLoading,
    fetchPlatformStats
  } = useAnalytics();

  // Fetch data on component mount
  useEffect(() => {
    fetchAllCourses();
    fetchFeaturedCourses();
    fetchPlatformStats();
  }, [fetchAllCourses, fetchFeaturedCourses, fetchPlatformStats]);





  // Fetch user progress when user is available
  useEffect(() => {
    if (user?.id) {
      console.log('👤 HomePage: Fetching user progress for user:', user.id);
      fetchUserProgress();
    }
  }, [user?.id, fetchUserProgress]);

  // Process user progress to create in-progress courses
  useEffect(() => {
    if (userProgress.length > 0 && allCourses.length > 0) {
      const coursesWithProgress = userProgress.map((progress) => {
        const course = allCourses.find((c: Course) => c.id === progress.courseId);
          if (!course) return null;

          return {
            ...course,
          progress: progress.progress,
          currentLesson: course.lessons?.find((l: any) => l.id === progress.lessonId) || course.lessons?.[0],
          lastWatched: progress.lastWatched,
          xpEarned: progress.xpEarned,
          completedLessons: progress.completedLessons || []
          };
        }).filter((course): course is CourseProgress => course !== null);

        // Sort by last watched date
        coursesWithProgress.sort((a, b) =>
          new Date(b.lastWatched).getTime() - new Date(a.lastWatched).getTime()
        );

        setInProgressCourses(coursesWithProgress);
      }
  }, [userProgress, allCourses]);

  const handlePlayCourse = (courseId: string) => {
    router.push(`/course/${courseId}`);
  };

  // Use fallback data if no courses are loaded yet
  const displayCourses = allCourses.length > 0 ? allCourses : [fallbackCourse];
  const displayFeaturedCourses = featuredCourses.length > 0 ? featuredCourses : [fallbackCourse];
  const featuredCourse = displayFeaturedCourses[0];

  return (
    <Layout>
      <div className="pb-10">
        {/* Hero Banner - Always show with fallback data */}
        <HeroBanner course={featuredCourse} onPlay={handlePlayCourse} />

        {/* Stats Section */}
        <div className="bg-gradient-to-b from-black to-gray-900">
          <div className="max-w-screen-xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              <div className="text-center p-6 bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700">
                <Award className="h-8 w-8 text-red-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">
                  {platformStats?.totalInstructors || '50+'}
                </div>
                <div className="text-gray-400">Expert Instructors</div>
              </div>
              <div className="text-center p-6 bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700">
                <BookOpen className="h-8 w-8 text-red-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">
                  {`${platformStats?.totalCourses || displayCourses.length}+`}
                </div>
                <div className="text-gray-400">Courses</div>
              </div>
              <div className="text-center p-6 bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700">
                <Users className="h-8 w-8 text-red-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">
                  {platformStats?.totalUsers || '10K+'}
                </div>
                <div className="text-gray-400">Active Learners</div>
              </div>
              <div className="text-center p-6 bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700">
                <Star className="h-8 w-8 text-red-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">4.8</div>
                <div className="text-gray-400">Average Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Learning Section */}
        {inProgressCourses.length > 0 && (
          <div className="mt-8">
            <ContinueLearningRow courses={inProgressCourses} />
          </div>
        )}

        {/* Featured Classes Row */}
        <div className="mt-8">
          <CategoryRow
            title="Featured Classes"
            courses={displayFeaturedCourses}
          />
        </div>

        {/* Category Rows - Group courses by category */}
        {(() => {
          const categories = Array.from(new Set(displayCourses.map((course: Course) => course.category)));

          return categories.map((categoryName) => {
            const categoryCourses = displayCourses.filter((course: Course) => course.category === categoryName);

          if (categoryCourses.length > 0 && categoryName !== 'Featured') {
              console.log(`Rendering category "${categoryName}" with:`, categoryCourses);
            return (
              <CategoryRow
                  key={categoryName}
                  title={categoryName}
                courses={categoryCourses}
              />
            );
          }

          return null;
          });
        })()}
      </div>
    </Layout>
  );
};

export default HomePage;