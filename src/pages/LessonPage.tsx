import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Play, Clock, ChevronLeft, ChevronRight, BookOpen, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import VideoPlayer from '../components/ui/VideoPlayer';
import { getCourseById } from '../data/mockData';
import { Course, Lesson } from '../types';

const LessonPage: React.FC = () => {
  const router = useRouter();
  const { courseId, lessonId } = router.query;
  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [showNotes, setShowNotes] = useState(false);

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    if (courseId && typeof courseId === 'string') {
      const foundCourse = getCourseById(courseId);
      if (foundCourse) {
        setCourse(foundCourse);

        // Find the current lesson
        let targetLessonId = lessonId as string;
        if (!targetLessonId && foundCourse.lessons.length > 0) {
          // If no lessonId provided, use the first lesson or last watched
          const storedProgress = localStorage.getItem('userProgress');
          if (storedProgress) {
            const progressData = JSON.parse(storedProgress);
            if (progressData[courseId]) {
              targetLessonId = progressData[courseId].lessonId;
            } else {
              targetLessonId = foundCourse.lessons[0].id;
            }
          } else {
            targetLessonId = foundCourse.lessons[0].id;
          }
        }

        const lessonIndex = foundCourse.lessons.findIndex((l: Lesson) => l.id === targetLessonId);
        if (lessonIndex !== -1) {
          setCurrentLesson(foundCourse.lessons[lessonIndex]);
          setCurrentLessonIndex(lessonIndex);

          // Calculate progress
          const progressValue = ((lessonIndex + 1) / foundCourse.lessons.length) * 100;
          setProgress(progressValue);

          // Update URL if needed
          if (lessonId !== targetLessonId) {
            router.replace(`/course/${courseId}/lesson/${targetLessonId}`, undefined, { shallow: true });
          }
        } else {
          // Lesson not found, redirect to course page
          router.push(`/course/${courseId}`);
        }
      } else {
        // Course not found, redirect to courses page
        router.push('/courses');
      }
    }
  }, [courseId, lessonId, router]);

  const updateProgress = (lessonId: string) => {
    if (!course || !courseId || typeof courseId !== 'string') return;

    const lessonIndex = course.lessons.findIndex((l: Lesson) => l.id === lessonId);
    const progressValue = ((lessonIndex + 1) / course.lessons.length) * 100;

    // Save progress to localStorage
    const storedProgress = localStorage.getItem('userProgress');
    const progressData = storedProgress ? JSON.parse(storedProgress) : {};

    progressData[courseId] = {
      lessonId,
      progress: progressValue,
      lastWatched: new Date().toISOString()
    };

    localStorage.setItem('userProgress', JSON.stringify(progressData));
    setProgress(progressValue);
  };

  const handleLessonSelect = (lessonId: string) => {
    router.push(`/course/${courseId}/lesson/${lessonId}`);
  };

  const goToPreviousLesson = () => {
    if (currentLessonIndex > 0) {
      const prevLesson = course!.lessons[currentLessonIndex - 1];
      router.push(`/course/${courseId}/lesson/${prevLesson.id}`);
    }
  };

  const goToNextLesson = () => {
    if (currentLessonIndex < course!.lessons.length - 1) {
      const nextLesson = course!.lessons[currentLessonIndex + 1];
      router.push(`/course/${courseId}/lesson/${nextLesson.id}`);
    }
  };

  const goToCourse = () => {
    router.push(`/course/${courseId}`);
  };

  if (!course || !currentLesson) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const instructorInfo = typeof course.instructor === 'object' ? course.instructor : {
    name: course.instructor,
    title: 'Expert Educator',
    image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg',
    bio: 'Experienced professional in the field.'
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-black border-b border-gray-800">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={goToCourse}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-white text-lg font-semibold">{course.title}</h1>
                <p className="text-gray-400 text-sm">
                  Lesson {currentLessonIndex + 1} of {course.lessons.length}
                </p>
              </div>
            </div>

            {/* Progress */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white text-sm font-medium">
                  {Math.round(progress)}% Complete
                </p>
                <div className="w-32 bg-gray-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-red-600 h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row lg:space-x-8">
          {/* Main Content - Video Player */}
          <div className="lg:w-2/3 mb-8 lg:mb-0">
            {/* Video Player */}
            <div className="bg-black rounded-lg overflow-hidden mb-6">
              <VideoPlayer lesson={currentLesson} />
            </div>

            {/* Lesson Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={goToPreviousLesson}
                disabled={currentLessonIndex === 0}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  currentLessonIndex === 0
                    ? 'text-gray-500 cursor-not-allowed'
                    : 'text-white hover:bg-gray-800'
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous Lesson</span>
              </button>

              <button
                onClick={goToNextLesson}
                disabled={currentLessonIndex === course.lessons.length - 1}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  currentLessonIndex === course.lessons.length - 1
                    ? 'text-gray-500 cursor-not-allowed'
                    : 'text-white hover:bg-gray-800'
                }`}
              >
                <span>Next Lesson</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Lesson Info */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-white text-2xl font-bold mb-4">{currentLesson.title}</h2>

              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center text-gray-400">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{currentLesson.duration}</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <BookOpen className="h-4 w-4 mr-2" />
                  <span>Lesson {currentLessonIndex + 1}</span>
                </div>
              </div>

              <p className="text-gray-300 mb-6">{currentLesson.description}</p>

              {/* Notes Section */}
              <div className="border-t border-gray-700 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white text-lg font-semibold">Lesson Notes</h3>
                  <button
                    onClick={() => setShowNotes(!showNotes)}
                    className="text-red-500 hover:text-red-400 transition-colors"
                  >
                    {showNotes ? 'Hide Notes' : 'Show Notes'}
                  </button>
                </div>

                {showNotes && (
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-300 text-sm">
                      Take notes during this lesson. Your notes will be saved automatically.
                    </p>
                    <textarea
                      className="w-full mt-4 bg-gray-600 border border-gray-500 rounded-md p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                      rows={6}
                      placeholder="Add your notes here..."
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Course Info & Lessons */}
          <div className="lg:w-1/3">
            <div className="bg-gray-800 rounded-lg p-6 sticky top-8">
              {/* Instructor Info */}
              <div className="flex items-center mb-6">
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

              {/* Course Progress */}
              <div className="mb-6">
                <h3 className="text-white font-medium mb-3">Course Progress</h3>
                <div className="bg-gray-700 h-2 rounded-full overflow-hidden mb-2">
                  <div
                    className="bg-red-600 h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-gray-400 text-sm">
                  {Math.round(progress)}% complete • {course.lessons.length} lessons
                </p>
              </div>

              {/* Lessons List */}
              <div>
                <h3 className="text-white font-medium mb-3">All Lessons</h3>
                <div className="space-y-2">
                  {course.lessons.map((lesson, index) => (
                    <button
                      key={lesson.id}
                      onClick={() => handleLessonSelect(lesson.id)}
                      className={`flex items-center w-full p-3 rounded-md transition-colors text-left ${
                        lesson.id === currentLesson.id
                          ? 'bg-red-600 text-white'
                          : index < currentLessonIndex
                          ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                          : 'hover:bg-gray-700 text-gray-300'
                      }`}
                    >
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 mr-3">
                        {lesson.id === currentLesson.id ? (
                          <Play className="h-4 w-4 text-white" />
                        ) : index < currentLessonIndex ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <span className="text-gray-300">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          lesson.id === currentLesson.id ? 'text-white' : 'text-gray-300'
                        }`}>
                          {lesson.title}
                        </p>
                        <p className="text-xs text-gray-400">{lesson.duration}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPage;