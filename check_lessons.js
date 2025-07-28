const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'forward_africa_db'
};

async function checkLessons() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    const [lessons] = await connection.execute(`
      SELECT course_id, id as lesson_id, title, order_index
      FROM lessons
      ORDER BY course_id, order_index
    `);

    console.log('📋 Lessons by course:');
    console.log('=====================');

    let currentCourse = null;
    lessons.forEach(lesson => {
      if (currentCourse !== lesson.course_id) {
        currentCourse = lesson.course_id;
        console.log(`\n📚 Course ${lesson.course_id}:`);
      }
      console.log(`  ${lesson.order_index}. ${lesson.lesson_id} - ${lesson.title}`);
    });

    console.log('\n✅ Total lessons found:', lessons.length);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkLessons();