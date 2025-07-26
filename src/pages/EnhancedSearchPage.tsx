import React, { useState, useEffect } from 'react';
import { useSearchParams } from '../lib/router';
import { Search as SearchIcon, Filter, TrendingUp, BookOpen, Users, FileText, Star, Clock, Zap } from 'lucide-react';
import { getAllCourses, getAllCategories, getAllInstructors } from '../data/mockData';
import { Course, Instructor, Category, User, UserProgress } from '../types';
import CourseCard from '../components/ui/CourseCard';
import InstructorCard from '../components/ui/InstructorCard';
import AdvancedSearch from '../components/ui/AdvancedSearch';
import RecommendationEngine from '../components/ui/RecommendationEngine';
import Layout from '../components/layout/Layout';
import searchService, { SearchResult, SearchFilters } from '../lib/searchService';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'course' | 'instructor' | 'category' | 'tag';
  relevance: number;
}

const EnhancedSearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  // State management
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [sortBy, setSortBy] = useState<'relevance' | 'popularity' | 'rating' | 'date' | 'title'>('relevance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Data sources
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allInstructors, setAllInstructors] = useState<Instructor[]>([]);

  // Mock user data (in real app, this would come from auth context)
  const [currentUser] = useState<User | null>({
    id: 'user1',
    email: 'user@example.com',
    full_name: 'John Doe',
    role: 'user',
    permissions: ['courses:view'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true,
    onboarding_completed: true,
    topics_of_interest: ['business', 'entrepreneurship', 'technology']
  });

  // Mock user progress (in real app, this would come from user progress API)
  const [userProgress] = useState<UserProgress[]>([
    {
      courseId: 'course1',
      lessonId: 'lesson1',
      completed: true,
      progress: 100,
      lastWatched: new Date().toISOString(),
      xpEarned: 100,
      completedLessons: ['lesson1']
    }
  ]);

  // Initialize data and search service
  useEffect(() => {
    const courses = getAllCourses();
    const categories = getAllCategories();
    const instructors = getAllInstructors();

    setAllCourses(courses);
    setAllCategories(categories);
    setAllInstructors(instructors);

    // Initialize search service with data
    searchService.setData(courses, instructors, categories);
  }, []);

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedCourses = getAllCourses();
      const updatedCategories = getAllCategories();
      const updatedInstructors = getAllInstructors();

      setAllCourses(updatedCourses);
      setAllCategories(updatedCategories);
      setAllInstructors(updatedInstructors);

      searchService.setData(updatedCourses, updatedInstructors, updatedCategories);

      // Re-run search if there's an active query
      if (searchQuery) {
        performSearch(searchQuery, searchFilters);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('coursesUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('coursesUpdated', handleStorageChange);
    };
  }, [searchQuery, searchFilters]);

  // Perform search with full-text capabilities
  const performSearch = async (query: string, filters: SearchFilters = {}) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowRecommendations(true);
      return;
    }

    setIsLoading(true);
    setShowRecommendations(false);

    try {
      const results = await searchService.search({
        query,
        filters,
        limit: 50,
        sortBy,
        sortOrder
      });

      setSearchResults(results);
      setSearchParams({ q: query });
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search from advanced search component
  const handleSearch = (query: string, filters: SearchFilters) => {
    setSearchQuery(query);
    setSearchFilters(filters);
    performSearch(query, filters);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.text);
    performSearch(suggestion.text, searchFilters);
  };

  // Handle course selection from recommendations
  const handleCourseSelect = (course: Course) => {
    // Navigate to course page
    window.location.href = `/course/${course.id}`;
  };

  // Group results by type
  const groupedResults = {
    courses: searchResults.filter(r => r.type === 'course'),
    instructors: searchResults.filter(r => r.type === 'instructor'),
    lessons: searchResults.filter(r => r.type === 'lesson'),
    transcripts: searchResults.filter(r => r.type === 'transcript')
  };

  // Get result count by type
  const getResultCount = (type: string) => {
    return searchResults.filter(r => r.type === type).length;
  };

  // Get total results count
  const totalResults = searchResults.length;

  // Render search result item
  const renderSearchResult = (result: SearchResult) => {
    switch (result.type) {
      case 'course':
        const course = allCourses.find(c => c.id === result.id);
        if (course) {
          return (
            <div key={result.id} className="relative">
              <CourseCard course={course} />
              {result.highlights.length > 0 && (
                <div className="mt-2 p-2 bg-gray-800 rounded text-sm text-gray-300">
                  <div className="font-medium mb-1">Found in:</div>
                  {result.highlights.slice(0, 2).map((highlight, index) => (
                    <div key={index} className="text-xs mb-1">
                      {highlight}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        }
        return null;

      case 'instructor':
        const instructor = allInstructors.find(i => i.id === result.id);
        if (instructor) {
          return (
            <div key={result.id} className="relative">
              <InstructorCard instructor={instructor} />
              {result.highlights.length > 0 && (
                <div className="mt-2 p-2 bg-gray-800 rounded text-sm text-gray-300">
                  <div className="font-medium mb-1">Found in:</div>
                  {result.highlights.slice(0, 2).map((highlight, index) => (
                    <div key={index} className="text-xs mb-1">
                      {highlight}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        }
        return null;

      case 'lesson':
        return (
          <div key={result.id} className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <BookOpen className="h-6 w-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium">{result.title}</h3>
                <p className="text-gray-400 text-sm mt-1">{result.description}</p>
                <p className="text-gray-500 text-xs mt-2">
                  From: {result.metadata.courseTitle}
                </p>
                {result.highlights.length > 0 && (
                  <div className="mt-2 text-xs text-gray-300">
                    {result.highlights[0]}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'transcript':
        return (
          <div key={result.id} className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium">{result.title}</h3>
                <p className="text-gray-400 text-sm mt-1">{result.description}</p>
                <p className="text-gray-500 text-xs mt-2">
                  From: {result.metadata.courseTitle}
                </p>
                {result.highlights.length > 0 && (
                  <div className="mt-2 text-xs text-gray-300">
                    {result.highlights[0]}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 py-8">
        {/* Search Header */}
        <div className="mb-12">
          <h1 className="text-white text-4xl font-bold mb-8">Advanced Search</h1>

          {/* Advanced Search Component */}
          <AdvancedSearch
            onSearch={handleSearch}
            onSuggestionSelect={handleSuggestionSelect}
            courses={allCourses}
            instructors={allInstructors}
            categories={allCategories}
            isLoading={isLoading}
          />
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div className="mb-8">
            {/* Results Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
              <div>
                <h2 className="text-white text-2xl font-bold">
                  Search Results for "{searchQuery}"
                </h2>
                <p className="text-gray-400 mt-1">
                  {totalResults} results found
                </p>
              </div>

              {/* Sort Options */}
              <div className="flex items-center space-x-4">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as any);
                    if (searchQuery) {
                      performSearch(searchQuery, searchFilters);
                    }
                  }}
                  className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="relevance">Relevance</option>
                  <option value="popularity">Popularity</option>
                  <option value="rating">Rating</option>
                  <option value="date">Date</option>
                  <option value="title">Title</option>
                </select>

                <button
                  onClick={() => {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    if (searchQuery) {
                      performSearch(searchQuery, searchFilters);
                    }
                  }}
                  className="p-2 bg-gray-800 border border-gray-700 rounded-md text-white hover:bg-gray-700 transition-colors"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 rounded-full whitespace-nowrap flex items-center space-x-2 ${
                  activeFilter === 'all'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <SearchIcon className="h-4 w-4" />
                <span>All ({totalResults})</span>
              </button>
              <button
                onClick={() => setActiveFilter('courses')}
                className={`px-4 py-2 rounded-full whitespace-nowrap flex items-center space-x-2 ${
                  activeFilter === 'courses'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span>Courses ({getResultCount('course')})</span>
              </button>
              <button
                onClick={() => setActiveFilter('instructors')}
                className={`px-4 py-2 rounded-full whitespace-nowrap flex items-center space-x-2 ${
                  activeFilter === 'instructors'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Instructors ({getResultCount('instructor')})</span>
              </button>
              <button
                onClick={() => setActiveFilter('lessons')}
                className={`px-4 py-2 rounded-full whitespace-nowrap flex items-center space-x-2 ${
                  activeFilter === 'lessons'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Lessons ({getResultCount('lesson')})</span>
              </button>
              <button
                onClick={() => setActiveFilter('transcripts')}
                className={`px-4 py-2 rounded-full whitespace-nowrap flex items-center space-x-2 ${
                  activeFilter === 'transcripts'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Transcripts ({getResultCount('transcript')})</span>
              </button>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                <span className="ml-3 text-gray-400">Searching...</span>
              </div>
            )}

            {/* Results Grid */}
            {!isLoading && totalResults > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {searchResults
                  .filter(result => {
                    if (activeFilter === 'all') return true;
                    return result.type === activeFilter.slice(0, -1); // Remove 's' from end
                  })
                  .map(renderSearchResult)}
              </div>
            )}

            {/* No Results */}
            {!isLoading && totalResults === 0 && (
              <div className="text-center py-20">
                <SearchIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-white text-2xl font-medium mb-4">No results found</h3>
                <p className="text-gray-400 max-w-md mx-auto mb-8">
                  We couldn't find anything matching "{searchQuery}". Try adjusting your search terms or browse our recommendations.
                </p>
                <button
                  onClick={() => setShowRecommendations(true)}
                  className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors"
                >
                  View Recommendations
                </button>
              </div>
            )}
          </div>
        )}

        {/* Recommendations Section */}
        {(!searchQuery || showRecommendations) && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-2xl font-bold">Recommended for You</h2>
              <div className="flex items-center space-x-2 text-gray-400">
                <Zap className="h-4 w-4" />
                <span className="text-sm">AI-Powered Recommendations</span>
              </div>
            </div>

            <RecommendationEngine
              courses={allCourses}
              userProgress={userProgress}
              currentUser={currentUser}
              onCourseSelect={handleCourseSelect}
            />
          </div>
        )}

        {/* Search Analytics */}
        {searchQuery && totalResults > 0 && (
          <div className="mt-12 p-6 bg-gray-800 rounded-lg">
            <h3 className="text-white text-lg font-semibold mb-4">Search Insights</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-white font-semibold">{totalResults}</div>
                <div className="text-gray-400">Total Results</div>
              </div>
              <div className="text-center">
                <div className="text-white font-semibold">
                  {Math.round(searchResults.reduce((sum, r) => sum + r.relevance, 0) / totalResults * 100) / 100}
                </div>
                <div className="text-gray-400">Avg Relevance</div>
              </div>
              <div className="text-center">
                <div className="text-white font-semibold">
                  {new Set(searchResults.map(r => r.type)).size}
                </div>
                <div className="text-gray-400">Content Types</div>
              </div>
              <div className="text-center">
                <div className="text-white font-semibold">
                  {searchResults.filter(r => r.type === 'course').length}
                </div>
                <div className="text-gray-400">Courses Found</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EnhancedSearchPage;