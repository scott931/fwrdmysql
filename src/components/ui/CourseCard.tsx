/**
 * CourseCard Component
 *
 * Displays a course card with thumbnail, title, and instructor information.
 * Includes hover effects and play button overlay.
 *
 * @component
 * @example
 * ```tsx
 * <CourseCard course={courseData} />
 * ```
 */

import React from 'react';
import { Play, Clock } from 'lucide-react';
import { Course } from '../../types';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface CourseCardProps {
  /** Course data to display */
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const router = useRouter();

  // Early return for null/undefined course
  if (!course) {
    return (
      <div className="aspect-[2/3] relative rounded-lg overflow-hidden shadow-xl bg-gray-800 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Validate course structure
  if (typeof course !== 'object') {
    return (
      <div className="aspect-[2/3] relative rounded-lg overflow-hidden shadow-xl bg-gray-800">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-400">Invalid Course Data</p>
        </div>
      </div>
    );
  }

  // MINIMAL TEST VERSION - just show basic info
  const courseId = course.id || 'unknown-course';
  const title = course.title || 'Untitled Course';
  const thumbnail = course.thumbnail || '/placeholder-course.jpg';

  // SUPER SAFE instructor handling
  let instructorName = 'Unknown Instructor';
  let instructorImage = '/placeholder-avatar.jpg';

  try {
    if (course.instructor) {
      if (typeof course.instructor === 'object' && course.instructor !== null) {
        instructorName = (course.instructor as any).name || 'Unknown Instructor';
        instructorImage = (course.instructor as any).image || '/placeholder-avatar.jpg';
      } else if (typeof course.instructor === 'string') {
        instructorName = course.instructor;
        instructorImage = '/placeholder-avatar.jpg';
      }
    }
  } catch (error) {
    console.error('Error accessing instructor data:', error);
    instructorName = 'Unknown Instructor';
    instructorImage = '/placeholder-avatar.jpg';
  }

  // Check if course is playable
  const isPlayable = course.lessons && course.lessons.length > 0 && !course.comingSoon;

  // Check if course is coming soon (no lessons or explicitly marked as coming soon)
  const isComingSoon = course.comingSoon || !course.lessons || course.lessons.length === 0;

  // Handle course card click
  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('CourseCard Clicked:', {
      courseId,
      title,
      lessonsCount: course.lessons?.length || 0,
      hasLessons: course.lessons && course.lessons.length > 0,
      firstLessonId: course.lessons?.[0]?.id,
      comingSoon: course.comingSoon,
      isComingSoon,
      isPlayable
    });

    // Don't navigate if course is coming soon
    if (isComingSoon) {
      console.log('Course is coming soon, no navigation');
      return;
    }

    // Check if course has lessons
    if (course.lessons && course.lessons.length > 0) {
      const firstLessonId = course.lessons[0].id;
      const lessonUrl = `/course/${courseId}/lesson/${firstLessonId}`;
      console.log('Navigating to lesson:', lessonUrl);
      // Navigate directly to first lesson
      router.push(lessonUrl);
    } else {
      console.log('No lessons found, navigating to course page');
      // Navigate to course page if no lessons
      router.push(`/course/${courseId}`);
    }
  };

  // Debug logging
  console.log('CourseCard Debug:', {
    courseId,
    title,
    lessonsCount: course.lessons?.length || 0,
    comingSoon: course.comingSoon,
    isPlayable,
    lessons: course.lessons || []
  });

  return (
    <div onClick={handleCardClick} className={`group ${isComingSoon ? 'cursor-default' : 'cursor-pointer'}`}>
      <div className="relative w-full transition-transform duration-300 group-hover:scale-105">
        {/* Poster Container */}
        <div className="aspect-[2/3] relative rounded-lg overflow-hidden shadow-xl">
          {/* Thumbnail */}
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== '/placeholder-course.jpg') {
                target.src = '/placeholder-course.jpg';
              }
            }}
            onLoad={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.opacity = '1';
            }}
            style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
          />

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-100"></div>

          {/* Coming Soon Overlay */}
          {isComingSoon && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-black bg-opacity-50">
              <div className="bg-yellow-600 text-white px-4 py-2 rounded-lg shadow-lg">
                <Clock className="h-6 w-6 inline mr-2" />
                <span className="font-semibold">Coming Soon</span>
              </div>
            </div>
          )}

          {/* Red Circular Play Button - Center Overlay */}
          {isPlayable && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="bg-red-600 text-white rounded-full p-4 shadow-2xl transform transition-all duration-300 group-hover:scale-110 opacity-100 border-2 border-white">
                <Play className="h-8 w-8 ml-1" fill="currentColor" />
              </div>
            </div>
          )}

          {/* Course Information */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="text-white font-bold text-base leading-tight mb-1 line-clamp-2">{title}</h3>
            <div className="flex items-center space-x-2 mb-2">
              <img
                src={instructorImage}
                alt={instructorName}
                className="w-5 h-5 rounded-full object-cover"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== '/placeholder-avatar.jpg') {
                    target.src = '/placeholder-avatar.jpg';
                  }
                }}
                onLoad={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.opacity = '1';
                }}
                style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
              />
              <p className="text-gray-300 text-sm font-medium line-clamp-1">{instructorName}</p>
            </div>
            {/* Course Status Indicator */}
            {course.lessons && course.lessons.length > 0 ? (
              <div className="flex items-center space-x-1">
                <Play className="h-3 w-3 text-red-500" />
                <span className="text-red-500 text-xs font-medium">
                  {course.lessons.length} Lesson{course.lessons.length !== 1 ? 's' : ''}
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3 text-yellow-500" />
                <span className="text-yellow-500 text-xs font-medium">Coming Soon</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;