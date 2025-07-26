# Enhanced Search and Recommendation System

## Overview

This document describes the implementation of a comprehensive search and recommendation system for the Forward Africa learning platform. The system includes full-text search across course content and transcripts, advanced filtering capabilities, search suggestions and autocomplete, and a recommendation engine with collaborative filtering.

## Features Implemented

### 1. Full-Text Search Across Course Content and Transcripts

#### Frontend Components
- **AdvancedSearch.tsx**: Advanced search component with autocomplete and filtering
- **EnhancedSearchPage.tsx**: Complete search page with results display
- **searchService.ts**: Full-text search service with relevance scoring

#### Backend API Endpoints
- `GET /api/search`: Main search endpoint with full-text capabilities
- `GET /api/search/suggestions`: Autocomplete suggestions
- `GET /api/search/popular`: Popular searches
- `GET /api/search/analytics`: Search analytics

#### Database Schema Updates
- Added `full_text_content` field to courses and lessons tables
- Created `transcripts` table for detailed transcript storage
- Added search-specific indexes for performance optimization

### 2. Advanced Filtering by Multiple Criteria

#### Filter Options
- **Category**: Filter by course category
- **Instructor**: Filter by specific instructor
- **Difficulty**: Beginner, Intermediate, Advanced
- **Duration**: Time-based filtering (0-1h, 1-3h, 3-6h, 6+h)
- **Rating**: Minimum rating threshold
- **Language**: Course language filtering
- **Tags**: Multiple tag selection
- **Content Features**: Has transcript, has subtitles, is free, is featured

#### Implementation
```typescript
interface SearchFilters {
  category?: string;
  instructor?: string;
  difficulty?: string;
  duration?: string;
  rating?: number;
  language?: string;
  tags?: string[];
  hasTranscript?: boolean;
  hasSubtitles?: boolean;
  isFree?: boolean;
  isFeatured?: boolean;
}
```

### 3. Search Suggestions and Autocomplete

#### Features
- **Real-time suggestions**: As you type
- **Recent searches**: User's search history
- **Popular searches**: Trending queries
- **Smart categorization**: Course, instructor, category, tag suggestions

#### Implementation
```typescript
interface SearchSuggestion {
  id: string;
  text: string;
  type: 'course' | 'instructor' | 'category' | 'tag';
  relevance: number;
}
```

### 4. Recommendation Engine with Collaborative Filtering

#### Recommendation Types
- **Personalized**: Based on user interests and learning history
- **Collaborative**: Based on similar users' preferences
- **Content-based**: Based on course content similarity
- **Popular**: Most popular courses
- **Trending**: Currently trending courses

#### Implementation
```typescript
interface RecommendationScore {
  course: Course;
  score: number;
  reason: string;
  type: 'collaborative' | 'content' | 'popular' | 'trending' | 'personalized';
}
```

## Technical Architecture

### Frontend Architecture

#### Components Structure
```
src/
├── components/ui/
│   ├── AdvancedSearch.tsx          # Advanced search with filters
│   └── RecommendationEngine.tsx    # Recommendation engine
├── lib/
│   └── searchService.ts            # Search service
└── pages/
    └── EnhancedSearchPage.tsx      # Main search page
```

#### Key Features
- **Debounced search**: Prevents excessive API calls
- **Real-time suggestions**: Instant feedback
- **Advanced filtering**: Multiple filter combinations
- **Sorting options**: Relevance, popularity, rating, date, title
- **Pagination**: Efficient result loading
- **Search analytics**: Insights into search behavior

### Backend Architecture

#### API Endpoints
```javascript
// Main search endpoint
GET /api/search?q=query&category=id&difficulty=beginner&sortBy=relevance

// Search suggestions
GET /api/search/suggestions?q=query&limit=8

// Popular searches
GET /api/search/popular?limit=10

// Search analytics
GET /api/search/analytics?query=query
```

