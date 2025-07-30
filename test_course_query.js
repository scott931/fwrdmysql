const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'forward_africa_db'
};

async function testCourseQuery() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    console.log('🔍 Testing course query...\n');

    // Test the exact query used in the API
    const query = `
      SELECT c.*, i.name as instructor_name, i.title as instructor_title, i.image as instructor_image,
             cat.name as category_name
      FROM courses c
      JOIN instructors i ON c.instructor_id = i.id
      JOIN categories cat ON c.category_id = cat.id
      WHERE c.coming_soon = false
      ORDER BY c.created_at DESC
    `;

    console.log('Query:', query);
    console.log('');

    const [courses] = await connection.execute(query);
    console.log(`✅ Found ${courses.length} courses:`);
    
    courses.forEach(course => {
      console.log(`  - ${course.title}`);
      console.log(`    Instructor: ${course.instructor_name} (ID: ${course.instructor_id})`);
      console.log(`    Category: ${course.category_name} (ID: ${course.category_id})`);
      console.log(`    Coming Soon: ${course.coming_soon}`);
      console.log('');
    });

    // Also test without the WHERE clause to see all courses
    console.log('🔍 Testing query without WHERE clause...\n');
    const [allCourses] = await connection.execute(`
      SELECT c.*, i.name as instructor_name, i.title as instructor_title, i.image as instructor_image,
             cat.name as category_name
      FROM courses c
      JOIN instructors i ON c.instructor_id = i.id
      JOIN categories cat ON c.category_id = cat.id
      ORDER BY c.created_at DESC
    `);

    console.log(`✅ Found ${allCourses.length} courses (including coming soon):`);
    allCourses.forEach(course => {
      console.log(`  - ${course.title} (Coming Soon: ${course.coming_soon})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

testCourseQuery(); 