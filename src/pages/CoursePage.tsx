import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from '../lib/router';
import { Play, ChevronDown, ChevronUp, Clock, Award } from 'lucide-react';
import Button from '../components/ui/Button';
import VideoPlayer from '../components/ui/VideoPlayer';
import { getCourseById } from '../data/mockData';
import { Course, UserProgress, Certificate } from '../types';
import { useCertificates } from '../hooks/useCertificates';
import { downloadCertificate } from '../utils/certificateGenerator';

const CoursePage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const { generateCertificate, getCertificate } = useCertificates();
  const [certificate, setCertificate] = useState<Certificate | undefined>();
  const [isDownloading, setIsDownloading] = useState(false);

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    if (courseId) {
      const cert = getCertificate(courseId);
      setCertificate(cert);
    }
  }, [courseId, getCertificate]);

  useEffect(() => {
    if (courseId) {
      const foundCourse = getCourseById(courseId);
      if (foundCourse) {
        setCourse(foundCourse);

        // Load progress from localStorage
        const storedProgress = localStorage.getItem('userProgress');
        if (storedProgress) {
          const progressData = JSON.parse(storedProgress);
          if (progressData[courseId]) {
            setSelectedLesson(progressData[courseId].lessonId);
            setProgress(progressData[courseId].progress);
          } else if (foundCourse.lessons.length > 0) {
            setSelectedLesson(foundCourse.lessons[0].id);
          } else {
            setSelectedLesson(null);
            setProgress(0);
          }
        } else if (foundCourse.lessons.length > 0) {
          setSelectedLesson(foundCourse.lessons[0].id);
        } else {
          setSelectedLesson(null);
          setProgress(0);
        }
      } else {
        navigate('/not-found');
      }
    }
  }, [courseId, navigate]);

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
    if (!course || !courseId) return;

    const lessonIndex = course.lessons.findIndex(l => l.id === lessonId);
    const progressValue = ((lessonIndex + 1) / course.lessons.length) * 100;

    // Save progress to localStorage
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
    setProgress(progressValue);
  };

  const handleLessonSelect = (lessonId: string) => {
    setSelectedLesson(lessonId);
    updateProgress(lessonId);
  };

  if (!course) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const currentLesson = course.lessons.find(lesson => lesson.id === selectedLesson);
  const instructorInfo = typeof course.instructor === 'object' ? course.instructor : {
    name: course.instructor,
    title: 'Expert Educator',
    image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg',
    bio: 'Experienced professional in the field.'
  };

  return (
    <div className="pb-16">
      {/* Course Info Banner */}
      <div className="relative w-full bg-black py-12">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:space-x-8">
            {/* Left Column - Video Player */}
            <div className="md:w-2/3 mb-8 md:mb-0">
              {currentLesson ? (
                <>
                  <VideoPlayer lesson={currentLesson} />

                  {/* Progress Bar */}
                  <div className="mt-4 bg-gray-700 h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-red-600 h-full transition-all duration-300"
                      style={{ width: `${Math.round(progress)}%` }}
                    ></div>
                  </div>

                  {/* Lesson Info */}
                  <div className="mt-6">
                    <h1 className="text-white text-2xl font-bold">{currentLesson.title}</h1>
                    <div className="flex items-center mt-2 text-gray-400">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{currentLesson.duration}</span>
                    </div>
                    <p className="text-gray-300 mt-4">{currentLesson.description}</p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 bg-gray-800 rounded-lg">
                  <h2 className="text-white text-xl font-bold mb-4">Coming Soon</h2>
                  <p className="text-gray-300 text-center">
                    This course is currently being developed. Check back soon for video lessons!
                  </p>
                </div>
              )}
            </div>

            {/* Right Column - Course Info & Lessons */}
            <div className="md:w-1/3">
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <img
                    src={instructorInfo.image}
                    alt={instructorInfo.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
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
                    {course.lessons.length > 0
                      ? `Includes ${course.lessons.length} video lessons`
                      : 'Lessons coming soon'}
                  </span>
                </div>

                {certificate && (
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

                {/* Lessons List */}
                {course.lessons.length > 0 && (
                  <div className="border-t border-gray-700 pt-4">
                    <h3 className="text-white font-medium mb-3">Lessons</h3>
                    <div className="space-y-3">
                      {course.lessons.map((lesson, index) => (
                        <button
                          key={lesson.id}
                          onClick={() => handleLessonSelect(lesson.id)}
                          className={`flex items-center w-full p-2 rounded-md transition-colors ${
                            selectedLesson === lesson.id ? 'bg-red-600 text-white' : 'hover:bg-gray-700 text-gray-300'
                          }`}
                        >
                          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 mr-3">
                            {selectedLesson === lesson.id ? (
                              <Play className="h-4 w-4 text-white" />
                            ) : (
                              <span className="text-gray-300">{index + 1}</span>
                            )}
                          </div>
                          <div className="text-left">
                            <p className={`text-sm font-medium ${selectedLesson === lesson.id ? 'text-white' : 'text-gray-300'}`}>
                              {lesson.title}
                            </p>
                            <p className="text-xs text-gray-400">{lesson.duration}</p>
                          </div>
                        </button>
                      ))}
                    </div>
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
            <img
              src={instructorInfo.image}
              alt={instructorInfo.name}
              className="w-full h-auto rounded-lg"
            />
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
  );
};

export default CoursePage;