#### Database Schema
```sql
-- Enhanced courses table
ALTER TABLE courses ADD COLUMN (
  difficulty ENUM('beginner', 'intermediate', 'advanced'),
  duration VARCHAR(20),
  language VARCHAR(50),
  rating DECIMAL(3,2),
  popularity INT,
  tags JSON,
  search_keywords TEXT,
  full_text_content LONGTEXT
);

-- Transcripts table
CREATE TABLE transcripts (
  id VARCHAR(36) PRIMARY KEY,
  lesson_id VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  language VARCHAR(10),
  confidence DECIMAL(5,4)
);

-- Search analytics
CREATE TABLE search_analytics (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36),
  query TEXT NOT NULL,
  results_count INT,
  search_filters JSON
);

-- User recommendations
CREATE TABLE user_recommendations (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  course_id VARCHAR(36) NOT NULL,
  recommendation_type ENUM('collaborative', 'content', 'popular', 'trending'),
  score DECIMAL(5,4)
);
```

## Search Algorithm

### Relevance Scoring
The search system uses a multi-factor relevance scoring algorithm:

1. **Title Matches**: 10 points per match
2. **Description Matches**: 5 points per match
3. **Content Matches**: 3 points per match
4. **Tag Matches**: 1.5 points per match
5. **Transcript Matches**: 0.8 points per match

### Collaborative Filtering
```typescript
// Find similar users based on course completion patterns
const findSimilarUsers = (userId: string): UserSimilarity[] => {
  const currentUserCourses = getUserCompletedCourses(userId);

  return allUsers
    .filter(user => user.id !== userId)
    .map(user => {
      const commonCourses = user.completedCourses.filter(courseId =>
        currentUserCourses.includes(courseId)
      );

      const similarity = commonCourses.length /
        Math.max(currentUserCourses.length, user.completedCourses.length);

      return { userId: user.id, similarity, commonCourses };
    })
    .filter(user => user.similarity > 0)
    .sort((a, b) => b.similarity - a.similarity);
};
```

### Content-Based Filtering
```typescript
// Recommend based on user interests and completed courses
const getContentBasedRecommendations = (): RecommendationScore[] => {
  const userCompletedCourses = getUserCompletedCourses(currentUser.id);
  const userInterests = currentUser.topics_of_interest;

  return courses
    .filter(course => !userCompletedCourses.includes(course.id))
    .map(course => {
      let score = 0;
      let reasons: string[] = [];

      // Category match
      if (userCompletedCourses.some(completed =>
        completed.category === course.category)) {
        score += 0.3;
        reasons.push('Similar to courses you completed');
      }

      // Interest match
      if (userInterests.some(interest =>
        course.description.toLowerCase().includes(interest.toLowerCase()))) {
        score += 0.3;
        reasons.push('Matches your interests');
      }

      return { course, score, reason: reasons.join(', '), type: 'content' };
    })
    .filter(rec => rec.score > 0)
    .sort((a, b) => b.score - a.score);
};
```

## Performance Optimizations

### Database Indexes
```sql
-- Full-text search indexes
ALTER TABLE courses ADD FULLTEXT(title, description, search_keywords, full_text_content);
ALTER TABLE lessons ADD FULLTEXT(title, description, search_keywords, full_text_content);
ALTER TABLE transcripts ADD FULLTEXT(content);

-- Performance indexes
CREATE INDEX idx_courses_search ON courses(title, description, search_keywords);
CREATE INDEX idx_courses_difficulty ON courses(difficulty);
CREATE INDEX idx_courses_rating ON courses(rating);
CREATE INDEX idx_courses_popularity ON courses(popularity);
```

### Caching Strategy
- **Search results**: Cache for 5 minutes
- **Suggestions**: Cache for 10 minutes
- **Popular searches**: Cache for 1 hour
- **User recommendations**: Cache for 30 minutes

### Query Optimization
```sql
-- Optimized search query with relevance scoring
SELECT
  'course' as type,
  c.id,
  c.title,
  c.description,
  (
    CASE WHEN c.title LIKE ? THEN 10 ELSE 0 END +
    CASE WHEN c.description LIKE ? THEN 5 ELSE 0 END +
    CASE WHEN c.search_keywords LIKE ? THEN 3 ELSE 0 END
  ) as relevance_score
FROM courses c
WHERE (
  c.title LIKE ? OR
  c.description LIKE ? OR
  c.search_keywords LIKE ?
)
ORDER BY relevance_score DESC
LIMIT 20;
```

## User Experience Features

### Search Interface
- **Smart autocomplete**: Real-time suggestions
- **Advanced filters**: Collapsible filter panel
- **Search history**: Recent searches
- **Popular searches**: Trending queries
- **Search analytics**: Results insights

