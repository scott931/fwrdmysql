// Backend Server for Forward Africa Learning Platform
// Node.js + Express + MySQL

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3002;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Role-based authorization middleware
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'forward_africa_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create database connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
pool.getConnection()
  .then(connection => {
    console.log('✅ Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err);
  });

// Helper function to execute queries
const executeQuery = async (query, params = []) => {
  try {
    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Database initialization endpoint
app.post('/api/init-db', async (req, res) => {
  try {
    // Create users table if it doesn't exist
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(191) UNIQUE NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255),
        avatar_url TEXT,
        education_level ENUM('high-school', 'associate', 'bachelor', 'master', 'phd', 'professional', 'other'),
        job_title VARCHAR(255),
        topics_of_interest JSON,
        industry VARCHAR(255),
        experience_level VARCHAR(100),
        business_stage VARCHAR(100),
        country VARCHAR(100),
        state_province VARCHAR(100),
        city VARCHAR(100),
        onboarding_completed BOOLEAN DEFAULT FALSE,
        role ENUM('user', 'content_manager', 'community_manager', 'user_support', 'super_admin') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create a test user if it doesn't exist
    const [existingUser] = await executeQuery('SELECT id FROM users WHERE email = ?', ['admin@forwardafrica.com']);

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await executeQuery(
        'INSERT INTO users (id, email, full_name, password_hash, role, onboarding_completed) VALUES (?, ?, ?, ?, ?, ?)',
        [uuidv4(), 'admin@forwardafrica.com', 'System Administrator', hashedPassword, 'super_admin', true]
      );
    }

    res.json({
      status: 'OK',
      message: 'Database initialized successfully',
      testUser: {
        email: 'admin@forwardafrica.com',
        password: 'admin123'
      }
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({ error: 'Failed to initialize database' });
  }
});

// Authentication API
app.post('/api/auth/register', async (req, res) => {
  try {
    const {
      email,
      password,
      full_name,
      education_level,
      job_title,
      topics_of_interest,
      industry,
      experience_level,
      business_stage,
      country,
      state_province,
      city
    } = req.body;

    // Check if user already exists
    const [existingUser] = await executeQuery('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();

    // Create user
    await executeQuery(
      'INSERT INTO users (id, email, full_name, education_level, job_title, topics_of_interest, industry, experience_level, business_stage, country, state_province, city, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, email, full_name, education_level, job_title, JSON.stringify(topics_of_interest), industry, experience_level, business_stage, country, state_province, city, hashedPassword]
    );

    // Generate JWT token
    const token = jwt.sign({ id, email, role: 'user' }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      token,
      user: { id, email, full_name, role: 'user' },
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get user with password hash
    const [user] = await executeQuery('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password_hash || '');
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        avatar_url: user.avatar_url,
        onboarding_completed: user.onboarding_completed
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const [user] = await executeQuery('SELECT id, email, full_name, role, avatar_url, onboarding_completed FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Users API
app.get('/api/users', async (req, res) => {
  try {
    const users = await executeQuery('SELECT * FROM users ORDER BY created_at DESC');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const [user] = await executeQuery('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.get('/api/users/email/:email', async (req, res) => {
  try {
    const [user] = await executeQuery('SELECT * FROM users WHERE email = ?', [req.params.email]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { email, full_name, avatar_url, education_level, job_title, topics_of_interest, role } = req.body;
    const id = uuidv4();

    const result = await executeQuery(
      'INSERT INTO users (id, email, full_name, avatar_url, education_level, job_title, topics_of_interest, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, email, full_name, avatar_url, education_level, job_title, JSON.stringify(topics_of_interest), role || 'user']
    );

    res.status(201).json({ id, message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.put('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const {
      email,
      full_name,
      avatar_url,
      education_level,
      job_title,
      topics_of_interest,
      industry,
      experience_level,
      business_stage,
      country,
      state_province,
      city,
      role
    } = req.body;

    // Ensure user can only update their own profile unless they're admin
    if (req.user.id !== req.params.id && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }

    await executeQuery(
      'UPDATE users SET email = ?, full_name = ?, avatar_url = ?, education_level = ?, job_title = ?, topics_of_interest = ?, industry = ?, experience_level = ?, business_stage = ?, country = ?, state_province = ?, city = ?, role = ? WHERE id = ?',
      [email, full_name, avatar_url, education_level, job_title, JSON.stringify(topics_of_interest), industry, experience_level, business_stage, country, state_province, city, role, req.params.id]
    );

    // Return the updated user data
    const [updatedUser] = await executeQuery(
      'SELECT id, email, full_name, avatar_url, role, permissions, onboarding_completed, industry, experience_level, business_stage, country, state_province, city FROM users WHERE id = ?',
      [req.params.id]
    );

    res.json(updatedUser);
  } catch (error) {
    console.error('User update error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    // Ensure user can only delete their own account unless they're admin
    if (req.user.id !== req.params.id && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'You can only delete your own account' });
    }

    await executeQuery('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('User delete error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Admin-only endpoint to update a user's permissions
app.put('/api/users/:id/permissions', authenticateToken, async (req, res) => {
  try {
    // Only super_admin can update permissions
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only super admins can update permissions.' });
    }
    const { permissions } = req.body;
    if (!Array.isArray(permissions)) {
      return res.status(400).json({ error: 'Permissions must be an array.' });
    }
    await executeQuery('UPDATE users SET permissions = ? WHERE id = ?', [JSON.stringify(permissions), req.params.id]);
    res.json({ message: 'Permissions updated successfully.' });
  } catch (error) {
    console.error('Update permissions error:', error);
    res.status(500).json({ error: 'Failed to update permissions.' });
  }
});

// Courses API
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await executeQuery(`
      SELECT c.*, i.name as instructor_name, i.title as instructor_title, i.image as instructor_image,
             cat.name as category_name
      FROM courses c
      JOIN instructors i ON c.instructor_id = i.id
      JOIN categories cat ON c.category_id = cat.id
      ORDER BY c.created_at DESC
    `);

    // Get lessons for each course
    for (let course of courses) {
      const lessons = await executeQuery(
        'SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index ASC',
        [course.id]
      );
      course.lessons = lessons;
    }

    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

app.get('/api/courses/featured', async (req, res) => {
  try {
    const courses = await executeQuery(`
      SELECT c.*, i.name as instructor_name, i.title as instructor_title, i.image as instructor_image,
             cat.name as category_name
      FROM courses c
      JOIN instructors i ON c.instructor_id = i.id
      JOIN categories cat ON c.category_id = cat.id
      WHERE c.featured = true
      ORDER BY c.created_at DESC
    `);

    // Get lessons for each course
    for (let course of courses) {
      const lessons = await executeQuery(
        'SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index ASC',
        [course.id]
      );
      course.lessons = lessons;
    }

    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch featured courses' });
  }
});

app.get('/api/courses/:id', async (req, res) => {
  try {
    const [course] = await executeQuery(`
      SELECT c.*, i.name as instructor_name, i.title as instructor_title, i.image as instructor_image,
             cat.name as category_name
      FROM courses c
      JOIN instructors i ON c.instructor_id = i.id
      JOIN categories cat ON c.category_id = cat.id
      WHERE c.id = ?
    `, [req.params.id]);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Get lessons for this course
    const lessons = await executeQuery(
      'SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index ASC',
      [req.params.id]
    );

    course.lessons = lessons;
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

app.get('/api/courses/category/:categoryId', async (req, res) => {
  try {
    const courses = await executeQuery(`
      SELECT c.*, i.name as instructor_name, i.title as instructor_title, i.image as instructor_image,
             cat.name as category_name
      FROM courses c
      JOIN instructors i ON c.instructor_id = i.id
      JOIN categories cat ON c.category_id = cat.id
      WHERE c.category_id = ?
      ORDER BY c.created_at DESC
    `, [req.params.categoryId]);
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses by category' });
  }
});

app.post('/api/courses', async (req, res) => {
  try {
    const { title, instructor_id, category_id, thumbnail, banner, video_url, description, featured, total_xp } = req.body;
    const id = uuidv4();

    const result = await executeQuery(
      'INSERT INTO courses (id, title, instructor_id, category_id, thumbnail, banner, video_url, description, featured, total_xp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, title, instructor_id, category_id, thumbnail, banner, video_url, description, featured || false, total_xp || 0]
    );

    res.status(201).json({ id, message: 'Course created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// Categories API
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await executeQuery('SELECT * FROM categories ORDER BY name');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.get('/api/categories/:id', async (req, res) => {
  try {
    const [category] = await executeQuery('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// Instructors API
app.get('/api/instructors', async (req, res) => {
  try {
    const instructors = await executeQuery('SELECT * FROM instructors ORDER BY name');

    // Transform database fields to frontend format
    const transformedInstructors = instructors.map(instructor => ({
      id: instructor.id,
      name: instructor.name,
      title: instructor.title,
      image: instructor.image,
      bio: instructor.bio,
      email: instructor.email,
      phone: instructor.phone,
      expertise: Array.isArray(instructor.expertise) ? instructor.expertise : (instructor.expertise ? JSON.parse(instructor.expertise) : []),
      experience: instructor.experience || 0,
      socialLinks: typeof instructor.social_links === 'object' ? instructor.social_links : (instructor.social_links ? JSON.parse(instructor.social_links) : {}),
      createdAt: new Date(instructor.created_at)
    }));

    res.json(transformedInstructors);
  } catch (error) {
    console.error('Error fetching instructors:', error);
    res.status(500).json({ error: 'Failed to fetch instructors' });
  }
});

app.get('/api/instructors/:id', async (req, res) => {
  try {
    const [instructor] = await executeQuery('SELECT * FROM instructors WHERE id = ?', [req.params.id]);
    if (!instructor) {
      return res.status(404).json({ error: 'Instructor not found' });
    }

    // Transform database fields to frontend format
    const transformedInstructor = {
      id: instructor.id,
      name: instructor.name,
      title: instructor.title,
      image: instructor.image,
      bio: instructor.bio,
      email: instructor.email,
      phone: instructor.phone,
      expertise: Array.isArray(instructor.expertise) ? instructor.expertise : (instructor.expertise ? JSON.parse(instructor.expertise) : []),
      experience: instructor.experience || 0,
      socialLinks: typeof instructor.social_links === 'object' ? instructor.social_links : (instructor.social_links ? JSON.parse(instructor.social_links) : {}),
      createdAt: new Date(instructor.created_at)
    };

    res.json(transformedInstructor);
  } catch (error) {
    console.error('Error fetching instructor:', error);
    res.status(500).json({ error: 'Failed to fetch instructor' });
  }
});

// Get all courses for a specific instructor
app.get('/api/instructors/:id/courses', async (req, res) => {
  try {
    const courses = await executeQuery(`
      SELECT c.*, i.name as instructor_name, i.title as instructor_title, i.image as instructor_image,
             i.bio as instructor_bio, i.email as instructor_email, i.expertise as instructor_expertise,
             i.experience as instructor_experience, i.social_links as instructor_social_links,
             cat.name as category_name
      FROM courses c
      JOIN instructors i ON c.instructor_id = i.id
      JOIN categories cat ON c.category_id = cat.id
      WHERE c.instructor_id = ?
      ORDER BY c.created_at DESC
    `, [req.params.id]);

    // Transform courses to frontend format
    const transformedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      instructorId: course.instructor_id,
      category: course.category_name,
      thumbnail: course.thumbnail,
      banner: course.banner,
      videoUrl: course.video_url,
      description: course.description,
      featured: course.featured,
      totalXP: course.total_xp,
      comingSoon: course.coming_soon,
      releaseDate: course.release_date,
              instructor: {
          id: course.instructor_id,
          name: course.instructor_name,
          title: course.instructor_title,
          image: course.instructor_image,
          bio: course.instructor_bio,
          email: course.instructor_email,
          expertise: Array.isArray(course.instructor_expertise) ? course.instructor_expertise : (course.instructor_expertise ? JSON.parse(course.instructor_expertise) : []),
          experience: course.instructor_experience || 0,
          socialLinks: typeof course.instructor_social_links === 'object' ? course.instructor_social_links : (course.instructor_social_links ? JSON.parse(course.instructor_social_links) : {}),
          createdAt: new Date()
        }
    }));

    // Get lessons for each course
    for (let course of transformedCourses) {
      const lessons = await executeQuery(
        'SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index ASC',
        [course.id]
      );

      // Transform lessons to frontend format
      course.lessons = lessons.map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        duration: lesson.duration,
        thumbnail: lesson.thumbnail,
        videoUrl: lesson.video_url,
        description: lesson.description,
        xpPoints: lesson.xp_points,
        orderIndex: lesson.order_index
      }));
    }

    res.json(transformedCourses);
  } catch (error) {
    console.error('Error fetching instructor courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses for instructor' });
  }
});

// User Progress API
app.get('/api/progress/:userId/:courseId', async (req, res) => {
  try {
    const [progress] = await executeQuery(
      'SELECT * FROM user_progress WHERE user_id = ? AND course_id = ?',
      [req.params.userId, req.params.courseId]
    );

    if (!progress) {
      return res.status(404).json({ error: 'Progress not found' });
    }

    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

app.get('/api/progress/:userId', async (req, res) => {
  try {
    const progress = await executeQuery(
      'SELECT * FROM user_progress WHERE user_id = ?',
      [req.params.userId]
    );
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user progress' });
  }
});

app.post('/api/progress', async (req, res) => {
  try {
    const { user_id, course_id, lesson_id, completed, progress, xp_earned, completed_lessons } = req.body;
    const id = uuidv4();

    const result = await executeQuery(
      'INSERT INTO user_progress (id, user_id, course_id, lesson_id, completed, progress, xp_earned, completed_lessons) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, user_id, course_id, lesson_id, completed || false, progress || 0, xp_earned || 0, JSON.stringify(completed_lessons || [])]
    );

    res.status(201).json({ id, message: 'Progress created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create progress' });
  }
});

app.put('/api/progress/:userId/:courseId', async (req, res) => {
  try {
    const { lesson_id, completed, progress, xp_earned, completed_lessons } = req.body;

    await executeQuery(
      'UPDATE user_progress SET lesson_id = ?, completed = ?, progress = ?, xp_earned = ?, completed_lessons = ? WHERE user_id = ? AND course_id = ?',
      [lesson_id, completed, progress, xp_earned, JSON.stringify(completed_lessons), req.params.userId, req.params.courseId]
    );

    res.json({ message: 'Progress updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// Certificates API
app.get('/api/certificates/:userId', async (req, res) => {
  try {
    const certificates = await executeQuery(
      'SELECT * FROM certificates WHERE user_id = ? ORDER BY earned_date DESC',
      [req.params.userId]
    );
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

app.get('/api/certificates/verify/:code', async (req, res) => {
  try {
    const [certificate] = await executeQuery(
      'SELECT * FROM certificates WHERE verification_code = ?',
      [req.params.code]
    );

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    res.json(certificate);
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify certificate' });
  }
});

// Achievements API
app.get('/api/achievements/:userId', async (req, res) => {
  try {
    const achievements = await executeQuery(
      'SELECT * FROM achievements WHERE user_id = ? ORDER BY earned_date DESC',
      [req.params.userId]
    );
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

// Analytics API
app.get('/api/analytics/platform', async (req, res) => {
  try {
    console.log('📊 Fetching platform analytics from database...');

    const [userCount] = await executeQuery('SELECT COUNT(*) as count FROM users');
    const [courseCount] = await executeQuery('SELECT COUNT(*) as count FROM courses');
    const [lessonCount] = await executeQuery('SELECT COUNT(*) as count FROM lessons');
    const [certificateCount] = await executeQuery('SELECT COUNT(*) as count FROM certificates');
    const [instructorCount] = await executeQuery('SELECT COUNT(*) as count FROM instructors');
    const [completedCoursesCount] = await executeQuery('SELECT COUNT(*) as count FROM user_progress WHERE completed = true');
    const [activeStudentsCount] = await executeQuery('SELECT COUNT(DISTINCT user_id) as count FROM user_progress');
    const [totalXP] = await executeQuery('SELECT SUM(xp_earned) as total FROM user_progress');
    const [totalEnrollments] = await executeQuery('SELECT COUNT(*) as count FROM user_progress');

    // Calculate completion rate
    const completionRate = totalEnrollments.count > 0 ? (completedCoursesCount.count / totalEnrollments.count * 100).toFixed(1) : 0;

    // Get recent activity (last 7 days)
    const [recentActivity] = await executeQuery(`
      SELECT COUNT(*) as count FROM user_progress
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    console.log('📊 Platform analytics calculated:', {
      users: userCount.count,
      courses: courseCount.count,
      lessons: lessonCount.count,
      certificates: certificateCount.count,
      instructors: instructorCount.count,
      completedCourses: completedCoursesCount.count,
      activeStudents: activeStudentsCount.count,
      totalXP: totalXP.total || 0,
      completionRate: parseFloat(completionRate),
      recentActivity: recentActivity.count
    });

    res.json({
      totalUsers: userCount.count,
      totalCourses: courseCount.count,
      totalLessons: lessonCount.count,
      totalCertificates: certificateCount.count,
      totalInstructors: instructorCount.count,
      completedCourses: completedCoursesCount.count,
      activeStudents: activeStudentsCount.count,
      totalXP: totalXP.total || 0,
      completionRate: parseFloat(completionRate),
      recentActivity: recentActivity.count
    });
  } catch (error) {
    console.error('Platform analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch platform analytics' });
  }
});

// Enhanced Analytics API with detailed statistics
app.get('/api/analytics/detailed', async (req, res) => {
  try {
    console.log('📊 Fetching detailed analytics from database...');

    // Basic counts
    const [userCount] = await executeQuery('SELECT COUNT(*) as count FROM users');
    const [courseCount] = await executeQuery('SELECT COUNT(*) as count FROM courses');
    const [lessonCount] = await executeQuery('SELECT COUNT(*) as count FROM lessons');
    const [certificateCount] = await executeQuery('SELECT COUNT(*) as count FROM certificates');
    const [instructorCount] = await executeQuery('SELECT COUNT(*) as count FROM instructors');
    const [completedCoursesCount] = await executeQuery('SELECT COUNT(*) as count FROM user_progress WHERE completed = true');
    const [activeStudentsCount] = await executeQuery('SELECT COUNT(DISTINCT user_id) as count FROM user_progress');
    const [totalXP] = await executeQuery('SELECT SUM(xp_earned) as total FROM user_progress');

    // Course completion rate
    const [totalEnrollments] = await executeQuery('SELECT COUNT(*) as count FROM user_progress');
    const completionRate = totalEnrollments.count > 0 ? (completedCoursesCount.count / totalEnrollments.count * 100).toFixed(1) : 0;

    // Top performing courses with instructor info
    const topCourses = await executeQuery(`
      SELECT
        c.title,
        c.id,
        c.thumbnail,
        i.name as instructor_name,
        COUNT(up.id) as enrollments,
        SUM(CASE WHEN up.completed = 1 THEN 1 ELSE 0 END) as completions,
        AVG(up.progress) as avg_progress
      FROM courses c
      LEFT JOIN instructors i ON c.instructor_id = i.id
      LEFT JOIN user_progress up ON c.id = up.course_id
      GROUP BY c.id, c.title, c.thumbnail, i.name
      ORDER BY enrollments DESC
      LIMIT 5
    `);

    // Category statistics
    const categoryStats = await executeQuery(`
      SELECT
        cat.name,
        COUNT(c.id) as course_count,
        COUNT(up.id) as enrollments,
        SUM(CASE WHEN up.completed = 1 THEN 1 ELSE 0 END) as completions
      FROM categories cat
      LEFT JOIN courses c ON cat.id = c.category_id
      LEFT JOIN user_progress up ON c.id = up.course_id
      GROUP BY cat.id, cat.name
      ORDER BY enrollments DESC
    `);

    // Recent activity (last 30 days)
    const recentActivity = await executeQuery(`
      SELECT COUNT(*) as count FROM user_progress
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    // User engagement metrics
    const [avgSessionDuration] = await executeQuery(`
      SELECT AVG(progress) as avg_duration FROM user_progress WHERE progress > 0
    `);

    // Revenue simulation (mock data for now)
    const monthlyRevenue = 45000;
    const userRetentionRate = 85.2;

    console.log('📊 Analytics data calculated:', {
      users: userCount.count,
      courses: courseCount.count,
      lessons: lessonCount.count,
      certificates: certificateCount.count,
      instructors: instructorCount.count,
      completedCourses: completedCoursesCount.count,
      activeStudents: activeStudentsCount.count,
      totalXP: totalXP.total || 0,
      completionRate: parseFloat(completionRate),
      topCoursesCount: topCourses.length,
      categoryStatsCount: categoryStats.length
    });

    res.json({
      basic: {
        totalUsers: userCount.count,
        totalCourses: courseCount.count,
        totalLessons: lessonCount.count,
        totalCertificates: certificateCount.count,
        totalInstructors: instructorCount.count,
        completedCourses: completedCoursesCount.count,
        activeStudents: activeStudentsCount.count,
        totalXP: totalXP.total || 0
      },
      metrics: {
        completionRate: parseFloat(completionRate),
        recentActivity: recentActivity[0].count,
        avgSessionDuration: avgSessionDuration.avg_duration || 0,
        monthlyRevenue,
        userRetentionRate
      },
      topCourses,
      categoryStats
    });
  } catch (error) {
    console.error('Detailed analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch detailed analytics' });
  }
});

// Notifications API
app.get('/api/notifications/:userId', authenticateToken, async (req, res) => {
  try {
    const notifications = await executeQuery(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [req.params.userId]
    );
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    await executeQuery(
      'UPDATE notifications SET is_read = TRUE WHERE id = ?',
      [req.params.id]
    );
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Community Groups API
app.get('/api/community/groups', authenticateToken, async (req, res) => {
  try {
    const groups = await executeQuery(`
      SELECT cg.*, COUNT(gm.id) as member_count
      FROM community_groups cg
      LEFT JOIN group_members gm ON cg.id = gm.group_id
      GROUP BY cg.id
      ORDER BY cg.created_at DESC
    `);
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

app.get('/api/community/groups/:groupId/messages', authenticateToken, async (req, res) => {
  try {
    const messages = await executeQuery(`
      SELECT gm.*, u.full_name as user_name, u.avatar_url as user_avatar
      FROM group_messages gm
      JOIN users u ON gm.user_id = u.id
      WHERE gm.group_id = ?
      ORDER BY gm.created_at ASC
    `, [req.params.groupId]);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Audit Logs API
app.get('/api/audit-logs', async (req, res) => {
  try {
    // First check if the audit_logs table exists
    const tableExists = await executeQuery(`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = 'forward_africa_db'
      AND table_name = 'audit_logs'
    `);

    console.log('🔍 Checking if audit_logs table exists:', tableExists[0].count);

    if (tableExists[0].count === 0) {
      console.log('📋 Audit logs table does not exist, creating it...');

      // Create the audit_logs table
      await executeQuery(`
        CREATE TABLE audit_logs (
          id VARCHAR(36) PRIMARY KEY,
          user_id VARCHAR(36),
          action VARCHAR(100) NOT NULL,
          resource_type VARCHAR(50) NOT NULL,
          resource_id VARCHAR(36),
          details JSON,
          ip_address VARCHAR(45),
          user_agent TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        )
      `);

      // Insert sample audit logs
      await executeQuery(`
        INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, details, ip_address) VALUES
        ('audit1', 'u1', 'login', 'user', 'u1', '{"method": "email", "success": true}', '192.168.1.100'),
        ('audit2', 'u2', 'create_course', 'course', 'course1', '{"title": "Business Fundamentals", "instructor": "inst1"}', '192.168.1.101'),
        ('audit3', 'u4', 'complete_course', 'course', 'course1', '{"courseTitle": "Business Fundamentals", "xpEarned": 500}', '192.168.1.102'),
        ('audit4', 'u3', 'join_group', 'community_group', 'group2', '{"groupName": "Tech Innovators"}', '192.168.1.103'),
        ('audit5', 'u2', 'update_profile', 'user', 'u2', '{"fields": ["job_title", "topics_of_interest"]}', '192.168.1.101')
      `);

      console.log('📋 Audit logs table created and populated with sample data');
    }

    const { action, resource_type, user_id, start_date, end_date, limit = 100 } = req.query;

    let query = `
      SELECT al.*, u.full_name as user_name, u.email as user_email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (action) {
      query += ' AND al.action = ?';
      params.push(action);
    }

    if (resource_type) {
      query += ' AND al.resource_type = ?';
      params.push(resource_type);
    }

    if (user_id) {
      query += ' AND al.user_id = ?';
      params.push(user_id);
    }

    if (start_date) {
      query += ' AND al.created_at >= ?';
      params.push(start_date);
    }

    if (end_date) {
      query += ' AND al.created_at <= ?';
      params.push(end_date);
    }

    query += ' ORDER BY al.created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    console.log('🔍 Executing audit logs query:', query);
    console.log('📋 Query parameters:', params);

    const logs = await executeQuery(query, params);
    console.log('📋 Audit logs found:', logs.length);

    res.json(logs);
  } catch (error) {
    console.error('Audit logs error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

app.post('/api/audit-logs', authenticateToken, async (req, res) => {
  try {
    const { action, resource_type, resource_id, details } = req.body;
    const id = uuidv4();
    const ip_address = req.ip || req.connection.remoteAddress;
    const user_agent = req.headers['user-agent'];

    await executeQuery(
      'INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, req.user.id, action, resource_type, resource_id, JSON.stringify(details), ip_address, user_agent]
    );

    res.status(201).json({ id, message: 'Audit log created successfully' });
  } catch (error) {
    console.error('Create audit log error:', error);
    res.status(500).json({ error: 'Failed to create audit log' });
  }
});

// Analytics API
app.get('/api/analytics/platform', authenticateToken, authorizeRole(['admin', 'super_admin']), async (req, res) => {
  try {
    const [userCount] = await executeQuery('SELECT COUNT(*) as count FROM users');
    const [courseCount] = await executeQuery('SELECT COUNT(*) as count FROM courses');
    const [lessonCount] = await executeQuery('SELECT COUNT(*) as count FROM lessons');
    const [groupCount] = await executeQuery('SELECT COUNT(*) as count FROM community_groups');

    res.json({
      users: userCount.count,
      courses: courseCount.count,
      lessons: lessonCount.count,
      groups: groupCount.count
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
  console.log(`🏥 Health check at http://localhost:${PORT}/api/health`);
});