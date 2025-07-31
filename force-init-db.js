const fetch = require('node-fetch');

async function forceInitDatabase() {
  try {
    console.log('�� Force initializing database...');

    const response = await fetch('http://localhost:3002/api/init-db', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Database initialized successfully:', result);

      // Wait a moment for the database to settle
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Test the courses API
      console.log('🔍 Testing courses API...');
      const coursesResponse = await fetch('http://localhost:3002/api/courses');
      if (coursesResponse.ok) {
        const courses = await coursesResponse.json();
        console.log('✅ Courses API returned:', courses.length, 'courses');
        courses.forEach(course => {
          console.log(`  - ${course.title} by ${course.instructor_name}`);
        });
      } else {
        console.error('❌ Courses API failed:', await coursesResponse.text());
      }
    } else {
      const error = await response.text();
      console.error('❌ Database initialization failed:', error);
    }
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  }
}

forceInitDatabase();