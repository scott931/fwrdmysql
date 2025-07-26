import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, Users, Star, Clock, BookOpen, Target, Zap } from 'lucide-react';
import { Course, UserProgress, User } from '../../types';
import CourseCard from './CourseCard';

interface RecommendationEngineProps {
  courses: Course[];
  userProgress: UserProgress[];
  currentUser: User | null;
  onCourseSelect: (course: Course) => void;
}

interface RecommendationScore {
  course: Course;
  score: number;
  reason: string;
  type: 'collaborative' | 'content' | 'popular' | 'trending' | 'personalized';
}

interface UserSimilarity {
  userId: string;
  similarity: number;
  commonCourses: string[];
}

const RecommendationEngine: React.FC<RecommendationEngineProps> = ({
  courses,
  userProgress,
  currentUser,
  onCourseSelect
}) => {
  const [recommendations, setRecommendations] = useState<RecommendationScore[]>([]);
  const [activeTab, setActiveTab] = useState<'personalized' | 'trending' | 'popular' | 'similar'>('personalized');
  const [isLoading, setIsLoading] = useState(false);

  // Mock user data for collaborative filtering (in real app, this would come from backend)
  const mockUsers = useMemo(() => [
    {
      id: 'user1',
      interests: ['business', 'entrepreneurship', 'finance'],
      completedCourses: ['course1', 'course3'],
      inProgressCourses: ['course2']
    },
    {
      id: 'user2',
      interests: ['technology', 'programming', 'data-science'],
      completedCourses: ['course2', 'course4'],
      inProgressCourses: ['course1']
    },
    {
      id: 'user3',
      interests: ['business', 'leadership', 'management'],
      completedCourses: ['course1', 'course5'],
      inProgressCourses: ['course3']
    }
  ], []);

  // Calculate course popularity based on user progress
  const coursePopularity = useMemo(() => {
    const popularity: Record<string, number> = {};

    courses.forEach(course => {
      const progressCount = userProgress.filter(p => p.courseId === course.id).length;
      const completionCount = userProgress.filter(p => p.courseId === course.id && p.completed).length;
      popularity[course.id] = (progressCount * 0.3) + (completionCount * 0.7);
    });

    return popularity;
  }, [courses, userProgress]);

  // Calculate course ratings (mock data)
  const courseRatings = useMemo(() => {
    const ratings: Record<string, { average: number; count: number }> = {};

    courses.forEach(course => {
      // Mock ratings between 3.5 and 5.0
      ratings[course.id] = {
        average: 3.5 + Math.random() * 1.5,
        count: Math.floor(Math.random() * 100) + 10
      };
    });

    return ratings;
  }, [courses]);

  // Collaborative filtering: Find similar users
  const findSimilarUsers = (userId: string): UserSimilarity[] => {
    if (!currentUser) return [];

    const currentUserProgress = userProgress.filter(p => p.courseId);
    const currentUserCourses = currentUserProgress.map(p => p.courseId);

    return mockUsers
      .filter(user => user.id !== userId)
      .map(user => {
        const commonCourses = user.completedCourses.filter(courseId =>
          currentUserCourses.includes(courseId)
        );

        const similarity = commonCourses.length / Math.max(currentUserCourses.length, user.completedCourses.length);

        return {
          userId: user.id,
          similarity,
          commonCourses
        };
      })
      .filter(user => user.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity);
  };

  // Content-based filtering: Recommend based on user interests and completed courses
  const getContentBasedRecommendations = (): RecommendationScore[] => {
    if (!currentUser) return [];

    const userCompletedCourses = userProgress
      .filter(p => p.completed)
      .map(p => courses.find(c => c.id === p.courseId))
      .filter(Boolean) as Course[];

    const userInterests = currentUser.topics_of_interest || [];

    return courses
      .filter(course => !userProgress.some(p => p.courseId === course.id && p.completed))
      .map(course => {
        let score = 0;
        let reasons: string[] = [];

        // Score based on category match with completed courses
        const categoryMatch = userCompletedCourses.some(completed =>
          completed.category === course.category
        );
        if (categoryMatch) {
          score += 0.3;
          reasons.push('Similar to courses you completed');
        }

        // Score based on instructor match
        const instructorMatch = userCompletedCourses.some(completed =>
          completed.instructor.id === course.instructor.id
        );
        if (instructorMatch) {
          score += 0.2;
          reasons.push('From instructor you enjoyed');
        }

        // Score based on user interests
        const interestMatch = userInterests.some(interest =>
          course.description.toLowerCase().includes(interest.toLowerCase()) ||
          course.title.toLowerCase().includes(interest.toLowerCase())
        );
        if (interestMatch) {
          score += 0.3;
          reasons.push('Matches your interests');
        }

        // Score based on course rating
        const rating = courseRatings[course.id];
        if (rating && rating.average >= 4.0) {
          score += 0.2;
          reasons.push('Highly rated by students');
        }

        return {
          course,
          score,
          reason: reasons.join(', '),
          type: 'content' as const
        };
      })
      .filter(rec => rec.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  };

  // Collaborative filtering: Recommend based on similar users
  const getCollaborativeRecommendations = (): RecommendationScore[] => {
    if (!currentUser) return [];

    const similarUsers = findSimilarUsers(currentUser.id);
    const userCompletedCourses = userProgress
      .filter(p => p.completed)
      .map(p => p.courseId);

    const recommendations: Record<string, { score: number; users: string[] }> = {};

    similarUsers.forEach(similarUser => {
      const mockUser = mockUsers.find(u => u.id === similarUser.userId);
      if (!mockUser) return;

      mockUser.completedCourses.forEach(courseId => {
        if (!userCompletedCourses.includes(courseId)) {
          if (!recommendations[courseId]) {
            recommendations[courseId] = { score: 0, users: [] };
          }
          recommendations[courseId].score += similarUser.similarity;
          recommendations[courseId].users.push(similarUser.userId);
        }
      });
    });

    return Object.entries(recommendations)
      .map(([courseId, data]) => {
        const course = courses.find(c => c.id === courseId);
        if (!course) return null;

        return {
          course,
          score: data.score,
          reason: `Liked by ${data.users.length} similar users`,
          type: 'collaborative' as const
        };
      })
      .filter(Boolean) as RecommendationScore[]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  };

  // Trending courses based on recent activity
  const getTrendingRecommendations = (): RecommendationScore[] => {
    const now = Date.now();
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);

    // Mock trending data (in real app, this would be based on recent enrollments/views)
    const trendingScores = courses.map(course => {
      const baseScore = coursePopularity[course.id] || 0;
      const rating = courseRatings[course.id];
      const ratingScore = rating ? rating.average * rating.count : 0;

      // Add some randomness to simulate trending
      const trendingBoost = Math.random() * 0.5;

      return {
        course,
        score: baseScore + ratingScore + trendingBoost,
        reason: 'Trending this week',
        type: 'trending' as const
      };
    });

    return trendingScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  };

  // Popular courses based on overall popularity
  const getPopularRecommendations = (): RecommendationScore[] => {
    return courses
      .map(course => {
        const popularity = coursePopularity[course.id] || 0;
        const rating = courseRatings[course.id];
        const ratingScore = rating ? rating.average * rating.count : 0;

        return {
          course,
          score: popularity + ratingScore,
          reason: `Popular with ${Math.floor(popularity + ratingScore)} students`,
          type: 'popular' as const
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  };

  // Generate recommendations based on active tab
  useEffect(() => {
    setIsLoading(true);

    setTimeout(() => {
      let newRecommendations: RecommendationScore[] = [];

      switch (activeTab) {
        case 'personalized':
          const contentBased = getContentBasedRecommendations();
          const collaborative = getCollaborativeRecommendations();

          // Combine and deduplicate recommendations
          const allPersonalized = [...contentBased, ...collaborative];
          const courseMap = new Map();

          allPersonalized.forEach(rec => {
            const existing = courseMap.get(rec.course.id);
            if (!existing || rec.score > existing.score) {
              courseMap.set(rec.course.id, rec);
            }
          });

          newRecommendations = Array.from(courseMap.values())
            .sort((a, b) => b.score - a.score)
            .slice(0, 12);
          break;

        case 'trending':
          newRecommendations = getTrendingRecommendations();
          break;

        case 'popular':
          newRecommendations = getPopularRecommendations();
          break;

        case 'similar':
          newRecommendations = getCollaborativeRecommendations();
          break;
      }

      setRecommendations(newRecommendations);
      setIsLoading(false);
    }, 500);
  }, [activeTab, courses, userProgress, currentUser]);

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'personalized': return <Target className="h-4 w-4" />;
      case 'trending': return <TrendingUp className="h-4 w-4" />;
      case 'popular': return <Star className="h-4 w-4" />;
      case 'similar': return <Users className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getTabDescription = (tab: string) => {
    switch (tab) {
      case 'personalized': return 'Based on your interests and learning history';
      case 'trending': return 'Courses gaining popularity this week';
      case 'popular': return 'Most popular courses among all students';
      case 'similar': return 'Liked by users similar to you';
      default: return '';
    }
  };

  return (
    <div className="w-full">
      {/* Recommendation Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
          {[
            { key: 'personalized', label: 'For You' },
            { key: 'trending', label: 'Trending' },
            { key: 'popular', label: 'Popular' },
            { key: 'similar', label: 'Similar Users' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                activeTab === tab.key
                  ? 'bg-red-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {getTabIcon(tab.key)}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <p className="mt-2 text-sm text-gray-400 text-center">
          {getTabDescription(activeTab)}
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          <span className="ml-3 text-gray-400">Finding recommendations...</span>
        </div>
      )}

      {/* Recommendations Grid */}
      {!isLoading && recommendations.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {recommendations.map((recommendation, index) => (
            <div key={recommendation.course.id} className="relative group">
              <CourseCard course={recommendation.course} />

              {/* Recommendation Badge */}
              <div className="absolute top-2 left-2 z-10">
                <div className="bg-red-600 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                  <Zap className="h-3 w-3" />
                  <span>#{index + 1}</span>
                </div>
              </div>

              {/* Recommendation Reason */}
              <div className="absolute bottom-2 left-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/80 text-white text-xs p-2 rounded">
                  {recommendation.reason}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && recommendations.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No recommendations found</h3>
          <p className="text-gray-400">
            Try completing more courses to get personalized recommendations.
          </p>
        </div>
      )}

      {/* Recommendation Stats */}
      {!isLoading && recommendations.length > 0 && (
        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Recommendation Insights</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-white font-semibold">{recommendations.length}</div>
              <div className="text-gray-400">Courses Recommended</div>
            </div>
            <div className="text-center">
              <div className="text-white font-semibold">
                {Math.round(recommendations.reduce((sum, r) => sum + r.score, 0) / recommendations.length * 100) / 100}
              </div>
              <div className="text-gray-400">Average Score</div>
            </div>
            <div className="text-center">
              <div className="text-white font-semibold">
                {new Set(recommendations.map(r => r.course.category)).size}
              </div>
              <div className="text-gray-400">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-white font-semibold">
                {new Set(recommendations.map(r => r.course.instructor.id)).size}
              </div>
              <div className="text-gray-400">Instructors</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationEngine;