const fetch = require('node-fetch');

async function testFrontendTransformation() {
  try {
    console.log('🔍 Testing frontend data transformation...');

    // Get raw API data
    const response = await fetch('http://localhost:3002/api/courses?include_coming_soon=true');
    const apiCourses = await response.json();

    console.log('\n📊 Raw API Data:');
    apiCourses.forEach(course => {
      console.log(`  - ${course.title} (ID: ${course.id}, Coming Soon: ${course.coming_soon}, Type: ${typeof course.coming_soon})`);
    });

    // Simulate frontend transformation
    console.log('\n🔄 Simulating Frontend Transformation:');
    apiCourses.forEach(course => {
      // Simulate the transformation logic from useDatabase.ts
      const comingSoon = course.coming_soon === 1 || course.coming_soon === true;

      console.log(`  - ${course.title}:`);
      console.log(`    Raw coming_soon: ${course.coming_soon} (${typeof course.coming_soon})`);
      console.log(`    Transformed comingSoon: ${comingSoon} (${typeof comingSoon})`);
      console.log(`    Should show coming soon indicators: ${comingSoon}`);
    });

    // Check if the coming soon course should be visible
    const comingSoonCourse = apiCourses.find(course => course.coming_soon === 1);
    if (comingSoonCourse) {
      console.log(`\n🎯 Coming Soon Course Analysis:`);
      console.log(`  Title: ${comingSoonCourse.title}`);
      console.log(`  ID: ${comingSoonCourse.id}`);
      console.log(`  Raw coming_soon: ${comingSoonCourse.coming_soon}`);
      console.log(`  Transformed comingSoon: ${comingSoonCourse.coming_soon === 1 || comingSoonCourse.coming_soon === true}`);
      console.log(`  Has lessons: ${comingSoonCourse.lessons && comingSoonCourse.lessons.length > 0}`);
      console.log(`  Lessons count: ${comingSoonCourse.lessons ? comingSoonCourse.lessons.length : 0}`);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

testFrontendTransformation();