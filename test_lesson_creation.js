const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'forward_africa_db'
};

async function testLessonCreation() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    console.log('🧪 Testing lesson creation process...\n');

    // 1. Check database connection
    console.log('1. Testing database connection...');
    const [testResult] = await connection.execute('SELECT 1 as test');
    console.log('✅ Database connection successful\n');

    // 2. Check if we have courses
    console.log('2. Checking available courses...');
    const [courses] = await connection.execute('SELECT id, title FROM courses LIMIT 5');
    console.log(`Found ${courses.length} courses:`);
    courses.forEach(course => {
      console.log(`  - ${course.id}: ${course.title}`);
    });
    console.log('');

    if (courses.length === 0) {
      console.log('❌ No courses found. Please create a course first.');
      return;
    }

    // 3. Check lessons for the first course
    const testCourseId = courses[0].id;
    console.log(`3. Checking lessons for course: ${testCourseId}`);
    const [lessons] = await connection.execute(`
      SELECT id, title, order_index, created_at 
      FROM lessons 
      WHERE course_id = ? 
      ORDER BY order_index ASC
    `, [testCourseId]);

    console.log(`Found ${lessons.length} lessons:`);
    lessons.forEach(lesson => {
      console.log(`  - ${lesson.order_index}. ${lesson.id}: ${lesson.title}`);
    });
    console.log('');

    // 4. Test lesson creation via API
    console.log('4. Testing lesson creation via API...');
    const testLesson = {
      course_id: testCourseId,
      title: 'Test Lesson',
      duration: '10:00',
      thumbnail: 'https://example.com/thumbnail.jpg',
      video_url: 'https://www.youtube.com/watch?v=test123',
      description: 'This is a test lesson',
      xp_points: 100,
      order_index: lessons.length + 1
    };

    const response = await fetch('http://localhost:3002/api/lessons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testLesson)
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Test lesson created successfully: ${result.id}`);
    } else {
      const error = await response.json();
      console.log(`❌ Test lesson creation failed: ${error.error}`);
    }
    console.log('');

    // 5. Test batch lesson creation
    console.log('5. Testing batch lesson creation...');
    const batchLessons = [
      {
        title: 'Batch Test Lesson 1',
        duration: '10:00',
        thumbnail: 'https://example.com/thumbnail1.jpg',
        video_url: 'https://www.youtube.com/watch?v=test456',
        description: 'First batch test lesson',
        xp_points: 100,
        order_index: lessons.length + 2
      },
      {
        title: 'Batch Test Lesson 2',
        duration: '10:00',
        thumbnail: 'https://example.com/thumbnail2.jpg',
        video_url: 'https://www.youtube.com/watch?v=test789',
        description: 'Second batch test lesson',
        xp_points: 100,
        order_index: lessons.length + 3
      }
    ];

    const batchResponse = await fetch('http://localhost:3002/api/lessons/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        course_id: testCourseId,
        lessons: batchLessons
      })
    });

    if (batchResponse.ok) {
      const batchResult = await batchResponse.json();
      console.log(`✅ Batch lesson creation successful: ${batchResult.count} lessons created`);
    } else {
      const error = await batchResponse.json();
      console.log(`❌ Batch lesson creation failed: ${error.error}`);
    }
    console.log('');

    // 6. Verify lessons were created
    console.log('6. Verifying created lessons...');
    const [updatedLessons] = await connection.execute(`
      SELECT id, title, order_index, created_at 
      FROM lessons 
      WHERE course_id = ? 
      ORDER BY order_index ASC
    `, [testCourseId]);

    console.log(`Total lessons after test: ${updatedLessons.length}`);
    updatedLessons.forEach(lesson => {
      console.log(`  - ${lesson.order_index}. ${lesson.id}: ${lesson.title}`);
    });

    // 7. Test debug endpoint
    console.log('\n7. Testing debug endpoint...');
    const debugResponse = await fetch(`http://localhost:3002/api/debug/lessons/${testCourseId}`);
    if (debugResponse.ok) {
      const debugData = await debugResponse.json();
      console.log(`✅ Debug endpoint working: ${debugData.lessonCount} lessons found`);
    } else {
      console.log('❌ Debug endpoint failed');
    }

    // 8. Test health endpoint
    console.log('\n8. Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:3002/api/health/lessons');
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log(`✅ Health check: ${healthData.status}`);
      console.log(`   Database: ${healthData.database}`);
      console.log(`   Tables: ${JSON.stringify(healthData.tables)}`);
    } else {
      console.log('❌ Health endpoint failed');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await connection.end();
  }
}

// Run the test
testLessonCreation(); 