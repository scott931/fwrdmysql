const mysql = require('mysql2/promise');

async function addSampleCourses() {
  console.log('📚 Adding sample courses and lessons...');

  const dbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'forward_africa_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };

  try {
    const pool = mysql.createPool(dbConfig);
    const connection = await pool.getConnection();

    // Add sample courses
    console.log('📚 Adding sample courses...');
    const courses = [
      {
        title: 'Business Fundamentals for Entrepreneurs',
        instructor_id: 1,
        category_id: 1,
        thumbnail: '/images/placeholder-course.jpg',
        banner: '/images/placeholder-course.jpg',
        description: 'Learn the essential principles of business management and entrepreneurship. This comprehensive course covers everything from business planning to financial management.',
        featured: true,
        total_xp: 500,
        coming_soon: false
      },
      {
        title: 'Digital Marketing Mastery',
        instructor_id: 2,
        category_id: 4,
        thumbnail: '/images/placeholder-course.jpg',
        banner: '/images/placeholder-course.jpg',
        description: 'Master the art of digital marketing with practical strategies for social media, SEO, and content marketing.',
        featured: true,
        total_xp: 400,
        coming_soon: false
      },
      {
        title: 'Financial Planning Essentials',
        instructor_id: 3,
        category_id: 5,
        thumbnail: '/images/placeholder-course.jpg',
        banner: '/images/placeholder-course.jpg',
        description: 'Learn essential financial planning skills for personal and business success.',
        featured: false,
        total_xp: 300,
        coming_soon: false
      },
      {
        title: 'Leadership in the Digital Age',
        instructor_id: 1,
        category_id: 3,
        thumbnail: '/images/placeholder-course.jpg',
        banner: '/images/placeholder-course.jpg',
        description: 'Develop modern leadership skills for the digital era.',
        featured: true,
        total_xp: 450,
        coming_soon: false
      },
      {
        title: 'Technology Innovation Strategies',
        instructor_id: 2,
        category_id: 2,
        thumbnail: '/images/placeholder-course.jpg',
        banner: '/images/placeholder-course.jpg',
        description: 'Explore cutting-edge technology and innovation strategies for business growth.',
        featured: false,
        total_xp: 600,
        coming_soon: true
      }
    ];

    for (const course of courses) {
      await connection.execute(`
        INSERT INTO courses (title, instructor_id, category_id, thumbnail, banner, description, featured, total_xp, coming_soon)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [course.title, course.instructor_id, course.category_id, course.thumbnail, course.banner, course.description, course.featured, course.total_xp, course.coming_soon]);
    }
    console.log('✅ Sample courses added');

    // Get the course IDs to add lessons
    const [courseRows] = await connection.execute('SELECT id FROM courses ORDER BY id');

    // Add sample lessons for each course
    console.log('📖 Adding sample lessons...');
    const lessons = [
      // Course 1: Business Fundamentals
      {
        course_id: courseRows[0].id,
        title: 'Introduction to Entrepreneurship',
        duration: '15:30',
        thumbnail: '/images/placeholder-course.jpg',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        description: 'Learn the basics of entrepreneurship and what it takes to start a business.',
        xp_points: 50,
        order_index: 1
      },
      {
        course_id: courseRows[0].id,
        title: 'Business Planning Fundamentals',
        duration: '22:15',
        thumbnail: '/images/placeholder-course.jpg',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        description: 'Create a solid business plan that will guide your entrepreneurial journey.',
        xp_points: 75,
        order_index: 2
      },
      {
        course_id: courseRows[0].id,
        title: 'Financial Management Basics',
        duration: '18:45',
        thumbnail: '/images/placeholder-course.jpg',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        description: 'Understand the fundamentals of financial management for your business.',
        xp_points: 100,
        order_index: 3
      },

      // Course 2: Digital Marketing
      {
        course_id: courseRows[1].id,
        title: 'Social Media Marketing',
        duration: '20:00',
        thumbnail: '/images/placeholder-course.jpg',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        description: 'Master social media marketing strategies for business growth.',
        xp_points: 60,
        order_index: 1
      },
      {
        course_id: courseRows[1].id,
        title: 'SEO Fundamentals',
        duration: '25:30',
        thumbnail: '/images/placeholder-course.jpg',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        description: 'Learn search engine optimization techniques to improve your online visibility.',
        xp_points: 80,
        order_index: 2
      },

      // Course 3: Financial Planning
      {
        course_id: courseRows[2].id,
        title: 'Personal Finance Basics',
        duration: '16:20',
        thumbnail: '/images/placeholder-course.jpg',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        description: 'Learn the fundamentals of personal financial management.',
        xp_points: 40,
        order_index: 1
      },
      {
        course_id: courseRows[2].id,
        title: 'Investment Strategies',
        duration: '19:15',
        thumbnail: '/images/placeholder-course.jpg',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        description: 'Explore different investment strategies for wealth building.',
        xp_points: 70,
        order_index: 2
      },

      // Course 4: Leadership
      {
        course_id: courseRows[3].id,
        title: 'Modern Leadership Principles',
        duration: '21:45',
        thumbnail: '/images/placeholder-course.jpg',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        description: 'Learn the core principles of effective leadership in today\'s world.',
        xp_points: 90,
        order_index: 1
      },
      {
        course_id: courseRows[3].id,
        title: 'Team Management Skills',
        duration: '24:10',
        thumbnail: '/images/placeholder-course.jpg',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        description: 'Develop essential team management and collaboration skills.',
        xp_points: 110,
        order_index: 2
      }
    ];

    for (const lesson of lessons) {
      await connection.execute(`
        INSERT INTO lessons (course_id, title, duration, thumbnail, video_url, description, xp_points, order_index)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [lesson.course_id, lesson.title, lesson.duration, lesson.thumbnail, lesson.video_url, lesson.description, lesson.xp_points, lesson.order_index]);
    }
    console.log('✅ Sample lessons added');

    // Add some sample user progress
    console.log('📊 Adding sample user progress...');
    await connection.execute(`
      INSERT INTO user_progress (user_id, course_id, progress_percentage, completed_lessons, total_time_spent)
      VALUES (2, 1, 33.33, '[1]', 1800)
    `);
    console.log('✅ Sample user progress added');

    connection.release();
    await pool.end();

    console.log('✅ Sample data added successfully!');

  } catch (error) {
    console.error('❌ Error adding sample data:', error.message);
  }
}

addSampleCourses();