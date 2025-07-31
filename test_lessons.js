const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'forward_africa_db'
};

async function testLessons() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    console.log('🔍 Testing lessons for course 899...\n');

    const [lessons] = await connection.execute('SELECT * FROM lessons WHERE course_id = 899 ORDER BY order_index ASC');
    console.log(`✅ Found ${lessons.length} lessons for course 899:`);

    lessons.forEach(lesson => {
      console.log(`  - ${lesson.title} (ID: ${lesson.id}, Order: ${lesson.order_index})`);
    });

    // Check if there are any issues with lesson IDs
    const problematicLessons = lessons.filter(lesson => lesson.id >= 2147483647);
    if (problematicLessons.length > 0) {
      console.log('\n⚠️ Found lessons with potentially problematic IDs:');
      problematicLessons.forEach(lesson => {
        console.log(`  - ${lesson.title} (ID: ${lesson.id})`);
      });
    }

    // Also check the API response
    console.log('\n🔍 Testing API response...\n');
    const [apiCourse] = await connection.execute(`
      SELECT c.*, i.name as instructor_name, i.title as instructor_title, i.image as instructor_image,
             cat.name as category_name
      FROM courses c
      JOIN instructors i ON c.instructor_id = i.id
      JOIN categories cat ON c.category_id = cat.id
      WHERE c.id = 899
    `);

    if (apiCourse.length > 0) {
      const course = apiCourse[0];
      console.log('✅ Course found in API query:');
      console.log(`  - Title: ${course.title}`);
      console.log(`  - Instructor: ${course.instructor_name}`);
      console.log(`  - Category: ${course.category_name}`);
      console.log(`  - Featured: ${course.featured}`);
      console.log(`  - Coming Soon: ${course.coming_soon}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

testLessons();