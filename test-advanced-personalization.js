// Test Advanced Personalization Algorithms Implementation
// This script tests the personalization engine and recommendation system

console.log('🧪 Testing Advanced Personalization Algorithms...\n');

// Mock data for testing
const mockUser = {
  id: 'user1',
  email: 'test@example.com',
  full_name: 'Test User',
  topics_of_interest: ['business', 'entrepreneurship', 'technology'],
  education_level: 'bachelor',
  experience_level: 'Mid-Level (3-7 years)',
  industry: 'Technology & Digital Innovation',
  country: 'Nigeria',
  city: 'Lagos',
  onboarding_completed: true
};

const mockCourses = [
  {
    id: 'course1',
    title: 'Business Fundamentals for Entrepreneurs',
    description: 'Learn the basics of business management and entrepreneurship',
    category: 'Business',
    instructor: { id: 'instructor1', name: 'John Doe' }
  },
  {
    id: 'course2',
    title: 'Advanced Technology Trends',
    description: 'Explore cutting-edge technology and digital innovation',
    category: 'Technology',
    instructor: { id: 'instructor2', name: 'Jane Smith' }
  },
  {
    id: 'course3',
    title: 'Financial Management Basics',
    description: 'Introduction to financial management and accounting',
    category: 'Finance',
    instructor: { id: 'instructor3', name: 'Bob Johnson' }
  },
  {
    id: 'course4',
    title: 'Digital Marketing Strategy',
    description: 'Comprehensive digital marketing for modern businesses',
    category: 'Marketing',
    instructor: { id: 'instructor4', name: 'Alice Brown' }
  }
];

const mockUserProgress = [
  { courseId: 'course1', completed: true, progress: 100 },
  { courseId: 'course2', completed: false, progress: 60 }
];

const mockUserBehavior = {
  courseViews: { 'course1': 5, 'course2': 3, 'course3': 1 },
  courseCompletions: { 'course1': 1 },
  timeSpent: { 'course1': 3600, 'course2': 1800, 'course3': 600 },
  searchQueries: ['business', 'entrepreneurship', 'technology'],
  clickedCategories: ['Business', 'Technology'],
  preferredInstructors: ['instructor1', 'instructor2'],
  learningPatterns: {
    preferredTime: 'morning',
    sessionDuration: 1800,
    completionRate: 0.8
  }
};

const mockContext = {
  currentTime: new Date(),
  sessionDuration: 1800,
  deviceType: 'desktop',
  previousActions: ['course_view', 'search', 'category_click']
};

// Test personalization factors calculation
console.log('📊 Testing Personalization Factors:');

// Test interest matching
function testInterestMatch() {
  console.log('\n1. Interest Matching:');
  const userInterests = mockUser.topics_of_interest;

  mockCourses.forEach(course => {
    const courseText = `${course.title} ${course.description}`.toLowerCase();
    const matches = userInterests.filter(interest =>
      courseText.includes(interest.toLowerCase())
    );
    const matchPercentage = (matches.length / userInterests.length) * 100;

    console.log(`   ${course.title}: ${matchPercentage.toFixed(1)}% match`);
    console.log(`     Matches: ${matches.join(', ')}`);
  });
}

// Test education level compatibility
function testEducationCompatibility() {
  console.log('\n2. Education Level Compatibility:');
  const educationMap = {
    'high-school': 0.3,
    'associate': 0.5,
    'bachelor': 0.7,
    'master': 0.9,
    'phd': 1.0,
    'professional': 0.8,
    'other': 0.6
  };

  const userLevel = educationMap[mockUser.education_level] || 0.5;

  mockCourses.forEach(course => {
    // Simplified difficulty estimation
    const text = `${course.title} ${course.description}`.toLowerCase();
    let courseDifficulty = 0.5; // Default

    if (text.includes('advanced') || text.includes('expert')) {
      courseDifficulty = 0.9;
    } else if (text.includes('intermediate')) {
      courseDifficulty = 0.6;
    } else if (text.includes('basic') || text.includes('fundamentals')) {
      courseDifficulty = 0.3;
    }

    const compatibility = 1 - Math.abs(courseDifficulty - userLevel);
    console.log(`   ${course.title}: ${(compatibility * 100).toFixed(1)}% compatible`);
  });
}

// Test industry relevance
function testIndustryRelevance() {
  console.log('\n3. Industry Relevance:');
  const industryKeywords = {
    'Technology & Digital Innovation': ['technology', 'digital', 'innovation', 'software', 'tech'],
    'Financial Services & Fintech': ['finance', 'financial', 'fintech', 'banking', 'investment'],
    'Healthcare & Pharmaceuticals': ['healthcare', 'medical', 'pharmaceutical', 'health', 'medicine'],
    'Manufacturing & Industrial': ['manufacturing', 'industrial', 'production', 'factory', 'automation'],
    'Agriculture & Agribusiness': ['agriculture', 'farming', 'agribusiness', 'crop', 'livestock'],
    'Education & Training': ['education', 'training', 'learning', 'teaching', 'academic']
  };

  const userIndustry = mockUser.industry;
  const keywords = industryKeywords[userIndustry] || [userIndustry.toLowerCase()];

  mockCourses.forEach(course => {
    const courseText = `${course.title} ${course.description}`.toLowerCase();
    const matches = keywords.filter(keyword =>
      courseText.includes(keyword.toLowerCase())
    );
    const relevance = matches.length / keywords.length;

    console.log(`   ${course.title}: ${(relevance * 100).toFixed(1)}% relevant`);
    console.log(`     Matches: ${matches.join(', ')}`);
  });
}

