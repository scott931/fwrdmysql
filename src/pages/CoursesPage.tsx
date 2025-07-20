import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/layout/Layout';
import CourseCard from '../components/ui/CourseCard';
import { useCourses } from '../hooks/useDatabase';
import { getAllCourses as getMockCourses } from '../data/mockData';
import { Course } from '../types';

// Transform backend course data to frontend format
const transformCourseData = (backendCourse: any): Course => {
  console.log('Transform Course Data - Backend:', backendCourse);

  // Transform instructor data properly
  const instructor = {
    id: backendCourse.instructor_id || 'unknown',
    name: backendCourse.instructor_name || 'Unknown Instructor',
    title: backendCourse.instructor_title || 'Instructor',
    image: backendCourse.instructor_image || '/placeholder-avatar.jpg',
    bio: backendCourse.instructor_bio || 'Experienced instructor',
    email: backendCourse.instructor_email || 'instructor@forwardafrica.com',
    expertise: ['Education'], // Default expertise
    experience: 5, // Default experience
    createdAt: new Date()
  };

  // Try to parse expertise if it exists
  if (backendCourse.instructor_expertise) {
    try {
      instructor.expertise = JSON.parse(backendCourse.instructor_expertise);
    } catch (e) {
      console.log('Could not parse instructor expertise:', backendCourse.instructor_expertise);
    }
  }

  // Try to parse experience if it exists
  if (backendCourse.instructor_experience) {
    instructor.experience = parseInt(backendCourse.instructor_experience) || 5;
  }

  // Try to parse created_at if it exists
  if (backendCourse.instructor_created_at) {
    instructor.createdAt = new Date(backendCourse.instructor_created_at);
  }

  const transformed = {
    id: backendCourse.id,
    title: backendCourse.title,
    instructor: instructor,
    instructorId: backendCourse.instructor_id,
    category: backendCourse.category_name || backendCourse.category || 'General',
    thumbnail: backendCourse.thumbnail || '/placeholder-course.jpg',
    banner: backendCourse.banner || '/placeholder-course.jpg',
    videoUrl: backendCourse.video_url,
    description: backendCourse.description || 'Course description coming soon.',
    lessons: backendCourse.lessons || [],
    featured: backendCourse.featured || false,
    totalXP: backendCourse.total_xp || 1000,
    comingSoon: backendCourse.coming_soon || false,
    releaseDate: backendCourse.release_date
  };

  console.log('Transform Course Data - Transformed:', transformed);
  console.log('Instructor data:', transformed.instructor);
  console.log('Lessons data:', transformed.lessons);
  return transformed;
};

const CoursesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Database hooks
  const {
    courses: apiCourses,
    loading: apiLoading,
    error: apiError,
    fetchAllCourses
  } = useCourses();

  // Fetch data on component mount
  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      setError(null);

      // TEMPORARY: Force mock data while debugging database
      const USE_MOCK_DATA = false; // Set to false when database is working

      if (USE_MOCK_DATA) {
        console.log('Using mock data (temporary)');
        const mockCourses = getMockCourses();
        setCourses(mockCourses);
        setLoading(false);
        return;
      }

      try {
        // Test direct API call to see what we get
        console.log('Testing direct API call...');
        const response = await fetch('http://localhost:3002/api/courses');
        const apiData = await response.json();
        console.log('Direct API response:', apiData);

        // Try to fetch from API first
        await fetchAllCourses();
      } catch (err) {
        console.log('API failed, using mock data as fallback');
        console.log('Error details:', err);
        // If API fails, use mock data as fallback
        const mockCourses = getMockCourses();
        setCourses(mockCourses);
        setLoading(false);
      }
    };

    loadCourses();
  }, [fetchAllCourses]);

  // Update courses when API data is available
  useEffect(() => {
    if (apiCourses.length > 0) {
      // Transform backend data to frontend format
      const transformedCourses = apiCourses.map(transformCourseData);
      setCourses(transformedCourses);
      setLoading(false);
    }
  }, [apiCourses]);

  // Update loading state based on API loading
  useEffect(() => {
    if (!apiLoading && apiCourses.length === 0 && !apiError) {
      // If API is not loading and no courses, use mock data
      const mockCourses = getMockCourses();
      setCourses(mockCourses);
      setLoading(false);
    }
  }, [apiLoading, apiCourses, apiError]);

  // Get unique categories from courses
  const allCategories = Array.from(new Set(courses.map(course => course.category)))
    .map(categoryName => ({ id: categoryName, name: categoryName }));

  // Filter courses to only show those with lessons or are ready
  const availableCourses = courses.filter(course =>
    course.lessons.length > 0 || !course.comingSoon
  );

  console.log('CoursesPage Debug:', {
    totalCourses: courses.length,
    availableCourses: availableCourses.length,
    coursesWithLessons: courses.filter(c => c.lessons && c.lessons.length > 0).length,
    courseDetails: courses.map(c => ({
      id: c.id,
      title: c.title,
      lessonsCount: c.lessons?.length || 0,
      comingSoon: c.comingSoon,
      lessons: c.lessons || []
    }))
  });

  const filteredCourses = selectedCategory === 'all'
    ? availableCourses
    : availableCourses.filter(course => course.category === selectedCategory);

  // Show loading state
  if (loading) {
    return (
      <Layout>
        <div className="max-w-screen-xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
              <p className="mt-4 text-gray-400">Loading courses...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Show error state
  if (error && courses.length === 0) {
    return (
      <Layout>
        <div className="max-w-screen-xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">Error loading courses: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-screen-xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">All Courses</h1>
          <p className="text-gray-400 text-base md:text-lg max-w-3xl">
            Explore our comprehensive collection of courses taught by world-class experts.
            Master new skills and advance your career with hands-on learning experiences.
          </p>
        </div>

        {/* Category Filter */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm md:text-base transition-colors ${
              selectedCategory === 'all'
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All Courses
          </button>
          {allCategories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm md:text-base transition-colors ${
                selectedCategory === category.id
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
          {filteredCourses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-white text-xl font-medium mb-2">No courses found</h3>
            <p className="text-gray-400">
              No courses are currently available in this category.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CoursesPage;