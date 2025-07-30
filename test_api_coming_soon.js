const fetch = require('node-fetch');

async function testComingSoonAPI() {
  try {
    console.log('🔍 Testing API for coming soon courses...');

    // Test the courses API endpoint
    const response = await fetch('http://localhost:3002/api/courses?include_coming_soon=true');
    const courses = await response.json();

    console.log('\n📊 API Response:');
    courses.forEach(course => {
      console.log(`  - ${course.title} (ID: ${course.id}, Coming Soon: ${course.coming_soon})`);
    });

    const comingSoonCourses = courses.filter(course => course.coming_soon === 1);
    console.log(`\n🎯 Coming soon courses from API: ${comingSoonCourses.length}`);
    comingSoonCourses.forEach(course => {
      console.log(`  - ${course.title} (ID: ${course.id})`);
    });

    // Test the frontend API endpoint
    console.log('\n🔍 Testing frontend API endpoint...');
    const frontendResponse = await fetch('http://localhost:3000/api/health');
    console.log('Frontend API status:', frontendResponse.status);

  } catch (error) {
    console.error('Error:', error);
  }
}

testComingSoonAPI();