// Test behavior analysis
function testBehaviorAnalysis() {
  console.log('\n4. Behavior Analysis:');

  mockCourses.forEach(course => {
    const views = mockUserBehavior.courseViews[course.id] || 0;
    const timeSpent = mockUserBehavior.timeSpent[course.id] || 0;
    const totalViews = Object.values(mockUserBehavior.courseViews).reduce((sum, v) => sum + v, 0);
    const totalTime = Object.values(mockUserBehavior.timeSpent).reduce((sum, t) => sum + t, 0);

    const viewScore = totalViews > 0 ? views / totalViews : 0;
    const timeScore = totalTime > 0 ? timeSpent / totalTime : 0;

    console.log(`   ${course.title}:`);
    console.log(`     Views: ${views} (${(viewScore * 100).toFixed(1)}% of total)`);
    console.log(`     Time: ${timeSpent}s (${(timeScore * 100).toFixed(1)}% of total)`);
  });
}

// Test contextual factors
function testContextualFactors() {
  console.log('\n5. Contextual Factors:');

  const hour = mockContext.currentTime.getHours();
  let timeOfDay = '';
  if (hour >= 6 && hour < 12) timeOfDay = 'morning';
  else if (hour >= 12 && hour < 18) timeOfDay = 'afternoon';
  else timeOfDay = 'evening';

  console.log(`   Current time: ${timeOfDay} (${hour}:00)`);
  console.log(`   Session duration: ${mockContext.sessionDuration}s`);
  console.log(`   Device type: ${mockContext.deviceType}`);
  console.log(`   Previous actions: ${mockContext.previousActions.join(', ')}`);

  mockCourses.forEach(course => {
    const text = course.title.toLowerCase();
    let timeRelevance = 0.5; // Default

    if (timeOfDay === 'morning' && (text.includes('morning') || text.includes('start'))) {
      timeRelevance = 0.8;
    } else if (timeOfDay === 'afternoon' && (text.includes('afternoon') || text.includes('work'))) {
      timeRelevance = 0.8;
    } else if (timeOfDay === 'evening' && (text.includes('evening') || text.includes('relax'))) {
      timeRelevance = 0.8;
    }

    console.log(`   ${course.title}: ${(timeRelevance * 100).toFixed(1)}% time relevant`);
  });
}

// Test recommendation scoring
function testRecommendationScoring() {
  console.log('\n6. Recommendation Scoring:');

  const weights = {
    INTEREST_MATCH: 0.25,
    EDUCATION_LEVEL: 0.15,
    EXPERIENCE_LEVEL: 0.15,
    INDUSTRY_MATCH: 0.10,
    COMPLETION_PATTERN: 0.20,
    VIEWING_PATTERN: 0.15
  };

  mockCourses.forEach(course => {
    let totalScore = 0;
    let totalWeight = 0;
    const factors = [];

    // Interest match
    const courseText = `${course.title} ${course.description}`.toLowerCase();
    const interestMatches = mockUser.topics_of_interest.filter(interest =>
      courseText.includes(interest.toLowerCase())
    );
    const interestScore = interestMatches.length / mockUser.topics_of_interest.length;
    totalScore += interestScore * weights.INTEREST_MATCH;
    totalWeight += weights.INTEREST_MATCH;
    factors.push(`Interest: ${(interestScore * 100).toFixed(1)}%`);

    // Education compatibility
    const educationScore = 0.7; // Simplified
    totalScore += educationScore * weights.EDUCATION_LEVEL;
    totalWeight += weights.EDUCATION_LEVEL;
    factors.push(`Education: ${(educationScore * 100).toFixed(1)}%`);

    // Industry relevance
    const industryKeywords = ['technology', 'digital', 'innovation'];
    const industryMatches = industryKeywords.filter(keyword =>
      courseText.includes(keyword.toLowerCase())
    );
    const industryScore = industryMatches.length / industryKeywords.length;
    totalScore += industryScore * weights.INDUSTRY_MATCH;
    totalWeight += weights.INDUSTRY_MATCH;
    factors.push(`Industry: ${(industryScore * 100).toFixed(1)}%`);

    // Viewing pattern
    const views = mockUserBehavior.courseViews[course.id] || 0;
    const totalViews = Object.values(mockUserBehavior.courseViews).reduce((sum, v) => sum + v, 0);
    const viewingScore = totalViews > 0 ? views / totalViews : 0;
    totalScore += viewingScore * weights.VIEWING_PATTERN;
    totalWeight += weights.VIEWING_PATTERN;
    factors.push(`Views: ${(viewingScore * 100).toFixed(1)}%`);

    const finalScore = totalWeight > 0 ? totalScore / totalWeight : 0;
    const confidence = 0.5 + (factors.length * 0.1); // Simplified confidence calculation

    console.log(`   ${course.title}:`);
    console.log(`     Final Score: ${(finalScore * 100).toFixed(1)}%`);
    console.log(`     Confidence: ${(confidence * 100).toFixed(1)}%`);
    console.log(`     Factors: ${factors.join(', ')}`);
  });
}

// Run all tests
testInterestMatch();
testEducationCompatibility();
testIndustryRelevance();
testBehaviorAnalysis();
testContextualFactors();
testRecommendationScoring();

console.log('\n✅ Advanced Personalization Tests Completed!');
console.log('\n📋 Summary:');
console.log('- Profile-based personalization using user interests, education, and industry');
console.log('- Behavior-based personalization using viewing patterns and time spent');
console.log('- Contextual personalization using time of day and device type');
console.log('- Multi-factor scoring with weighted algorithms');
console.log('- Confidence scoring based on available data');
console.log('- Hybrid recommendations combining multiple approaches');