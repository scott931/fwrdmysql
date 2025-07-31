// Test script to verify coming soon filtering functionality
const API_BASE_URL = 'http://localhost:3002/api';

async function testComingSoonFiltering() {
  console.log('🧪 Testing Coming Soon Filtering...\n');

  try {
    // Test 1: Get all courses (should exclude coming soon by default)
    console.log('📋 Test 1: GET /api/courses (default - should exclude coming soon)');
    const response1 = await fetch(`${API_BASE_URL}/courses`);
    const courses1 = await response1.json();
    console.log(`✅ Found ${courses1.length} courses (should exclude coming soon)`);
    const comingSoonCourses1 = courses1.filter(c => c.coming_soon);
    console.log(`📊 Coming soon courses in response: ${comingSoonCourses1.length} (should be 0)`);
    console.log('');

    // Test 2: Get all courses including coming soon
    console.log('📋 Test 2: GET /api/courses?include_coming_soon=true (should include coming soon)');
    const response2 = await fetch(`${API_BASE_URL}/courses?include_coming_soon=true`);
    const courses2 = await response2.json();
    console.log(`✅ Found ${courses2.length} courses (should include coming soon)`);
    const comingSoonCourses2 = courses2.filter(c => c.coming_soon);
    console.log(`📊 Coming soon courses in response: ${comingSoonCourses2.length} (should be 1)`);
    console.log('');

    // Test 3: Get featured courses (should exclude coming soon by default)
    console.log('📋 Test 3: GET /api/courses/featured (default - should exclude coming soon)');
    const response3 = await fetch(`${API_BASE_URL}/courses/featured`);
    const featuredCourses1 = await response3.json();
    console.log(`✅ Found ${featuredCourses1.length} featured courses (should exclude coming soon)`);
    const comingSoonFeatured1 = featuredCourses1.filter(c => c.coming_soon);
    console.log(`📊 Coming soon featured courses: ${comingSoonFeatured1.length} (should be 0)`);
    console.log('');

    // Test 4: Get courses by category (should exclude coming soon by default)
    console.log('📋 Test 4: GET /api/courses/category/cat5 (default - should exclude coming soon)');
    const response4 = await fetch(`${API_BASE_URL}/courses/category/cat5`);
    const categoryCourses1 = await response4.json();
    console.log(`✅ Found ${categoryCourses1.length} courses in category (should exclude coming soon)`);
    const comingSoonCategory1 = categoryCourses1.filter(c => c.coming_soon);
    console.log(`📊 Coming soon courses in category: ${comingSoonCategory1.length} (should be 0)`);
    console.log('');

    // Test 5: Search courses (should exclude coming soon by default)
    console.log('📋 Test 5: GET /api/search?q=AI (default - should exclude coming soon)');
    const response5 = await fetch(`${API_BASE_URL}/search?q=AI`);
    const searchResults1 = await response5.json();
    console.log(`✅ Found ${searchResults1.results.length} search results (should exclude coming soon)`);
    const comingSoonSearch1 = searchResults1.results.filter(c => c.coming_soon);
    console.log(`📊 Coming soon courses in search: ${comingSoonSearch1.length} (should be 0)`);
    console.log('');

    // Test 6: Search courses including coming soon
    console.log('📋 Test 6: GET /api/search?q=AI&include_coming_soon=true (should include coming soon)');
    const response6 = await fetch(`${API_BASE_URL}/search?q=AI&include_coming_soon=true`);
    const searchResults2 = await response6.json();
    console.log(`✅ Found ${searchResults2.results.length} search results (should include coming soon)`);
    const comingSoonSearch2 = searchResults2.results.filter(c => c.coming_soon);
    console.log(`📊 Coming soon courses in search: ${comingSoonSearch2.length} (should be 1)`);
    console.log('');

    console.log('🎉 All tests completed!');
    console.log('\n📝 Summary:');
    console.log('- Default endpoints should exclude coming soon courses');
    console.log('- Endpoints with include_coming_soon=true should include coming soon courses');
    console.log('- Admin pages should use include_coming_soon=true for management');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testComingSoonFiltering();