const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'forward_africa_db'
};

async function checkCourse77() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    // Check if course 77 exists
    const [courses] = await connection.execute('SELECT id, title FROM courses WHERE id = 77');
    console.log('📚 Course 77:', courses);

    // Check lessons for course 77
    const [lessons] = await connection.execute('SELECT id, title FROM lessons WHERE course_id = 77 ORDER BY order_index');
    console.log('📖 Lessons for course 77:', lessons);

    // Check all courses to see the ID format
    const [allCourses] = await connection.execute('SELECT id, title FROM courses ORDER BY id');
    console.log('📋 All courses:');
    allCourses.forEach(course => {
      console.log(`  ID: ${course.id} (${typeof course.id}) - ${course.title}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkCourse77();