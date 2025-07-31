const fetch = require('node-fetch');

async function testCoursesAPI() {
  try {
    console.log('🔍 Testing courses API...');
    
    // Test the backend API directly
    const response = await fetch('http://localhost:3002/api/courses?include_coming_soon=true');
    const courses = await response.json();
    
    console.log('\n📊 API Response:');
    courses.forEach(course => {
      console.log(`  - ${course.title} (ID: ${course.id}, Coming Soon: ${course.coming_soon})`);
    });
    
    const comingSoonCourses = courses.filter(course => course.coming_soon === 1);
    console.log(`\n🎯 Coming soon courses: ${comingSoonCourses.length}`);
    comingSoonCourses.forEach(course => {
      console.log(`  - ${course.title} (ID: ${course.id})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testCoursesAPI(); 