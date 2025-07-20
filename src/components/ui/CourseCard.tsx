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

interface CourseCardProps {
  /** Course data to display */
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
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
      }
    }
  } catch (error) {
    console.error('Error accessing instructor data:', error);
    instructorName = 'Unknown Instructor';
    instructorImage = '/placeholder-avatar.jpg';
  }



  return (
    <Link href={`/course/${courseId}`} className="group">
      <div className="relative w-full transition-transform duration-300 group-hover:scale-105">
        {/* Poster Container */}
        <div className="aspect-[2/3] relative rounded-lg overflow-hidden shadow-xl">
          {/* Thumbnail */}
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-course.jpg';
            }}
          />

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-100"></div>

          {/* Course Information */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="text-white font-bold text-base leading-tight mb-1 line-clamp-2">{title}</h3>
            <div className="flex items-center space-x-2">
              <img
                src={instructorImage}
                alt={instructorName}
                className="w-5 h-5 rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-avatar.jpg';
                }}
              />
              <p className="text-gray-300 text-sm font-medium line-clamp-1">{instructorName}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;