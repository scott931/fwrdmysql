const fetch = require('node-fetch');

async function testCoursesPageDebug() {
  try {
    console.log('🔍 Testing courses page data flow...');

    // Test the API endpoint that the courses page uses
    const response = await fetch('http://localhost:3002/api/courses?include_coming_soon=true');
    const apiCourses = await response.json();

    console.log('\n📊 API Courses (what the courses page should receive):');
    apiCourses.forEach(course => {
      console.log(`  - ${course.title} (ID: ${course.id}, Coming Soon: ${course.coming_soon}, Lessons: ${course.lessons ? course.lessons.length : 0})`);
    });

    // Simulate the transformation logic from CoursesPage.tsx
    console.log('\n🔄 Simulating CoursesPage Transformation:');
    apiCourses.forEach(course => {
      const comingSoon = course.coming_soon === 1 || course.coming_soon === true;
      console.log(`  - ${course.title}:`);
      console.log(`    Raw coming_soon: ${course.coming_soon}`);
      console.log(`    Transformed comingSoon: ${comingSoon}`);
      console.log(`    Has lessons: ${course.lessons && course.lessons.length > 0}`);
      console.log(`    Should show coming soon indicators: ${comingSoon}`);
    });

    // Check if the coming soon course should be visible
    const comingSoonCourse = apiCourses.find(course => course.coming_soon === 1);
    if (comingSoonCourse) {
      console.log(`\n🎯 Coming Soon Course Analysis:`);
      console.log(`  Title: ${comingSoonCourse.title}`);
      console.log(`  ID: ${comingSoonCourse.id}`);
      console.log(`  Coming Soon: ${comingSoonCourse.coming_soon === 1 || comingSoonCourse.coming_soon === true}`);
      console.log(`  Has lessons: ${comingSoonCourse.lessons && comingSoonCourse.lessons.length > 0}`);
      console.log(`  Lessons count: ${comingSoonCourse.lessons ? comingSoonCourse.lessons.length : 0}`);
      console.log(`  Should be visible on courses page: YES`);
    }

    console.log('\n💡 If the coming soon course is not showing on the courses page, check:');
    console.log('  1. Is the courses page fetching with include_coming_soon=true?');
    console.log('  2. Is the transformation logic working correctly?');
    console.log('  3. Are there any CSS issues hiding the coming soon indicators?');

  } catch (error) {
    console.error('Error:', error);
  }
}

testCoursesPageDebug();