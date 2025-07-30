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
import { Play, Clock, Star, User, BookOpen, Award, TrendingUp, Users, Calendar, MapPin, Globe, Building2, GraduationCap, Briefcase, Target, Zap, ChevronRight, CheckCircle, AlertTriangle, Info, ExternalLink, Download, Share2, Heart, MessageCircle, Eye, EyeOff, Lock, Unlock, Shield, Crown, Medal, Trophy, Badge, Flag, Rocket, Diamond } from 'lucide-react';
import { Course } from '../../types';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useFavorites } from '../../hooks/useFavorites';

interface CourseCardProps {
  /** Course data to display */
  course: Course;
  showFavoriteButton?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, showFavoriteButton = true }) => {
  const router = useRouter();
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();
  const isFavorited = favorites.some(fav => fav.id === course.id);

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
  const thumbnail = course.thumbnail || '/images/placeholder-course.jpg';

  // DUAL FALLBACK instructor handling - same logic as admin page
  let instructorName = 'Unknown Instructor';
  let instructorImage = '/images/placeholder-avatar.jpg';

  console.log('🔍 CourseCard instructor debug:', {
    courseId: course.id,
    hasInstructorObject: !!course.instructor,
    instructorType: typeof course.instructor,
    instructorObject: course.instructor,
    hasInstructorName: !!(course as any).instructor_name,
    instructorNameValue: (course as any).instructor_name,
    instructorImageValue: (course as any).instructor_image
  });

  try {
    // First: Try to access the transformed instructor object (from useCourses hook)
    if (course.instructor && typeof course.instructor === 'object' && course.instructor !== null) {
      console.log('✅ CourseCard: Using instructor object');
      instructorName = (course.instructor as any).name || 'Unknown Instructor';
      instructorImage = (course.instructor as any).image || '/images/placeholder-avatar.jpg';
    }
    // Second: Fall back to raw API field (direct from API)
    else if ((course as any).instructor_name) {
      console.log('✅ CourseCard: Using instructor_name field');
      instructorName = (course as any).instructor_name || 'Unknown Instructor';
      instructorImage = (course as any).instructor_image || '/images/placeholder-avatar.jpg';
    }
    // Third: Handle string instructor (legacy format)
    else if (typeof course.instructor === 'string') {
      console.log('✅ CourseCard: Using string instructor');
      instructorName = course.instructor;
      instructorImage = '/images/placeholder-avatar.jpg';
    }
    // Fourth: Final fallback
    else {
      console.log('❌ CourseCard: Using final fallback - no instructor data found');
      instructorName = 'Unknown Instructor';
      instructorImage = '/images/placeholder-avatar.jpg';
    }
  } catch (error) {
    console.error('Error accessing instructor data:', error);
    instructorName = 'Unknown Instructor';
    instructorImage = '/images/placeholder-avatar.jpg';
  }

  console.log('🎯 CourseCard final instructor data:', {
    name: instructorName,
    image: instructorImage
  });

  // Check if course is coming soon (only when explicitly marked)
  const isComingSoon = course.comingSoon === true;



  // Check if course is playable (has lessons and not coming soon)
  const isPlayable = course.lessons && course.lessons.length > 0 && !isComingSoon;

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

      // Prevent navigation if already on the target route
      if (router.asPath === lessonUrl) {
        console.log('Already on target lesson, skipping navigation');
        return;
      }

      console.log('Navigating to lesson:', lessonUrl);
      // Use replace to prevent navigation loops
      router.replace(lessonUrl);
    } else {
      console.log('No lessons found, navigating to course page');
      const courseUrl = `/course/${courseId}`;

      // Prevent navigation if already on the target route
      if (router.asPath === courseUrl) {
        console.log('Already on course page, skipping navigation');
        return;
      }

      // Navigate to course page if no lessons
      router.replace(courseUrl);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isFavorited) {
      removeFromFavorites(course.id);
    } else {
      addToFavorites(course.id);
    }
  };

  // Debug logging
  console.log('CourseCard Debug:', {
    courseId,
    title,
    lessonsCount: course.lessons?.length || 0,
    comingSoon: course.comingSoon,
    isComingSoon,
    isPlayable,
    lessons: course.lessons || []
  });

  return (
    <div onClick={handleCardClick} className={`group ${isComingSoon ? 'cursor-default' : 'cursor-pointer'}`}>
      <div className="relative w-full transition-transform duration-300 group-hover:scale-105">
        {/* Poster Container */}
        <div className="aspect-[2/3] relative rounded-lg overflow-hidden shadow-xl">
          {/* Thumbnail */}
          {thumbnail.startsWith('http') ? (
            // Use regular img tag for external URLs to avoid Next.js Image issues
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== '/images/placeholder-course.jpg') {
                  target.src = '/images/placeholder-course.jpg';
                }
              }}
              onLoad={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.opacity = '1';
              }}
              style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
            />
          ) : (
            // Use Next.js Image for local images
            <Image
              src={thumbnail}
              alt={title}
              width={400}
              height={600}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== '/images/placeholder-course.jpg') {
                  target.src = '/images/placeholder-course.jpg';
                }
              }}
              onLoad={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.opacity = '1';
              }}
              style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
            />
          )}

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-100"></div>

          {/* Coming Soon Overlay */}
          {isComingSoon && (
            <div className="absolute inset-0 flex items-center justify-center z-30 bg-black bg-opacity-50">
              <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg border border-yellow-300">
                <Clock className="h-5 w-5 inline mr-2" />
                <span className="font-semibold text-sm">Coming Soon</span>
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

          {/* Coming Soon Badge - Top Left */}
          {isComingSoon && (
            <div className="absolute top-2 left-2 z-20 bg-yellow-500 text-white px-2 py-1 rounded-full shadow-md border border-yellow-300">
              <Clock className="h-3 w-3 inline mr-1" />
              <span className="text-xs font-semibold">SOON</span>
            </div>
          )}

          {/* Favorite Button */}
          {showFavoriteButton && (
            <button
              onClick={handleFavoriteClick}
              className={`absolute top-3 ${isComingSoon ? 'right-3' : 'right-3'} z-20 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors`}
            >
              <Heart
                className={`h-5 w-5 ${isFavorited ? 'text-red-500 fill-current' : 'text-white'}`}
              />
            </button>
          )}

          {/* Course Information */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className={`font-bold text-base leading-tight mb-1 line-clamp-2 ${isComingSoon ? 'text-yellow-100' : 'text-white'}`}>
              {title}
              {isComingSoon && <span className="text-yellow-300 ml-1">⏳</span>}
            </h3>

            {/* Course Description with Tooltip */}
            <div className="relative group">
              <div className="text-sm text-gray-400 line-clamp-1 mb-2">
                {course.description}
              </div>

              {/* Course Description Tooltip */}
              <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 max-w-xs">
                <div className="font-medium text-white mb-1">{title}</div>
                <div className="text-gray-300 text-xs leading-relaxed">{course.description}</div>
                <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>

            <div className="flex items-center space-x-2 mb-2">
              {instructorImage.startsWith('http') ? (
                // Use regular img tag for external URLs
                <img
                  src={instructorImage}
                  alt={instructorName}
                  className="w-5 h-5 rounded-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== '/images/placeholder-avatar.jpg') {
                      target.src = '/images/placeholder-avatar.jpg';
                    }
                  }}
                  onLoad={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.opacity = '1';
                  }}
                  style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
                />
              ) : (
                // Use Next.js Image for local images
                <Image
                  src={instructorImage}
                  alt={instructorName}
                  width={20}
                  height={20}
                  className="w-5 h-5 rounded-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== '/images/placeholder-avatar.jpg') {
                      target.src = '/images/placeholder-avatar.jpg';
                    }
                  }}
                  onLoad={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.opacity = '1';
                  }}
                  style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
                />
              )}
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
              <div className="flex items-center space-x-1 bg-yellow-500/10 px-2 py-1 rounded">
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