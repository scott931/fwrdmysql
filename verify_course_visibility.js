const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'forward_africa_db'
};

async function verifyCourseVisibility() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    console.log('🔍 Verifying course visibility...\n');

    // 1. Check courses in database
    console.log('1. Checking courses in database...');
    const [courses] = await connection.execute('SELECT id, title, instructor_id, category_id FROM courses');
    console.log(`Found ${courses.length} courses:`);
    courses.forEach(course => {
      console.log(`  - ID: ${course.id}, Title: ${course.title}, Instructor: ${course.instructor_id}, Category: ${course.category_id}`);
    });
    console.log('');

    // 2. Check if instructors exist
    console.log('2. Checking instructors...');
    const [instructors] = await connection.execute('SELECT id, name FROM instructors');
    console.log(`Found ${instructors.length} instructors:`);
    instructors.forEach(instructor => {
      console.log(`  - ID: ${instructor.id}, Name: ${instructor.name}`);
    });
    console.log('');

    // 3. Check if categories exist
    console.log('3. Checking categories...');
    const [categories] = await connection.execute('SELECT id, name FROM categories');
    console.log(`Found ${categories.length} categories:`);
    categories.forEach(category => {
      console.log(`  - ID: ${category.id}, Name: ${category.name}`);
    });
    console.log('');

    // 4. Check lessons for each course
    console.log('4. Checking lessons for each course...');
    for (const course of courses) {
      const [lessons] = await connection.execute(
        'SELECT id, title, order_index FROM lessons WHERE course_id = ? ORDER BY order_index ASC',
        [course.id]
      );
      console.log(`Course ${course.id} (${course.title}): ${lessons.length} lessons`);
      lessons.forEach(lesson => {
        console.log(`  - ${lesson.order_index}. ${lesson.id}: ${lesson.title}`);
      });
    }
    console.log('');

    // 5. Test API endpoints
    console.log('5. Testing API endpoints...');
    
    // Test courses API
    try {
      const coursesResponse = await fetch('http://localhost:3002/api/courses');
      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        console.log(`✅ Courses API: ${coursesData.length} courses returned`);
        coursesData.forEach(course => {
          console.log(`  - ${course.title} (${course.lessons?.length || 0} lessons)`);
        });
      } else {
        console.log('❌ Courses API failed');
      }
    } catch (error) {
      console.log('❌ Courses API error:', error.message);
    }

    // Test specific course API
    if (courses.length > 0) {
      try {
        const courseId = courses[0].id;
        const courseResponse = await fetch(`http://localhost:3002/api/courses/${courseId}`);
        if (courseResponse.ok) {
          const courseData = await courseResponse.json();
          console.log(`✅ Course ${courseId} API: ${courseData.lessons?.length || 0} lessons`);
        } else {
          console.log(`❌ Course ${courseId} API failed`);
        }
      } catch (error) {
        console.log('❌ Course API error:', error.message);
      }
    }

    console.log('\n✅ Verification complete!');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    await connection.end();
  }
}

// Run the verification
verifyCourseVisibility(); 