const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'forward_africa_db'
};

async function testInsert() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    console.log('✅ Connected to database');

    // Try to insert one lesson
    const query = `
      INSERT INTO lessons (id, course_id, title, duration, thumbnail, video_url, description, xp_points, order_index)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      'test_lesson_1',
      77,
      'Test Lesson',
      '10:00',
      'https://images.pexels.com/photos/3861960/pexels-photo-3861960.jpeg',
      'https://www.youtube.com/watch?v=8jPQjjsBbIc',
      'This is a test lesson',
      50,
      1
    ];

    console.log('📝 Inserting lesson with values:', values);

    const [result] = await connection.execute(query, values);
    console.log('✅ Insert result:', result);

    // Check if lesson was added
    const [lessons] = await connection.execute('SELECT * FROM lessons WHERE course_id = 77');
    console.log('📖 Lessons for course 77 after insert:', lessons);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

testInsert();