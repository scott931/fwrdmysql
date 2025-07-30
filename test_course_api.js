const fetch = require('node-fetch');

async function testCourseAPI() {
  try {
    console.log('🔍 Testing course API...');
    
    // Test with a course that has instructor data
    const courseId = '899'; // Paul Giannamore's course
    const apiUrl = `http://localhost:3002/api/courses/${courseId}`;
    
    console.log(`Testing API: ${apiUrl}`);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      console.error(`❌ API Error: ${response.status} ${response.statusText}`);
      return;
    }
    
    const course = await response.json();
    
    console.log('\n📦 Course data received:');
    console.log('Course ID:', course.id);
    console.log('Course Title:', course.title);
    console.log('\n📋 Instructor data:');
    console.log('Instructor Name:', course.instructor_name);
    console.log('Instructor Title:', course.instructor_title);
    console.log('Instructor Email:', course.instructor_email);
    console.log('Instructor Phone:', course.instructor_phone);
    console.log('Instructor Experience:', course.instructor_experience);
    console.log('Instructor Bio:', course.instructor_bio);
    console.log('Instructor Social Links (raw):', course.instructor_social_links);
    console.log('Instructor Social Links (type):', typeof course.instructor_social_links);
    
    if (course.instructor_social_links) {
      try {
        const parsed = JSON.parse(course.instructor_social_links);
        console.log('Instructor Social Links (parsed):', parsed);
      } catch (error) {
        console.log('❌ Error parsing social links:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testCourseAPI(); 