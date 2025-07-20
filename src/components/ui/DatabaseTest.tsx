import React, { useEffect, useState } from 'react';
import { useCourses, useAnalytics } from '../../hooks/useDatabase';

const DatabaseTest: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  const {
    courses,
    featuredCourses,
    loading: coursesLoading,
    error: coursesError,
    fetchAllCourses,
    fetchFeaturedCourses
  } = useCourses();

  const {
    stats: platformStats,
    loading: statsLoading,
    fetchPlatformStats
  } = useAnalytics();

  useEffect(() => {
    fetchAllCourses();
    fetchFeaturedCourses();
    fetchPlatformStats();
  }, [fetchAllCourses, fetchFeaturedCourses, fetchPlatformStats]);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-700"
      >
        {isVisible ? 'Hide' : 'Show'} DB Test
      </button>

      {isVisible && (
        <div className="absolute bottom-12 right-0 w-96 bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-xl">
          <h3 className="text-white font-bold mb-3">Database Connection Test</h3>

          {/* Connection Status */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${coursesError ? 'bg-red-500' : 'bg-green-500'}`}></div>
              <span className="text-sm text-gray-300">
                {coursesError ? 'Connection Failed' : 'Connected'}
              </span>
            </div>
          </div>

          {/* Loading States */}
          <div className="mb-4">
            <div className="text-sm text-gray-400 mb-1">Loading States:</div>
            <div className="text-xs text-gray-500">
              Courses: {coursesLoading ? 'Loading...' : 'Loaded'}
            </div>
            <div className="text-xs text-gray-500">
              Stats: {statsLoading ? 'Loading...' : 'Loaded'}
            </div>
          </div>

          {/* Data Counts */}
          <div className="mb-4">
            <div className="text-sm text-gray-400 mb-1">Data Counts:</div>
            <div className="text-xs text-gray-500">
              Total Courses: {courses.length}
            </div>
            <div className="text-xs text-gray-500">
              Featured Courses: {featuredCourses.length}
            </div>
            <div className="text-xs text-gray-500">
              Platform Users: {platformStats?.totalUsers || 'N/A'}
            </div>
          </div>

          {/* Sample Course Data */}
          {courses.length > 0 && (
            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-1">Sample Course:</div>
              <div className="text-xs text-gray-500">
                Title: {courses[0].title}
              </div>
              <div className="text-xs text-gray-500">
                Instructor: {courses[0].instructor?.name || 'N/A'}
              </div>
              <div className="text-xs text-gray-500">
                Category: {courses[0].category}
              </div>
            </div>
          )}

          {/* Error Display */}
          {coursesError && (
            <div className="mb-4">
              <div className="text-sm text-red-400 mb-1">Error:</div>
              <div className="text-xs text-red-300">{coursesError}</div>
            </div>
          )}

          {/* Refresh Button */}
          <button
            onClick={() => {
              fetchAllCourses();
              fetchFeaturedCourses();
              fetchPlatformStats();
            }}
            className="w-full bg-gray-700 text-white px-3 py-1 rounded text-xs hover:bg-gray-600"
          >
            Refresh Data
          </button>
        </div>
      )}
    </div>
  );
};

export default DatabaseTest;