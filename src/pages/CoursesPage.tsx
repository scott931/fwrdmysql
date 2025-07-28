import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/layout/Layout';
import CourseCard from '../components/ui/CourseCard';
import { useCourses } from '../hooks/useDatabase';
import { Course } from '../types';

// Transform backend course data to frontend format
const transformCourseData = (backendCourse: any): Course => {
  console.log('Transform Course Data - Backend:', backendCourse);

  // Transform instructor data with dual fallback logic
  let instructorName = 'Unknown Instructor';
  let instructorTitle = 'Instructor';
  let instructorImage = '/images/placeholder-avatar.jpg';
  let instructorBio = 'Experienced instructor';
  let instructorEmail = 'instructor@forwardafrica.com';
  let instructorExpertise = ['Education'];
  let instructorExperience = 5;
  let instructorCreatedAt = new Date();

  console.log('🔍 TransformCourseData instructor debug:', {
    courseId: backendCourse.id,
    hasInstructorObject: !!backendCourse.instructor,
    instructorType: typeof backendCourse.instructor,
    hasInstructorName: !!backendCourse.instructor_name,
    instructorNameValue: backendCourse.instructor_name,
    instructorTitleValue: backendCourse.instructor_title,
    instructorImageValue: backendCourse.instructor_image
  });

  try {
    // First: Try to access the transformed instructor object (from useCourses hook)
    if (backendCourse.instructor && typeof backendCourse.instructor === 'object' && backendCourse.instructor !== null) {
      console.log('✅ TransformCourseData: Using instructor object');
      instructorName = (backendCourse.instructor as any).name || 'Unknown Instructor';
      instructorTitle = (backendCourse.instructor as any).title || 'Instructor';
      instructorImage = (backendCourse.instructor as any).image || '/images/placeholder-avatar.jpg';
      instructorBio = (backendCourse.instructor as any).bio || 'Experienced instructor';
      instructorEmail = (backendCourse.instructor as any).email || 'instructor@forwardafrica.com';
      instructorExpertise = (backendCourse.instructor as any).expertise || ['Education'];
      instructorExperience = (backendCourse.instructor as any).experience || 5;
      instructorCreatedAt = new Date((backendCourse.instructor as any).createdAt || Date.now());
    }
    // Second: Fall back to raw API field (direct from API)
    else if (backendCourse.instructor_name) {
      console.log('✅ TransformCourseData: Using instructor_name field');
      instructorName = backendCourse.instructor_name || 'Unknown Instructor';
      instructorTitle = backendCourse.instructor_title || 'Instructor';
      instructorImage = backendCourse.instructor_image || '/images/placeholder-avatar.jpg';
      instructorBio = backendCourse.instructor_bio || 'Experienced instructor';
      instructorEmail = backendCourse.instructor_email || 'instructor@forwardafrica.com';
      instructorExpertise = backendCourse.instructor_expertise ? JSON.parse(backendCourse.instructor_expertise) : ['Education'];
      instructorExperience = backendCourse.instructor_experience || 5;
      instructorCreatedAt = new Date(backendCourse.instructor_created_at || Date.now());
    }
    // Third: Handle string instructor (legacy format)
    else if (typeof backendCourse.instructor === 'string') {
      console.log('✅ TransformCourseData: Using string instructor');
      instructorName = backendCourse.instructor;
      instructorTitle = 'Instructor';
      instructorImage = '/images/placeholder-avatar.jpg';
      instructorBio = 'Experienced instructor';
      instructorEmail = 'instructor@forwardafrica.com';
      instructorExpertise = ['Education'];
      instructorExperience = 5;
      instructorCreatedAt = new Date();
    }
    // Fourth: Final fallback
    else {
      console.log('❌ TransformCourseData: Using final fallback - no instructor data found');
      instructorName = 'Unknown Instructor';
      instructorTitle = 'Instructor';
      instructorImage = '/images/placeholder-avatar.jpg';
      instructorBio = 'Experienced instructor';
      instructorEmail = 'instructor@forwardafrica.com';
      instructorExpertise = ['Education'];
      instructorExperience = 5;
      instructorCreatedAt = new Date();
    }
  } catch (error) {
    console.error('Error accessing instructor data:', error);
    instructorName = 'Unknown Instructor';
    instructorTitle = 'Instructor';
    instructorImage = '/images/placeholder-avatar.jpg';
    instructorBio = 'Experienced instructor';
    instructorEmail = 'instructor@forwardafrica.com';
    instructorExpertise = ['Education'];
    instructorExperience = 5;
    instructorCreatedAt = new Date();
  }

  console.log('🎯 TransformCourseData final instructor data:', {
    name: instructorName,
    title: instructorTitle,
    image: instructorImage
  });

  const instructor = {
    id: backendCourse.instructor_id || 'unknown',
    name: instructorName,
    title: instructorTitle,
    image: instructorImage,
    bio: instructorBio,
    email: instructorEmail,
    expertise: instructorExpertise,
    experience: instructorExperience,
    createdAt: instructorCreatedAt
  };

  // Note: Instructor data parsing is now handled in the dual fallback logic above

  const transformed = {
    id: backendCourse.id,
    title: backendCourse.title,
    instructor: instructor,
    instructorId: backendCourse.instructor_id,
    category: backendCourse.category_name || backendCourse.category || 'General',
            thumbnail: backendCourse.thumbnail || '/images/placeholder-course.jpg',
        banner: backendCourse.banner || '/images/placeholder-course.jpg',
    videoUrl: backendCourse.video_url,
    description: backendCourse.description || 'Course description coming soon.',
    lessons: (backendCourse.lessons || []).map((lesson: any) => ({
      ...lesson,
      // Transform snake_case to camelCase for video URL
      videoUrl: lesson.video_url || lesson.videoUrl,
      // Ensure other fields are properly formatted
      id: lesson.id,
      title: lesson.title,
      description: lesson.description || '',
      duration: lesson.duration || '0:00',
      course_id: lesson.course_id,
      order: lesson.order || 0,
              thumbnail: lesson.thumbnail || lesson.lesson_thumbnail || '/images/placeholder-course.jpg'
    })).slice().sort((a: any, b: any) => {
      // Sort by order_index if present, then by title
      if (a.orderIndex !== undefined && b.orderIndex !== undefined) {
        return a.orderIndex - b.orderIndex;
      }
      if (a.order_index !== undefined && b.order_index !== undefined) {
        return a.order_index - b.order_index;
      }
      // fallback: sort by title
      return (a.title || '').localeCompare(b.title || '');
    }),
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

      try {
        // Fetch from API
        await fetchAllCourses();
      } catch (err) {
        console.error('Failed to load courses:', err);
        setError('Failed to load courses from server');
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
  if (error) {
    return (
      <Layout>
        <div className="max-w-screen-xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-white mb-2">Failed to Load Courses</h2>
              <p className="text-gray-400 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Show empty state
  if (courses.length === 0) {
    return (
      <Layout>
        <div className="max-w-screen-xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="text-gray-500 text-6xl mb-4">📚</div>
              <h2 className="text-2xl font-bold text-white mb-2">No Courses Available</h2>
              <p className="text-gray-400">Check back later for new courses!</p>
            </div>
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