### Results Display
- **Multi-type results**: Courses, instructors, lessons, transcripts
- **Relevance highlighting**: Show where matches were found
- **Sorting options**: Multiple sort criteria
- **Filter tabs**: Filter by result type
- **Pagination**: Efficient browsing

### Recommendation Display
- **Personalized tabs**: For You, Trending, Popular, Similar Users
- **Recommendation reasons**: Explain why courses are recommended
- **Visual indicators**: Recommendation badges
- **Analytics insights**: Recommendation statistics

## Analytics and Insights

### Search Analytics
```typescript
interface SearchAnalytics {
  totalSearches: number;
  queryCount: number;
  popularQueries: Array<{ query: string; count: number }>;
  searchTrends: Array<{ date: string; searches: number }>;
  topCategories: Array<{ name: string; count: number }>;
  topInstructors: Array<{ name: string; count: number }>;
}
```

### Recommendation Analytics
```typescript
interface RecommendationAnalytics {
  totalRecommendations: number;
  averageScore: number;
  categories: number;
  instructors: number;
  clickThroughRate: number;
}
```

## Security Considerations

### Input Validation
- **Query sanitization**: Prevent SQL injection
- **Filter validation**: Validate filter parameters
- **Rate limiting**: Prevent search abuse
- **User authentication**: Secure user-specific data

### Data Privacy
- **Search history**: User-controlled storage
- **Analytics anonymization**: Aggregate data only
- **Recommendation privacy**: Secure user preferences

## Future Enhancements

### Planned Features
1. **Voice search**: Speech-to-text search capability
2. **Image search**: Search by course thumbnails
3. **Semantic search**: AI-powered understanding
4. **Multi-language support**: Search in multiple languages
5. **Advanced analytics**: Deep learning insights

### Technical Improvements
1. **Elasticsearch integration**: Advanced search engine
2. **Redis caching**: Improved performance
3. **Machine learning**: Better recommendations
4. **Real-time updates**: Live search results
5. **Mobile optimization**: Touch-friendly interface

## Usage Examples

### Basic Search
```typescript
// Search for business courses
const results = await searchService.search({
  query: 'business fundamentals',
  limit: 20,
  sortBy: 'relevance'
});
```

### Advanced Filtering
```typescript
// Search with multiple filters
const results = await searchService.search({
  query: 'marketing',
  filters: {
    category: 'business',
    difficulty: 'intermediate',
    rating: 4,
    hasTranscript: true
  },
  sortBy: 'rating',
  sortOrder: 'desc'
});
```

### Getting Recommendations
```typescript
// Get personalized recommendations
const recommendations = await recommendationEngine.getRecommendations({
  userId: 'user123',
  type: 'personalized',
  limit: 10
});
```

## Testing

### Unit Tests
```typescript
describe('SearchService', () => {
  test('should return relevant results for business query', async () => {
    const results = await searchService.search({ query: 'business' });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].relevance).toBeGreaterThan(0);
  });
});
```

### Integration Tests
```typescript
describe('Search API', () => {
  test('should handle advanced filtering', async () => {
    const response = await request(app)
      .get('/api/search')
      .query({
        q: 'marketing',
        category: 'business',
        difficulty: 'intermediate'
      });

    expect(response.status).toBe(200);
    expect(response.body.results).toBeDefined();
  });
});
```

## Deployment

### Environment Variables
```bash
# Search configuration
SEARCH_CACHE_TTL=300
SEARCH_SUGGESTION_LIMIT=8
SEARCH_RESULT_LIMIT=50

# Recommendation configuration
RECOMMENDATION_CACHE_TTL=1800
RECOMMENDATION_LIMIT=12
COLLABORATIVE_FILTERING_ENABLED=true

# Database configuration
DB_SEARCH_INDEX_ENABLED=true
DB_FULLTEXT_ENABLED=true
```

### Performance Monitoring
- **Search response time**: Target < 200ms
- **Suggestion response time**: Target < 100ms
- **Recommendation generation time**: Target < 500ms
- **Cache hit rate**: Target > 80%

## Conclusion

The enhanced search and recommendation system provides a comprehensive solution for course discovery and personalized learning experiences. With full-text search capabilities, advanced filtering, intelligent suggestions, and collaborative filtering recommendations, users can easily find relevant content and discover new courses tailored to their interests and learning history.

The system is designed to be scalable, performant, and user-friendly, with extensive analytics and insights to continuously improve the search and recommendation quality.