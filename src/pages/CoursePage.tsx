import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Play, ChevronDown, ChevronUp, Clock, Award, ChevronRight } from 'lucide-react';
import Button from '../components/ui/Button';
import VideoPlayer from '../components/ui/VideoPlayer';
import Layout from '../components/layout/Layout';
import { Course, UserProgress, Certificate } from '../types';
import { useCertificates } from '../hooks/useCertificates';
import { downloadCertificate } from '../utils/certificateGenerator';
import Image from 'next/image';

const CoursePage: React.FC = () => {
  const router = useRouter();
  const { courseId } = router.query;
  const [course, setCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const { generateCertificate, getCertificate } = useCertificates();
  const [certificate, setCertificate] = useState<Certificate | undefined>(undefined);
  const [isDownloading, setIsDownloading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Set client flag on mount to prevent hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    if (courseId && isClient) {
      const cert = getCertificate(courseId as string);
      setCertificate(cert);
    }
  }, [courseId, getCertificate, isClient]);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (courseId && typeof courseId === 'string') {
        try {
          setLoading(true);
          console.log('Fetching course data for:', courseId);

          // Fetch course from database API
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'}/courses/${courseId}`);
          if (!response.ok) {
            throw new Error('Course not found');
          }

          const foundCourse = await response.json();
          console.log('Course data from API:', foundCourse);
          console.log('Raw lessons from API:', foundCourse.lessons);

          // Transform the course data to match frontend format
          const transformedCourse = {
            id: foundCourse.id,
            title: foundCourse.title,
            instructor: {
              id: foundCourse.instructor_id || 'unknown',
              name: foundCourse.instructor_name || 'Unknown Instructor',
              title: foundCourse.instructor_title || 'Instructor',
              image: foundCourse.instructor_image || '/placeholder-avatar.jpg',
              bio: foundCourse.instructor_bio || 'Experienced instructor',
              email: foundCourse.instructor_email || 'instructor@forwardafrica.com',
              expertise: ['Education'],
              experience: 5,
              createdAt: new Date()
            },
            instructorId: foundCourse.instructor_id,
            category: foundCourse.category_name || 'General',
            thumbnail: foundCourse.thumbnail || '/placeholder-course.jpg',
            banner: foundCourse.banner || '/placeholder-course.jpg',
            videoUrl: foundCourse.video_url,
            description: foundCourse.description || 'Course description coming soon.',
            lessons: foundCourse.lessons || [],
            featured: foundCourse.featured || false,
            totalXP: foundCourse.total_xp || 1000,
            comingSoon: foundCourse.coming_soon || false,
            releaseDate: foundCourse.release_date
          };

          console.log('Transformed course data:', transformedCourse);
          console.log('Transformed lessons:', transformedCourse.lessons);
          console.log('Lesson IDs:', transformedCourse.lessons.map((l: any) => l.id));

          setCourse(transformedCourse);

          // Load progress from localStorage for courses without lessons (only on client side)
          if (typeof window !== 'undefined') {
            const storedProgress = localStorage.getItem('userProgress');
            if (storedProgress) {
              const progressData = JSON.parse(storedProgress);
              if (progressData[courseId]) {
                setSelectedLesson(progressData[courseId].lessonId);
                setProgress(progressData[courseId].progress);
              } else {
                setSelectedLesson(null);
              }
            } else {
              setSelectedLesson(null);
              setProgress(0);
            }
          } else {
            setSelectedLesson(null);
            setProgress(0);
          }
        } catch (error) {
          console.error('Error fetching course:', error);
          // Redirect to courses page if course not found
          router.push('/courses');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCourseData();
  }, [courseId, router]);

  // Reset redirect state when courseId changes
  useEffect(() => {
    setHasRedirected(false);
    setRedirecting(false);
  }, [courseId]);

  // Handle automatic redirect to first lesson after course data is loaded
  useEffect(() => {
    if (course && course.lessons && course.lessons.length > 0 && isClient && !redirecting && !hasRedirected) {
      const firstLesson = course.lessons[0];

      // Validate that the first lesson exists and has a valid ID
      if (!firstLesson || !firstLesson.id) {
        console.error('❌ First lesson is invalid:', firstLesson);
        setHasRedirected(true);
        return;
      }

      // Additional validation: ensure the lesson ID is actually in the course data
      const lessonExists = course.lessons.some(lesson => lesson.id === firstLesson.id);
      if (!lessonExists) {
        console.error('❌ First lesson ID not found in course data:', {
          firstLessonId: firstLesson.id,
          availableLessonIds: course.lessons.map(l => l.id)
        });
        setHasRedirected(true);
        return;
      }

      const targetUrl = `/course/${courseId}/lesson/${firstLesson.id}`;

      // Prevent navigation if already on the target route
      if (router.asPath === targetUrl) {
        console.log('Already on target lesson, staying on course page');
        setHasRedirected(true);
        return;
      }

      console.log('🎯 Auto-redirecting to first lesson:', {
        courseId,
        firstLessonId: firstLesson.id,
        firstLessonIdType: typeof firstLesson.id,
        firstLessonTitle: firstLesson.title,
        lessonsCount: course.lessons.length,
        targetUrl,
        currentPath: router.asPath,
        allLessonIds: course.lessons.map(l => ({ id: l.id, title: l.title })),
        allLessonIdsOnly: course.lessons.map(l => l.id),
        allLessonIdTypes: course.lessons.map(l => ({ id: l.id, type: typeof l.id }))
      });

      setRedirecting(true);
      setHasRedirected(true);

      // Use a small delay to ensure the component is fully mounted
      setTimeout(() => {
        try {
          router.push(targetUrl);
        } catch (error) {
          console.error('Navigation error:', error);
          setRedirecting(false);
          setHasRedirected(false); // Reset if navigation fails
        }
      }, 100);
    }
  }, [course, courseId, router, isClient, redirecting, hasRedirected]);

  const handleDownloadCertificate = async () => {
    if (!certificate || !course) return;

    try {
      setIsDownloading(true);
      await downloadCertificate(certificate);
    } catch (error) {
      console.error('Error downloading certificate:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const updateProgress = (lessonId: string) => {
    if (!course || !courseId || typeof courseId !== 'string') return;

    const lessonIndex = course.lessons.findIndex(l => l.id === lessonId);
    const progressValue = ((lessonIndex + 1) / course.lessons.length) * 100;

    // Save progress to localStorage (only on client side)
    if (typeof window !== 'undefined') {
      const storedProgress = localStorage.getItem('userProgress');
      const progressData = storedProgress ? JSON.parse(storedProgress) : {};

      progressData[courseId] = {
        lessonId,
        progress: progressValue,
        lastWatched: new Date().toISOString()
      };

      // Generate certificate if course is completed
      if (progressValue === 100 && !certificate) {
        const newCertificate = generateCertificate(
          courseId,
          course.title,
          'John Doe', // Replace with actual user name
          typeof course.instructor === 'object' ? course.instructor.name : course.instructor
        );
        setCertificate(newCertificate);
        progressData[courseId].certificate = newCertificate;
      }

      localStorage.setItem('userProgress', JSON.stringify(progressData));
    }
    setProgress(progressValue);
  };

  const handleLessonSelect = (lessonId: string) => {
    setSelectedLesson(lessonId);
    updateProgress(lessonId);
  };

  // Show loading state while redirecting or before client-side hydration
  if (loading || redirecting || !isClient) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            <p className="mt-4 text-gray-400">
              {redirecting ? 'Redirecting to video lessons...' : 'Loading course...'}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Course Not Found</h2>
            <p className="text-gray-400 mb-4">The course you're looking for doesn't exist.</p>
            <Button onClick={() => router.push('/courses')}>
              Back to Courses
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // If we reach here, it means the course has no lessons (coming soon)
  const currentLesson = course.lessons.find(lesson => lesson.id === selectedLesson);

  const instructorInfo = typeof course.instructor === 'object' ? course.instructor : {
    name: course.instructor,
    title: 'Expert Educator',
    image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg',
    bio: 'Experienced professional in the field.'
  };

  return (
    <Layout>
      <div className="pb-16">
        {/* Course Info Banner */}
        <div className="relative w-full bg-black py-12">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:space-x-8">
              {/* Left Column - Video Player */}
              <div className="md:w-2/3 mb-8 md:mb-0">
                <div className="flex flex-col items-center justify-center p-8 bg-gray-800 rounded-lg">
                  <h2 className="text-white text-xl font-bold mb-4">Course Coming Soon</h2>
                  <p className="text-gray-300 text-center mb-6">
                    This course is currently being developed and will be available soon.
                    We're working hard to bring you high-quality video lessons.
                  </p>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => router.push('/courses')}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                    >
                      Browse Other Courses
                    </button>
                    <button
                      onClick={() => router.push('/home')}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                    >
                      Go to Home
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column - Course Info & Lessons */}
              <div className="md:w-1/3">
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    {instructorInfo.image.startsWith('http') ? (
                      <img
                        src={instructorInfo.image}
                        alt={instructorInfo.name}
                        className="w-12 h-12 rounded-full object-cover mr-4"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.src !== '/placeholder-avatar.jpg') {
                            target.src = '/placeholder-avatar.jpg';
                          }
                        }}
                      />
                    ) : (
                      <Image
                        src={instructorInfo.image}
                        alt={instructorInfo.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover mr-4"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.src !== '/placeholder-avatar.jpg') {
                            target.src = '/placeholder-avatar.jpg';
                          }
                        }}
                      />
                    )}
                    <div>
                      <h3 className="text-white font-medium">{instructorInfo.name}</h3>
                      <p className="text-gray-400 text-sm">{instructorInfo.title}</p>
                    </div>
                  </div>

                  <h2 className="text-white text-xl font-bold mb-2">{course.title}</h2>

                  <div className="mb-4">
                    <p className={`text-gray-300 text-sm ${!isDescriptionExpanded ? 'line-clamp-3' : ''}`}>
                      {course.description}
                    </p>
                    <button
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      className="text-red-500 text-sm flex items-center mt-1 hover:text-red-400"
                    >
                      {isDescriptionExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-1" />
                          Show less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1" />
                          Show more
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center space-x-2 mb-6">
                    <Award className="h-5 w-5 text-red-500" />
                    <span className="text-white text-sm">
                      Lessons coming soon
                    </span>
                  </div>

                  {isClient && certificate && (
                    <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <Award className="h-6 w-6 text-red-500 mr-2" />
                          <h3 className="text-white font-medium">Course Certificate</h3>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownloadCertificate}
                          disabled={isDownloading}
                        >
                          {isDownloading ? 'Downloading...' : 'Download Certificate'}
                        </Button>
                      </div>
                      <p className="text-gray-400 text-sm">
                        Congratulations! You've completed this course and earned a certificate.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructor Bio */}
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <h2 className="text-white text-2xl font-bold mb-6">About {instructorInfo.name}</h2>
          <div className="flex flex-col md:flex-row md:space-x-8">
            <div className="md:w-1/3 mb-6 md:mb-0">
              {instructorInfo.image.startsWith('http') ? (
                <img
                  src={instructorInfo.image}
                  alt={instructorInfo.name}
                  className="w-full h-auto rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== '/placeholder-avatar.jpg') {
                      target.src = '/placeholder-avatar.jpg';
                    }
                  }}
                />
              ) : (
                <Image
                  src={instructorInfo.image}
                  alt={instructorInfo.name}
                  width={400}
                  height={300}
                  className="w-full h-auto rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== '/placeholder-avatar.jpg') {
                      target.src = '/placeholder-avatar.jpg';
                    }
                  }}
                />
              )}
            </div>
            <div className="md:w-2/3">
              <h3 className="text-white text-xl font-medium mb-2">{instructorInfo.name}</h3>
              <p className="text-red-500 font-medium mb-4">{instructorInfo.title}</p>
              <p className="text-gray-300">{instructorInfo.bio}</p>
              <Button className="mt-6" variant="primary">View All Classes</Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CoursePage;