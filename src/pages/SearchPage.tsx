import React, { useState, useEffect } from 'react';
import { useSearchParams } from '../lib/router';
import { Search as SearchIcon, X } from 'lucide-react';
import { getAllCourses, getAllCategories, getAllInstructors } from '../data/mockData';
import CourseCard from '../components/ui/CourseCard';
import InstructorCard from '../components/ui/InstructorCard';

/**
 * SearchPage Component
 *
 * Advanced search interface for finding courses and instructors.
 *
 * Features:
 * - Real-time search functionality
 * - Filter by category
 * - Search across courses and instructors
 * - URL query parameter integration
 * - Responsive grid layout
 * - Clear search functionality
 *
 * @component
 * @example
 * ```tsx
 * <SearchPage />
 * ```
 */

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [allCourses, setAllCourses] = useState(getAllCourses());
  const [allCategories, setAllCategories] = useState(getAllCategories());
  const [allInstructors, setAllInstructors] = useState(getAllInstructors());
  const [searchResults, setSearchResults] = useState({
    courses: allCourses,
    instructors: allInstructors,
  });

  // Listen for storage changes to update courses, categories, and instructors
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('Storage changed, updating courses, categories, and instructors...');
      const updatedCourses = getAllCourses();
      const updatedCategories = getAllCategories();
      const updatedInstructors = getAllInstructors();
      setAllCourses(updatedCourses);
      setAllCategories(updatedCategories);
      setAllInstructors(updatedInstructors);

      // Re-run search with updated data
      if (searchQuery) {
        performSearch(searchQuery, updatedCourses, updatedInstructors);
      } else {
        setSearchResults({
          courses: updatedCourses,
          instructors: updatedInstructors,
        });
      }
    };

    // Listen for storage events
    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom events we dispatch
    window.addEventListener('coursesUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('coursesUpdated', handleStorageChange);
    };
  }, [searchQuery]);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = (query: string, coursesToSearch = allCourses, instructorsToSearch = allInstructors) => {
    if (!query.trim()) {
      setSearchResults({
        courses: coursesToSearch,
        instructors: instructorsToSearch,
      });
      return;
    }

    const lowercaseQuery = query.toLowerCase();

    const filteredCourses = coursesToSearch.filter(course =>
      course.title.toLowerCase().includes(lowercaseQuery) ||
      course.description.toLowerCase().includes(lowercaseQuery) ||
      course.instructor.name.toLowerCase().includes(lowercaseQuery) ||
      course.category.toLowerCase().includes(lowercaseQuery)
    );

    const filteredInstructors = instructorsToSearch.filter(instructor =>
      instructor.name.toLowerCase().includes(lowercaseQuery) ||
      instructor.title.toLowerCase().includes(lowercaseQuery) ||
      instructor.bio.toLowerCase().includes(lowercaseQuery) ||
      (instructor.expertise && instructor.expertise.some(skill =>
        skill.toLowerCase().includes(lowercaseQuery)
      ))
    );

    setSearchResults({
      courses: filteredCourses,
      instructors: filteredInstructors,
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
    setSearchParams({ q: searchQuery });
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchParams({});
    setSearchResults({
      courses: allCourses,
      instructors: allInstructors,
    });
  };

  const getCategoryName = (categoryId: string) => {
    const category = allCategories.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
  };

  return (
    <div className="max-w-screen-xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      {/* Search Header */}
      <div className="mb-12">
        <h1 className="text-white text-4xl font-bold mb-8">Search</h1>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="relative max-w-3xl">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for courses, instructors, or topics..."
              className="bg-gray-800 w-full pl-10 pr-16 py-4 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute inset-y-0 right-14 flex items-center pr-3"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-white" />
              </button>
            )}

            <button
              type="submit"
              className="absolute right-0 top-0 h-full px-4 bg-red-600 rounded-r-md text-white font-medium hover:bg-red-700 transition-colors"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-full whitespace-nowrap ${
            activeFilter === 'all'
              ? 'bg-red-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          All Results
        </button>
        <button
          onClick={() => setActiveFilter('courses')}
          className={`px-4 py-2 rounded-full whitespace-nowrap ${
            activeFilter === 'courses'
              ? 'bg-red-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Courses
        </button>
        <button
          onClick={() => setActiveFilter('instructors')}
          className={`px-4 py-2 rounded-full whitespace-nowrap ${
            activeFilter === 'instructors'
              ? 'bg-red-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Instructors
        </button>
        {allCategories.map(category => (
          <button
            key={category.id}
            onClick={() => setActiveFilter(category.id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap ${
              activeFilter === category.id
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Search Results */}
      <div>
        {/* Instructors Section */}
        {(activeFilter === 'all' || activeFilter === 'instructors') && (
          <div className="mb-12">
            <h2 className="text-white text-2xl font-bold mb-6">Instructors</h2>

            {searchResults.instructors.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {searchResults.instructors.map(instructor => (
                  <InstructorCard key={instructor.id} instructor={instructor} />
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No instructors found matching your search.</p>
            )}
          </div>
        )}

        {/* Courses Section */}
        {(activeFilter === 'all' || activeFilter === 'courses' || allCategories.some(c => c.id === activeFilter)) && (
          <div>
            <h2 className="text-white text-2xl font-bold mb-6">
              {activeFilter !== 'all' && activeFilter !== 'courses'
                ? `${getCategoryName(activeFilter)} Courses`
                : 'Courses'}
            </h2>

            {searchResults.courses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {searchResults.courses
                  .filter(course => activeFilter === 'all' || activeFilter === 'courses' || course.category === activeFilter)
                  .map(course => (
                    <CourseCard key={course.id} course={course} />
                  ))}
              </div>
            ) : (
              <p className="text-gray-400">No courses found matching your search.</p>
            )}
          </div>
        )}

        {/* No Results */}
        {searchQuery &&
          activeFilter === 'all' &&
          searchResults.courses.length === 0 &&
          searchResults.instructors.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-white text-2xl font-medium mb-4">No results found</h3>
            <p className="text-gray-400 max-w-md mx-auto mb-8">
              We couldn't find anything matching "{searchQuery}". Try adjusting your search terms or browse our categories.
            </p>
            <button
              onClick={clearSearch}
              className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;