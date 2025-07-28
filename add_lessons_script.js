const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // Add your password if needed
  database: 'forward_africa_db'
};

async function addLessonsForCourse77() {
  let connection;

  try {
    // Create connection
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Lessons data for course 77
    const lessons = [
      {
        id: 100, // Changed from 'lesson77_1' to 100 (number)
        course_id: 77,
        title: 'Introduction to Technology Innovation',
        duration: '25:30',
        thumbnail: 'https://images.pexels.com/photos/3861960/pexels-photo-3861960.jpeg',
        video_url: 'https://www.youtube.com/watch?v=8jPQjjsBbIc',
        description: 'Learn the fundamentals of technology innovation and its impact on modern business.',
        xp_points: 100,
        order_index: 1
      },
      {
        id: 101, // Changed from 'lesson77_2' to 101 (number)
        course_id: 77,
        title: 'Innovation Strategy Development',
        duration: '32:15',
        thumbnail: 'https://images.pexels.com/photos/3861961/pexels-photo-3861961.jpeg',
        video_url: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
        description: 'Develop comprehensive innovation strategies that drive business growth and competitive advantage.',
        xp_points: 120,
        order_index: 2
      },
      {
        id: 102, // Changed from 'lesson77_3' to 102 (number)
        course_id: 77,
        title: 'Digital Transformation',
        duration: '28:45',
        thumbnail: 'https://images.pexels.com/photos/3861962/pexels-photo-3861962.jpeg',
        video_url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
        description: 'Understand the principles of digital transformation and how to implement them effectively.',
        xp_points: 110,
        order_index: 3
      },
      {
        id: 103, // Changed from 'lesson77_4' to 103 (number)
        course_id: 77,
        title: 'Emerging Technologies',
        duration: '35:20',
        thumbnail: 'https://images.pexels.com/photos/3861963/pexels-photo-3861963.jpeg',
        video_url: 'https://www.youtube.com/watch?v=L_jWHffIx5E',
        description: 'Explore cutting-edge technologies and their potential applications in business.',
        xp_points: 130,
        order_index: 4
      },
      {
        id: 104, // Changed from 'lesson77_5' to 104 (number)
        course_id: 77,
        title: 'Innovation Leadership',
        duration: '40:10',
        thumbnail: 'https://images.pexels.com/photos/3861964/pexels-photo-3861964.jpeg',
        video_url: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
        description: 'Learn how to lead innovation initiatives and build innovative teams.',
        xp_points: 140,
        order_index: 5
      }
    ];

    // Insert lessons
    for (const lesson of lessons) {
      const query = `
        INSERT INTO lessons (id, course_id, title, duration, thumbnail, video_url, description, xp_points, order_index)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        duration = VALUES(duration),
        thumbnail = VALUES(thumbnail),
        video_url = VALUES(video_url),
        description = VALUES(description),
        xp_points = VALUES(xp_points),
        order_index = VALUES(order_index)
      `;

      const values = [
        lesson.id,
        lesson.course_id,
        lesson.title,
        lesson.duration,
        lesson.thumbnail,
        lesson.video_url,
        lesson.description,
        lesson.xp_points,
        lesson.order_index
      ];

      await connection.execute(query, values);
      console.log(`✅ Added lesson: ${lesson.title}`);
    }

    // Verify lessons were added
    const [rows] = await connection.execute(`
      SELECT c.title as course_title, l.title as lesson_title, l.id as lesson_id, l.order_index
      FROM courses c
      JOIN lessons l ON c.id = l.course_id
      WHERE c.id = '77'
      ORDER BY l.order_index
    `);

    console.log('\n📋 Lessons for course 77:');
    rows.forEach(row => {
      console.log(`  ${row.order_index}. ${row.lesson_title} (${row.lesson_id})`);
    });

    console.log('\n✅ Successfully added lessons for course 77!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the script
addLessonsForCourse77();