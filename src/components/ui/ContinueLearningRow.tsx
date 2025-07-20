import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { CourseProgress } from '../../types';
import Link from 'next/link';

interface ContinueLearningRowProps {
  /** Array of courses with progress information */
  courses: CourseProgress[];
}

const ContinueLearningRow: React.FC<ContinueLearningRowProps> = ({ courses }) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left'
        ? scrollLeft - clientWidth
        : scrollLeft + clientWidth;

      rowRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
    }
  };

  if (courses.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h2 className="text-white text-lg font-medium mb-3 px-4">Continue Learning</h2>

      <div className="group relative">
        {/* Navigation Buttons */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 bg-black/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 ml-1"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5 text-white" />
        </button>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 bg-black/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 mr-1"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5 text-white" />
        </button>

        {/* Scrollable Content */}
        <div
          ref={rowRef}
          className="grid grid-flow-col auto-cols-[45%] sm:auto-cols-[30%] md:auto-cols-[22%] lg:auto-cols-[18%] xl:auto-cols-[15%] gap-3 overflow-x-scroll scrollbar-hide px-4 py-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/course/${course.id}`}
              className="group"
            >
              <div className="relative w-full transition-transform duration-300 group-hover:scale-105">
                {/* Poster Container */}
                <div className="aspect-[2/3] relative rounded-lg overflow-hidden shadow-xl">
                  {/* Thumbnail */}
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />

                  {/* Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-100"></div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-red-600 rounded-full p-3 transform scale-0 group-hover:scale-100 transition-transform duration-300">
                        <Play className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-white font-bold text-base leading-tight mb-1 line-clamp-2">{course.title}</h3>
                    <p className="text-gray-300 text-sm mb-2 line-clamp-1">{course.currentLesson.title}</p>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-700/50 h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-red-600 h-full transition-all duration-300"
                        style={{ width: `${Math.round(course.progress)}%` }}
                      ></div>
                    </div>
                    <p className="text-gray-300 text-xs mt-1">{Math.round(course.progress)}% complete</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContinueLearningRow;