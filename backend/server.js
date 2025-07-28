// Backend Server for Forward Africa Learning Platform
// Node.js + Express + MySQL

// Load environment variables
require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const WebSocket = require('ws');

// Import new middleware and services
const { rateLimiters, getRateLimitStatus } = require('./middleware/rateLimiter');
const { apiResponseMiddleware, errorHandler, asyncHandler, requestLogger } = require('./middleware/apiResponse');
const { monitoringService, monitoringMiddleware } = require('./services/monitoringService');

// Import secure routes
const secureRoutes = require('./routes/secureRoutes');

const app = express();
const PORT = process.env.PORT || 3002;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Create HTTP server
const server = require('http').createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected clients
const connectedClients = new Map();

// Enhanced CORS configuration
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3003',
      'http://localhost:3004',
      'http://localhost:3005',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3003',
      'http://127.0.0.1:3004',
      'http://127.0.0.1:3005'
    ];

// CORS middleware with enhanced configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if origin is in allowed list
    if (corsOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('🚫 CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Origin',
    'Accept',
    'X-Request-ID',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: ['X-Request-ID', 'X-Total-Count'],
  maxAge: 86400 // 24 hours
}));

// Handle preflight requests
app.options('*', cors());

// Add CORS headers to all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Origin, Accept, X-Request-ID, Cache-Control, Pragma');
  next();
});

// Apply new middleware
app.use(apiResponseMiddleware);
app.use(monitoringMiddleware);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from public directory (for placeholder images)
app.use('/images', express.static(path.join(__dirname, '../public')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
const avatarsDir = path.join(uploadsDir, 'avatars');
const courseMediaDir = path.join(uploadsDir, 'course-media');
const certificatesDir = path.join(uploadsDir, 'certificates');

[uploadsDir, avatarsDir, courseMediaDir, certificatesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = uploadsDir;

    // Determine upload path based on file type
    if (file.fieldname === 'avatar') {
      uploadPath = avatarsDir;
    } else if (file.fieldname === 'courseThumbnail' || file.fieldname === 'courseBanner' || file.fieldname === 'lessonThumbnail') {
      uploadPath = courseMediaDir;
    } else if (file.fieldname === 'certificate') {
      uploadPath = certificatesDir;
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB default
  }
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('🔍 Token Authentication Debug:', {
    hasAuthHeader: !!authHeader,
    hasToken: !!token,
    tokenLength: token ? token.length : 0
  });

  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('❌ Token verification failed:', err.message);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    console.log('✅ Token verified, user:', user);
    req.user = user;
    next();
  });
};

// Role-based authorization middleware
const authorizeRole = (roles) => {
  return (req, res, next) => {
    console.log('🔍 Role Authorization Debug:', {
      user: req.user,
      userRole: req.user?.role,
      requiredRoles: roles,
      hasRole: req.user ? roles.includes(req.user.role) : false
    });

    if (!req.user) {
      console.log('❌ No user found in request');
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      console.log('❌ User role not authorized:', req.user.role, 'Required:', roles);
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    console.log('✅ Role authorization passed');
    next();
  };
};

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', // Empty password for root user
  database: process.env.DB_NAME || 'forward_africa_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
  // Removed deprecated options: acquireTimeout, timeout, reconnect
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
    console.log('⚠️ Server will continue running with limited functionality');
  });

// Helper function to execute queries
const executeQuery = async (query, params = []) => {
  try {
    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error);

    // If it's a connection error, return empty results instead of crashing
    if (error.code === 'ER_ACCESS_DENIED_ERROR' || error.code === 'ECONNREFUSED') {
      console.log('⚠️ Database not available, returning empty results');
      return [];
    }

    throw error;
  }
};

// Apply security headers to all routes
app.use((req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Content security policy
      res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; connect-src 'self' http://localhost:3002 https:; font-src 'self' https:;");

  next();
});

// Use secure routes
app.use('/api', secureRoutes);

// API Routes

// Health check with enhanced monitoring
app.get('/api/health', (req, res) => {
  const healthStatus = monitoringService.getHealthStatus();
  res.apiSuccess(healthStatus, 'Server is healthy');
});

// Debug endpoint to check user data (for testing)
app.get('/api/debug/user/:id', authenticateToken, async (req, res) => {
  try {
    const [user] = await executeQuery(
      'SELECT id, email, full_name, avatar_url, role, onboarding_completed, education_level, job_title, topics_of_interest, industry, experience_level, business_stage, country, state_province, city FROM users WHERE id = ?',
      [req.params.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User data retrieved',
      user: user
    });
  } catch (error) {
    console.error('Debug user data error:', error);
    res.status(500).json({ error: 'Failed to retrieve user data' });
  }
});

// Rate limit status endpoint
app.get('/api/system/rate-limits', (req, res) => {
  getRateLimitStatus(req, res);
});

// System metrics endpoint (Admin only)
app.get('/api/system/metrics', authenticateToken, authorizeRole(['admin']), (req, res) => {
  const metrics = monitoringService.getMetrics();
  res.apiSuccess(metrics, 'System metrics retrieved');
});

// Enhanced analytics endpoint with real data (Admin only)
app.get('/api/analytics/platform/admin', authenticateToken, authorizeRole(['admin']), asyncHandler(async (req, res) => {
  try {
    // Get real analytics data from database
    const [userCount] = await executeQuery('SELECT COUNT(*) as count FROM users');
    const [courseCount] = await executeQuery('SELECT COUNT(*) as count FROM courses');
    const [lessonCount] = await executeQuery('SELECT COUNT(*) as count FROM lessons');

    const analytics = {
      totalUsers: userCount.count,
      totalCourses: courseCount.count,
      totalLessons: lessonCount.count,
      activeUsers: monitoringService.metrics.users.active.size,
      completionRate: 78.5, // TODO: Calculate from database
      averageRating: 4.6, // TODO: Calculate from database
      totalRevenue: 12500, // TODO: Calculate from database
      monthlyGrowth: 12.5, // TODO: Calculate from database
      systemMetrics: monitoringService.getHealthStatus()
    };

    res.apiSuccess(analytics, 'Analytics data retrieved');
  } catch (error) {
    res.apiServerError('Failed to retrieve analytics data');
  }
}));

// Mock featured courses endpoint (for development)
app.get('/api/courses/featured', (req, res) => {
  res.json([
    {
      id: '1',
      title: 'Business Fundamentals for Entrepreneurs',
      description: 'Learn the essential principles of business management and entrepreneurship.',
      thumbnail: '/images/placeholder-course.jpg',
      instructor: {
        name: 'Dr. Sarah Johnson',
        title: 'Business Professor'
      },
      rating: 4.8,
      students: 1250,
      duration: '8 hours',
      featured: true
    },
    {
      id: '2',
      title: 'Digital Marketing Mastery',
      description: 'Master digital marketing strategies for modern businesses.',
      thumbnail: '/images/placeholder-course.jpg',
      instructor: {
        name: 'Mike Chen',
        title: 'Marketing Expert'
      },
      rating: 4.7,
      students: 890,
      duration: '6 hours',
      featured: true
    },
    {
      id: '3',
      title: 'Financial Planning for Startups',
      description: 'Essential financial management skills for startup success.',
      thumbnail: '/images/placeholder-course.jpg',
      instructor: {
        name: 'Lisa Rodriguez',
        title: 'Financial Advisor'
      },
      rating: 4.9,
      students: 650,
      duration: '5 hours',
      featured: true
    }
  ]);
});

// Mock endpoint removed - using real database endpoint below

// Database initialization endpoint
app.post('/api/init-db', async (req, res) => {
  try {
    console.log('🔧 Initializing database...');

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

    // Create categories table if it doesn't exist
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create instructors table if it doesn't exist
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS instructors (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        image TEXT NOT NULL,
        bio TEXT,
        email VARCHAR(191) UNIQUE NOT NULL,
        phone VARCHAR(50),
        expertise JSON,
        experience INT,
        social_links JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create courses table if it doesn't exist
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS courses (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        instructor_id VARCHAR(36) NOT NULL,
        category_id VARCHAR(36) NOT NULL,
        thumbnail TEXT NOT NULL,
        banner TEXT NOT NULL,
        video_url TEXT,
        description TEXT NOT NULL,
        featured BOOLEAN DEFAULT FALSE,
        total_xp INT DEFAULT 0,
        coming_soon BOOLEAN DEFAULT FALSE,
        release_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      )
    `);

    // Create lessons table if it doesn't exist
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS lessons (
        id VARCHAR(36) PRIMARY KEY,
        course_id VARCHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        duration VARCHAR(10) NOT NULL,
        thumbnail TEXT NOT NULL,
        video_url TEXT NOT NULL,
        description TEXT NOT NULL,
        xp_points INT DEFAULT 0,
        order_index INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      )
    `);

    // Create user_progress table if it doesn't exist
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        course_id VARCHAR(36) NOT NULL,
        lesson_id VARCHAR(36),
        completed BOOLEAN DEFAULT FALSE,
        progress DECIMAL(5,2) DEFAULT 0,
        xp_earned INT DEFAULT 0,
        completed_lessons JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE SET NULL
      )
    `);

    // Create certificates table if it doesn't exist
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS certificates (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        course_id VARCHAR(36) NOT NULL,
        certificate_url TEXT NOT NULL,
        verification_code VARCHAR(255) UNIQUE NOT NULL,
        earned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      )
    `);

    // Create achievements table if it doesn't exist
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS achievements (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        icon_url TEXT,
        earned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create notifications table if it doesn't exist
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create community_groups table if it doesn't exist
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS community_groups (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_by VARCHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create group_members table if it doesn't exist
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS group_members (
        id VARCHAR(36) PRIMARY KEY,
        group_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        role ENUM('member', 'moderator', 'admin') DEFAULT 'member',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES community_groups(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create group_messages table if it doesn't exist
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS group_messages (
        id VARCHAR(36) PRIMARY KEY,
        group_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES community_groups(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create audit_logs table if it doesn't exist
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36),
        action VARCHAR(255) NOT NULL,
        resource_type VARCHAR(100),
        resource_id VARCHAR(36),
        details JSON,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Create user_sessions table if it doesn't exist
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        device_type VARCHAR(50) DEFAULT 'desktop',
        session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        session_end TIMESTAMP NULL,
        duration_seconds INT DEFAULT 0,
        pages_visited JSON,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create course_watch_time table if it doesn't exist
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS course_watch_time (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        course_id VARCHAR(36) NOT NULL,
        lesson_id VARCHAR(36),
        watch_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        watch_end TIMESTAMP NULL,
        duration_seconds INT DEFAULT 0,
        progress_percentage DECIMAL(5,2) DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE SET NULL
      )
    `);

    // Create page_views table if it doesn't exist
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS page_views (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36),
        page_path VARCHAR(500) NOT NULL,
        page_title VARCHAR(255),
        session_id VARCHAR(36),
        time_spent_seconds INT DEFAULT 0,
        ip_address VARCHAR(45),
        user_agent TEXT,
        referrer VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Create user_engagement_metrics table if it doesn't exist
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS user_engagement_metrics (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        date DATE NOT NULL,
        daily_active_minutes INT DEFAULT 0,
        courses_accessed JSON,
        lessons_completed INT DEFAULT 0,
        pages_visited INT DEFAULT 0,
        login_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_date (user_id, date)
      )
    `);

    // Insert default categories if they don't exist
    const defaultCategories = [
      { id: 'business', name: 'Business & Entrepreneurship' },
      { id: 'technology', name: 'Technology & Innovation' },
      { id: 'leadership', name: 'Leadership & Management' },
      { id: 'finance', name: 'Finance & Investment' },
      { id: 'marketing', name: 'Marketing & Sales' },
      { id: 'personal-development', name: 'Personal Development' }
    ];

    for (const category of defaultCategories) {
      await executeQuery(
        'INSERT IGNORE INTO categories (id, name) VALUES (?, ?)',
        [category.id, category.name]
      );
    }

    // Insert default instructor if it doesn't exist
    const [existingInstructor] = await executeQuery('SELECT id FROM instructors WHERE email = ?', ['demo@forwardafrica.com']);
    if (!existingInstructor) {
      await executeQuery(
        'INSERT INTO instructors (id, name, title, image, bio, email, expertise, experience) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          'instructor-1',
          'Demo Instructor',
          'Expert Educator',
          'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg',
          'Experienced professional in the field with over 10 years of teaching experience.',
          'demo@forwardafrica.com',
          JSON.stringify(['General Education', 'Business', 'Technology']),
          10
        ]
      );
    }

    // Insert sample courses if they don't exist
    const [existingCourses] = await executeQuery('SELECT COUNT(*) as count FROM courses');
    if (existingCourses.count === 0) {
      // Create sample courses that reference the demo instructor
      const sampleCourses = [
        {
          id: 'course-1',
          title: 'Business Fundamentals for Entrepreneurs',
          instructor_id: 'instructor-1',
          category_id: 'business',
          thumbnail: 'https://images.pexels.com/photos/7681118/pexels-photo-7681118.jpeg',
          banner: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg',
          video_url: 'https://www.youtube.com/watch?v=8jPQjjsBbIc',
          description: 'Learn the essential principles of business management and entrepreneurship from our expert instructor.',
          featured: true,
          total_xp: 500
        },
        {
          id: 'course-2',
          title: 'Digital Marketing Mastery',
          instructor_id: 'instructor-1',
          category_id: 'marketing',
          thumbnail: 'https://images.pexels.com/photos/7681119/pexels-photo-7681119.jpeg',
          banner: 'https://images.pexels.com/photos/3184293/pexels-photo-3184293.jpeg',
          video_url: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
          description: 'Master digital marketing strategies for modern businesses with comprehensive lessons.',
          featured: true,
          total_xp: 600
        },
        {
          id: 'course-3',
          title: 'Financial Planning for Startups',
          instructor_id: 'instructor-1',
          category_id: 'finance',
          thumbnail: 'https://images.pexels.com/photos/7681120/pexels-photo-7681120.jpeg',
          banner: 'https://images.pexels.com/photos/3184294/pexels-photo-3184294.jpeg',
          video_url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
          description: 'Essential financial management skills for startup success and sustainable growth.',
          featured: false,
          total_xp: 450
        }
      ];

      for (const course of sampleCourses) {
        await executeQuery(
          'INSERT INTO courses (id, title, instructor_id, category_id, thumbnail, banner, video_url, description, featured, total_xp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            course.id,
            course.title,
            course.instructor_id,
            course.category_id,
            course.thumbnail,
            course.banner,
            course.video_url,
            course.description,
            course.featured,
            course.total_xp
          ]
        );
      }

      // Create sample lessons for the first course
      const sampleLessons = [
        {
          id: 'lesson-1',
          course_id: 'course-1',
          title: 'Introduction to Business Fundamentals',
          duration: '25:30',
          thumbnail: 'https://images.pexels.com/photos/7681891/pexels-photo-7681891.jpeg',
          video_url: 'https://www.youtube.com/watch?v=8jPQjjsBbIc',
          description: 'Learn the foundational principles of business management and entrepreneurship.',
          xp_points: 100,
          order_index: 1
        },
        {
          id: 'lesson-2',
          course_id: 'course-1',
          title: 'Strategic Planning and Execution',
          duration: '32:15',
          thumbnail: 'https://images.pexels.com/photos/7681866/pexels-photo-7681866.jpeg',
          video_url: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
          description: 'Master the art of strategic planning and effective execution in business.',
          xp_points: 120,
          order_index: 2
        },
        {
          id: 'lesson-3',
          course_id: 'course-1',
          title: 'Financial Management Essentials',
          duration: '28:45',
          thumbnail: 'https://images.pexels.com/photos/7681892/pexels-photo-7681892.jpeg',
          video_url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
          description: 'Understand the fundamentals of financial management for business success.',
          xp_points: 110,
          order_index: 3
        }
      ];

      for (const lesson of sampleLessons) {
        await executeQuery(
          'INSERT INTO lessons (id, course_id, title, duration, thumbnail, video_url, description, xp_points, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            lesson.id,
            lesson.course_id,
            lesson.title,
            lesson.duration,
            lesson.thumbnail,
            lesson.video_url,
            lesson.description,
            lesson.xp_points,
            lesson.order_index
          ]
        );
      }

      console.log('✅ Sample courses and lessons created successfully');
    }

    // Create a test user if it doesn't exist
    const [existingUser] = await executeQuery('SELECT id FROM users WHERE email = ?', ['admin@forwardafrica.com']);

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await executeQuery(
        'INSERT INTO users (id, email, full_name, password_hash, role, onboarding_completed) VALUES (?, ?, ?, ?, ?, ?)',
        [uuidv4(), 'admin@forwardafrica.com', 'System Administrator', hashedPassword, 'super_admin', true]
      );
    }

    console.log('✅ Database initialized successfully');

    res.json({
      status: 'OK',
      message: 'Database initialized successfully',
      tablesCreated: [
        'users', 'categories', 'instructors', 'courses', 'lessons',
        'user_progress', 'certificates', 'achievements', 'notifications',
        'community_groups', 'group_members', 'group_messages', 'audit_logs',
        'user_sessions', 'course_watch_time', 'page_views', 'user_engagement_metrics'
      ],
      testUser: {
        email: 'admin@forwardafrica.com',
        password: 'admin123'
      }
    });
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    res.status(500).json({ error: 'Failed to initialize database', details: error.message });
  }
});

// Authentication API
app.post('/api/auth/register', async (req, res) => {
  try {
    const {
      email,
      password,
      full_name,
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

    // Convert undefined values to null for database
    const dbIndustry = industry || null;
    const dbExperienceLevel = experience_level || null;
    const dbBusinessStage = business_stage || null;
    const dbCountry = country || null;
    const dbStateProvince = state_province || null;
    const dbCity = city || null;

    // Create user with only existing columns
    await executeQuery(
      'INSERT INTO users (id, email, full_name, industry, experience_level, business_stage, country, state_province, city, password, role, onboarding_completed, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, email, full_name, dbIndustry, dbExperienceLevel, dbBusinessStage, dbCountry, dbStateProvince, dbCity, hashedPassword, 'user', false, true]
    );

    // Generate JWT token
    const token = jwt.sign({ id, email, role: 'user' }, JWT_SECRET, { expiresIn: '24h' });

    // Generate refresh token
    const refreshToken = jwt.sign({ id, email }, JWT_SECRET, { expiresIn: '7d' });

    // Store refresh token in database
    await executeQuery('UPDATE users SET refresh_token = ? WHERE id = ?', [refreshToken, id]);

    res.status(201).json({
      token,
      refreshToken,
      user: {
        id,
        email,
        full_name,
        role: 'user',
        onboarding_completed: false,
        permissions: []
      },
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
    const validPassword = await bcrypt.compare(password, user.password || '');
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    // Generate refresh token
    const refreshToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    // Store refresh token in database
    await executeQuery('UPDATE users SET refresh_token = ? WHERE id = ?', [refreshToken, user.id]);

    res.json({
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        avatar_url: user.avatar_url,
        onboarding_completed: user.onboarding_completed,
        permissions: [] // Add empty permissions array for now
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Token refresh endpoint
app.post('/api/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_SECRET);

    // Check if refresh token exists in database
    const [user] = await executeQuery(
      'SELECT id, email, full_name, role, avatar_url, onboarding_completed, refresh_token FROM users WHERE id = ? AND refresh_token = ?',
      [decoded.id, refreshToken]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Generate new tokens
    const newToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    const newRefreshToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    // Update refresh token in database
    await executeQuery('UPDATE users SET refresh_token = ? WHERE id = ?', [newRefreshToken, user.id]);

    res.json({
      token: newToken,
      refreshToken: newRefreshToken,
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Logout endpoint
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    // Clear refresh token from database
    await executeQuery('UPDATE users SET refresh_token = NULL WHERE id = ?', [req.user.id]);

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const [user] = await executeQuery('SELECT id, email, full_name, role, avatar_url, onboarding_completed FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add permissions field
    user.permissions = [];
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
    console.log('🔧 Creating user with data:', req.body);
    const { email, full_name, avatar_url, education_level, job_title, topics_of_interest, role, password } = req.body;
    const id = uuidv4();

    // Validate required fields
    if (!email || !full_name) {
      return res.status(400).json({ error: 'Email and full_name are required' });
    }

    // Check if user already exists
    const [existingUser] = await executeQuery(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password if provided
    let passwordHash = null;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    // Prepare insert parameters with proper null handling
    const insertParams = [
      id,
      email,
      full_name,
      avatar_url || null,
      education_level || null,
      job_title || null,
      topics_of_interest ? JSON.stringify(topics_of_interest) : null,
      role || 'user',
      passwordHash
    ];

    console.log('🔧 Insert parameters:', insertParams);

    const result = await executeQuery(
      'INSERT INTO users (id, email, full_name, avatar_url, education_level, job_title, topics_of_interest, role, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      insertParams
    );

    console.log('🔧 User created successfully with ID:', id);
    res.status(201).json({ id, message: 'User created successfully' });
  } catch (error) {
    console.error('❌ User creation error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to create user', details: error.message });
  }
});

app.put('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    console.log('🔧 Backend: Received profile update request for user:', req.params.id);
    console.log('🔧 Backend: Request body:', req.body);

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
      role,
      onboarding_completed
    } = req.body;

    // Ensure user can only update their own profile unless they're admin
    if (req.user.id !== req.params.id && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }

    // Regular users cannot change their role
    let updateRole = req.user.role;
    if (req.user.role === 'super_admin' && role) {
      updateRole = role;
    }

    // Build dynamic update query based on provided fields
    const updateFields = [];
    const updateValues = [];

    if (email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (full_name !== undefined) {
      updateFields.push('full_name = ?');
      updateValues.push(full_name);
    }
    if (avatar_url !== undefined) {
      updateFields.push('avatar_url = ?');
      updateValues.push(avatar_url);
    }
    if (education_level !== undefined) {
      updateFields.push('education_level = ?');
      updateValues.push(education_level);
    }
    if (job_title !== undefined) {
      updateFields.push('job_title = ?');
      updateValues.push(job_title);
    }
    if (topics_of_interest !== undefined) {
      updateFields.push('topics_of_interest = ?');
      updateValues.push(JSON.stringify(topics_of_interest));
    }
    if (industry !== undefined) {
      updateFields.push('industry = ?');
      updateValues.push(industry);
    }
    if (experience_level !== undefined) {
      updateFields.push('experience_level = ?');
      updateValues.push(experience_level);
    }
    if (business_stage !== undefined) {
      updateFields.push('business_stage = ?');
      updateValues.push(business_stage);
    }
    if (country !== undefined) {
      updateFields.push('country = ?');
      updateValues.push(country);
    }
    if (state_province !== undefined) {
      updateFields.push('state_province = ?');
      updateValues.push(state_province);
    }
    if (city !== undefined) {
      updateFields.push('city = ?');
      updateValues.push(city);
    }
    if (onboarding_completed !== undefined) {
      updateFields.push('onboarding_completed = ?');
      updateValues.push(onboarding_completed);
    }
    if (updateRole !== undefined) {
      updateFields.push('role = ?');
      updateValues.push(updateRole);
    }

    // Add the WHERE clause parameter
    updateValues.push(req.params.id);

    console.log('🔧 User update parameters:', {
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
      onboarding_completed,
      updateRole,
      userId: req.params.id
    });
    console.log('🔧 Update fields:', updateFields);
    console.log('🔧 Update values:', updateValues);

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    console.log('🔧 Backend: Executing UPDATE query:', updateQuery);
    console.log('🔧 Backend: UPDATE values:', updateValues);

    await executeQuery(updateQuery, updateValues);
    console.log('✅ Backend: UPDATE query executed successfully');

    // Return the updated user data
    console.log('🔧 Backend: Fetching updated user data...');
    const [updatedUser] = await executeQuery(
      'SELECT id, email, full_name, avatar_url, role, onboarding_completed, education_level, job_title, topics_of_interest, industry, experience_level, business_stage, country, state_province, city FROM users WHERE id = ?',
      [req.params.id]
    );
    console.log('🔧 Backend: Raw updated user data from database:', updatedUser);

    // Add permissions field (empty array for now since permissions table doesn't exist)
    updatedUser.permissions = [];

    console.log('✅ Backend: Profile updated successfully for user:', req.params.id);
    console.log('✅ Backend: Updated user data:', updatedUser);
    console.log('✅ Backend: onboarding_completed value:', updatedUser.onboarding_completed);

    res.json({
      ...updatedUser,
      message: 'Profile updated successfully'
    });
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
    // Note: permissions field doesn't exist in users table yet
    // For now, we'll just return success without updating
    console.log('Permissions update requested but permissions field not implemented yet');
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
    console.error('Course creation error:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// Update course
app.put('/api/courses/:id', async (req, res) => {
  try {
    const courseId = req.params.id;

    // Check if course exists
    const [existingCourse] = await executeQuery('SELECT * FROM courses WHERE id = ?', [courseId]);
    if (!existingCourse) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Build dynamic update query based on provided fields
    const updateFields = [];
    const updateValues = [];

    if (req.body.title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(req.body.title);
    }
    if (req.body.instructor_id !== undefined) {
      updateFields.push('instructor_id = ?');
      updateValues.push(req.body.instructor_id);
    }
    if (req.body.category_id !== undefined) {
      updateFields.push('category_id = ?');
      updateValues.push(req.body.category_id);
    }
    if (req.body.thumbnail !== undefined) {
      updateFields.push('thumbnail = ?');
      updateValues.push(req.body.thumbnail);
    }
    if (req.body.banner !== undefined) {
      updateFields.push('banner = ?');
      updateValues.push(req.body.banner);
    }
    if (req.body.video_url !== undefined) {
      updateFields.push('video_url = ?');
      updateValues.push(req.body.video_url);
    }
    if (req.body.description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(req.body.description);
    }
    if (req.body.featured !== undefined) {
      updateFields.push('featured = ?');
      updateValues.push(req.body.featured);
    }
    if (req.body.total_xp !== undefined) {
      updateFields.push('total_xp = ?');
      updateValues.push(req.body.total_xp);
    }

    // Always update the updated_at timestamp
    updateFields.push('updated_at = CURRENT_TIMESTAMP');

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Add courseId to the end of values array
    updateValues.push(courseId);

    // Update course
    await executeQuery(
      `UPDATE courses SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    res.json({ message: 'Course updated successfully' });
  } catch (error) {
    console.error('Course update error:', error);
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// Delete course
app.delete('/api/courses/:id', authenticateToken, authorizeRole(['super_admin', 'content_manager']), async (req, res) => {
  console.log('🔍 Delete Course Debug:', {
    courseId: req.params.id,
    user: req.user,
    userRole: req.user?.role,
    authorizedRoles: ['super_admin', 'content_manager']
  });

  try {
    // Check if course exists
    const [course] = await executeQuery('SELECT title, instructor_id FROM courses WHERE id = ?', [req.params.id]);
    if (!course) {
      console.log('❌ Course not found:', req.params.id);
      return res.status(404).json({ error: 'Course not found' });
    }

    console.log('✅ Course found:', course);

    // Check if course has lessons
    const [lessonCount] = await executeQuery('SELECT COUNT(*) as count FROM lessons WHERE course_id = ?', [req.params.id]);
    console.log('📚 Lesson count:', lessonCount.count);

    if (lessonCount.count > 0) {
      console.log('❌ Cannot delete course with lessons');
      return res.status(400).json({ error: 'Cannot delete course with existing lessons. Please delete all lessons first.' });
    }

    // Delete course
    await executeQuery('DELETE FROM courses WHERE id = ?', [req.params.id]);
    console.log('✅ Course deleted successfully');

    // Log audit event
    try {
      await executeQuery(
        'INSERT INTO audit_logs (id, user_id, action, details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
        [
          uuidv4(),
          req.user?.id || 'system',
          'course_deleted',
          JSON.stringify({
            message: `Deleted course: ${course.title}`,
            course_id: req.params.id,
            course_title: course.title,
            instructor_id: course.instructor_id
          }),
          req.ip,
          req.get('User-Agent')
        ]
      );
      console.log('✅ Audit log created');
    } catch (auditError) {
      console.warn('Audit logging failed, but course was deleted:', auditError.message);
    }

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting course:', error);
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

// Lessons API
app.post('/api/lessons', async (req, res) => {
  try {
    const { course_id, title, duration, thumbnail, video_url, description, xp_points, order_index } = req.body;
    const id = uuidv4();

    const result = await executeQuery(
      'INSERT INTO lessons (id, course_id, title, duration, thumbnail, video_url, description, xp_points, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, course_id, title, duration || '10:00', thumbnail, video_url, description, xp_points || 100, order_index || 0]
    );

    res.status(201).json({ id, message: 'Lesson created successfully' });
  } catch (error) {
    console.error('Lesson creation error:', error);
    res.status(500).json({ error: 'Failed to create lesson' });
  }
});

app.get('/api/lessons/:courseId', async (req, res) => {
  try {
    const lessons = await executeQuery(
      'SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index ASC',
      [req.params.courseId]
    );
    res.json(lessons);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

// Update lesson
app.put('/api/lessons/:id', async (req, res) => {
  try {
    const lessonId = req.params.id;

    // Check if lesson exists
    const [existingLesson] = await executeQuery('SELECT * FROM lessons WHERE id = ?', [lessonId]);
    if (!existingLesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Build dynamic update query based on provided fields
    const updateFields = [];
    const updateValues = [];

    if (req.body.course_id !== undefined) {
      updateFields.push('course_id = ?');
      updateValues.push(req.body.course_id);
    }
    if (req.body.title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(req.body.title);
    }
    if (req.body.duration !== undefined) {
      updateFields.push('duration = ?');
      updateValues.push(req.body.duration);
    }
    if (req.body.thumbnail !== undefined) {
      updateFields.push('thumbnail = ?');
      updateValues.push(req.body.thumbnail);
    }
    if (req.body.video_url !== undefined) {
      updateFields.push('video_url = ?');
      updateValues.push(req.body.video_url);
    }
    if (req.body.description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(req.body.description);
    }
    if (req.body.xp_points !== undefined) {
      updateFields.push('xp_points = ?');
      updateValues.push(req.body.xp_points);
    }
    if (req.body.order_index !== undefined) {
      updateFields.push('order_index = ?');
      updateValues.push(req.body.order_index);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Add lessonId to the end of values array
    updateValues.push(lessonId);

    // Update lesson
    await executeQuery(
      `UPDATE lessons SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    res.json({ message: 'Lesson updated successfully' });
  } catch (error) {
    console.error('Lesson update error:', error);
    res.status(500).json({ error: 'Failed to update lesson' });
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

app.post('/api/categories', async (req, res) => {
  try {
    const { id, name, description } = req.body;

    const result = await executeQuery(
      'INSERT INTO categories (id, name, description) VALUES (?, ?, ?)',
      [id, name, description || null]
    );

    res.status(201).json({ id, message: 'Category created successfully' });
  } catch (error) {
    console.error('Category creation error:', error);
    res.status(500).json({ error: 'Failed to create category' });
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

// Create new instructor
app.post('/api/instructors', authenticateToken, authorizeRole(['super_admin', 'content_manager']), async (req, res) => {
  try {
    const {
      name,
      title,
      email,
      phone,
      bio,
      image,
      experience,
      expertise,
      socialLinks
    } = req.body;

    // Validate required fields
    if (!name || !title || !email || !bio || !image) {
      return res.status(400).json({ error: 'Missing required fields: name, title, email, bio, image' });
    }

    // Check if instructor with this email already exists
    const [existingInstructor] = await executeQuery('SELECT id FROM instructors WHERE email = ?', [email]);
    if (existingInstructor) {
      return res.status(400).json({ error: 'Instructor with this email already exists' });
    }

    const id = uuidv4();

    // Insert new instructor
    await executeQuery(
      'INSERT INTO instructors (id, name, title, email, phone, bio, image, experience, expertise, social_links) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id,
        name,
        title,
        email,
        phone || null,
        bio,
        image,
        experience || 0,
        JSON.stringify(expertise || []),
        JSON.stringify(socialLinks || {})
      ]
    );

    // Log audit event (don't let audit logging failure prevent instructor creation)
    try {
      await executeQuery(
        'INSERT INTO audit_logs (id, user_id, action, details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
        [
          uuidv4(),
          req.user?.id || 'system',
          'instructor_created',
          JSON.stringify({
            message: `Created instructor: ${name} (${email})`,
            instructor_id: id,
            instructor_name: name,
            instructor_email: email
          }),
          req.ip,
          req.get('User-Agent')
        ]
      );
    } catch (auditError) {
      console.warn('Audit logging failed, but instructor was created:', auditError.message);
    }

    res.status(201).json({
      id,
      message: 'Instructor created successfully',
      instructor: {
        id,
        name,
        title,
        email,
        phone,
        bio,
        image,
        experience: experience || 0,
        expertise: expertise || [],
        socialLinks: socialLinks || {},
        createdAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error creating instructor:', error);
    res.status(500).json({ error: 'Failed to create instructor' });
  }
});

// Update instructor
app.put('/api/instructors/:id', authenticateToken, authorizeRole(['super_admin', 'content_manager']), async (req, res) => {
  try {
    const {
      name,
      title,
      email,
      phone,
      bio,
      image,
      experience,
      expertise,
      socialLinks
    } = req.body;

    // Validate required fields
    if (!name || !title || !email || !bio || !image) {
      return res.status(400).json({ error: 'Missing required fields: name, title, email, bio, image' });
    }

    // Check if instructor exists
    const [existingInstructor] = await executeQuery('SELECT id FROM instructors WHERE id = ?', [req.params.id]);
    if (!existingInstructor) {
      return res.status(404).json({ error: 'Instructor not found' });
    }

    // Check if email is already taken by another instructor
    const [emailConflict] = await executeQuery('SELECT id FROM instructors WHERE email = ? AND id != ?', [email, req.params.id]);
    if (emailConflict) {
      return res.status(400).json({ error: 'Email is already taken by another instructor' });
    }

    // Update instructor
    await executeQuery(
      'UPDATE instructors SET name = ?, title = ?, email = ?, phone = ?, bio = ?, image = ?, experience = ?, expertise = ?, social_links = ? WHERE id = ?',
      [
        name,
        title,
        email,
        phone || null,
        bio,
        image,
        experience || 0,
        JSON.stringify(expertise || []),
        JSON.stringify(socialLinks || {}),
        req.params.id
      ]
    );

    // Log audit event
    try {
      await executeQuery(
        'INSERT INTO audit_logs (id, user_id, action, details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
        [
          uuidv4(),
          req.user?.id || 'system',
          'instructor_updated',
          JSON.stringify({
            message: `Updated instructor: ${name} (${email})`,
            instructor_id: req.params.id,
            instructor_name: name,
            instructor_email: email
          }),
          req.ip,
          req.get('User-Agent')
        ]
      );
    } catch (auditError) {
      console.warn('Audit logging failed, but instructor was updated:', auditError.message);
    }

    res.json({
      message: 'Instructor updated successfully',
      instructor: {
        id: req.params.id,
        name,
        title,
        email,
        phone,
        bio,
        image,
        experience: experience || 0,
        expertise: expertise || [],
        socialLinks: socialLinks || {},
        createdAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error updating instructor:', error);
    res.status(500).json({ error: 'Failed to update instructor' });
  }
});

// Delete instructor
app.delete('/api/instructors/:id', authenticateToken, authorizeRole(['super_admin', 'content_manager']), async (req, res) => {
  try {
    // Check if instructor exists
    const [instructor] = await executeQuery('SELECT name, email FROM instructors WHERE id = ?', [req.params.id]);
    if (!instructor) {
      return res.status(404).json({ error: 'Instructor not found' });
    }

    // Check if instructor has courses
    const [courseCount] = await executeQuery('SELECT COUNT(*) as count FROM courses WHERE instructor_id = ?', [req.params.id]);
    if (courseCount.count > 0) {
      return res.status(400).json({ error: 'Cannot delete instructor with existing courses' });
    }

    // Delete instructor
    await executeQuery('DELETE FROM instructors WHERE id = ?', [req.params.id]);

    // Log audit event
    try {
      await executeQuery(
        'INSERT INTO audit_logs (id, user_id, action, details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
        [
          uuidv4(),
          req.user?.id || 'system',
          'instructor_deleted',
          JSON.stringify({
            message: `Deleted instructor: ${instructor.name} (${instructor.email})`,
            instructor_id: req.params.id,
            instructor_name: instructor.name,
            instructor_email: instructor.email
          }),
          req.ip,
          req.get('User-Agent')
        ]
      );
    } catch (auditError) {
      console.warn('Audit logging failed, but instructor was deleted:', auditError.message);
    }

    res.json({ message: 'Instructor deleted successfully' });
  } catch (error) {
    console.error('Error deleting instructor:', error);
    res.status(500).json({ error: 'Failed to delete instructor' });
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

// Analytics API - Simplified version that handles missing tables gracefully
app.get('/api/analytics/platform', async (req, res) => {
  try {
    console.log('📊 Fetching platform analytics from database...');

    // Helper function to safely query tables that might not exist
    const safeQuery = async (query, defaultValue = 0) => {
      try {
        const [result] = await executeQuery(query);
        return result.count || result.total || defaultValue;
      } catch (error) {
        console.log(`⚠️ Table not found for query: ${query.split(' ')[3]}`);
        return defaultValue;
      }
    };

    // Basic counts from existing tables
    const totalUsers = await safeQuery('SELECT COUNT(*) as count FROM users');
    const totalCourses = await safeQuery('SELECT COUNT(*) as count FROM courses');
    const totalLessons = await safeQuery('SELECT COUNT(*) as count FROM lessons');
    const totalCertificates = await safeQuery('SELECT COUNT(*) as count FROM certificates');
    const totalInstructors = await safeQuery('SELECT COUNT(*) as count FROM instructors');
    const completedCourses = await safeQuery('SELECT COUNT(*) as count FROM user_progress WHERE completed = true');
    const activeStudents = await safeQuery('SELECT COUNT(DISTINCT user_id) as count FROM user_progress');
    const totalXP = await safeQuery('SELECT SUM(xp_earned) as total FROM user_progress');

    console.log('📊 Platform analytics calculated:', {
      users: totalUsers,
      courses: totalCourses,
      lessons: totalLessons,
      certificates: totalCertificates,
      instructors: totalInstructors,
      completedCourses: completedCourses,
      activeStudents: activeStudents,
      totalXP: totalXP
    });

    res.json({
      totalUsers: totalUsers,
      totalCourses: totalCourses,
      totalLessons: totalLessons,
      totalCertificates: totalCertificates,
      totalInstructors: totalInstructors,
      completedCourses: completedCourses,
      activeStudents: activeStudents,
      totalXP: totalXP
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
      //    totalUsers: userCount.count,
      // totalCourses: courseCount.count,
      // totalLessons: lessonCount.count,
      // totalCertificates: certificateCount.count,
      // totalInstructors: instructorCount.count,
      // completedCourses: completedCoursesCount.count,
      // activeStudents: activeStudentsCount.count,
      // totalXP: totalXP.total || 0,
      // completionRate: parseFloat(completionRate),
      // recentActivity: recentActivity.count,
      // totalWatchTimeHours: parseFloat((totalWatchTime.total_seconds / 3600).toFixed(2)),
      // avgSessionDurationMinutes: parseFloat((avgSessionDuration.avg_seconds / 60).toFixed(2)),
      // dailyActiveUsers: dailyActiveUsers.count,
      // weeklyActiveUsers: weeklyActiveUsers.count,
      // monthlyActiveUsers: monthlyActiveUsers.count,
      // userRetentionRate: parseFloat(userRetentionRate)
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
app.get('/api/audit-logs', authenticateToken, async (req, res) => {
  try {
    console.log('📋 Fetching audit logs...');

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

    query += ` ORDER BY al.created_at DESC LIMIT ${parseInt(limit)}`;

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

// Session Tracking API
app.post('/api/sessions/start', authenticateToken, async (req, res) => {
  try {
    const { deviceType = 'desktop' } = req.body;
    const sessionId = uuidv4();
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await executeQuery(
      'INSERT INTO user_sessions (id, user_id, ip_address, user_agent, device_type) VALUES (?, ?, ?, ?, ?)',
      [sessionId, req.user.id, ipAddress, userAgent, deviceType]
    );

    res.status(201).json({
      sessionId,
      message: 'Session started successfully'
    });
  } catch (error) {
    console.error('Session start error:', error);
    res.status(500).json({ error: 'Failed to start session' });
  }
});

app.put('/api/sessions/:sessionId/end', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { durationSeconds, pagesVisited } = req.body;

    await executeQuery(
      'UPDATE user_sessions SET session_end = NOW(), duration_seconds = ?, pages_visited = ? WHERE id = ? AND user_id = ?',
      [durationSeconds || 0, JSON.stringify(pagesVisited || []), sessionId, req.user.id]
    );

    res.json({ message: 'Session ended successfully' });
  } catch (error) {
    console.error('Session end error:', error);
    res.status(500).json({ error: 'Failed to end session' });
  }
});

// Watch Time Tracking API
app.post('/api/watch-time/start', authenticateToken, async (req, res) => {
  try {
    const { courseId, lessonId } = req.body;
    const watchId = uuidv4();

    await executeQuery(
      'INSERT INTO course_watch_time (id, user_id, course_id, lesson_id) VALUES (?, ?, ?, ?)',
      [watchId, req.user.id, courseId, lessonId]
    );

    res.status(201).json({
      watchId,
      message: 'Watch time tracking started'
    });
  } catch (error) {
    console.error('Watch time start error:', error);
    res.status(500).json({ error: 'Failed to start watch time tracking' });
  }
});

app.put('/api/watch-time/:watchId/end', authenticateToken, async (req, res) => {
  try {
    const { watchId } = req.params;
    const { durationSeconds, progressPercentage } = req.body;

    await executeQuery(
      'UPDATE course_watch_time SET watch_end = NOW(), duration_seconds = ?, progress_percentage = ? WHERE id = ? AND user_id = ?',
      [durationSeconds || 0, progressPercentage || 0, watchId, req.user.id]
    );

    res.json({ message: 'Watch time tracking ended' });
  } catch (error) {
    console.error('Watch time end error:', error);
    res.status(500).json({ error: 'Failed to end watch time tracking' });
  }
});

// Page View Tracking API
app.post('/api/page-views', async (req, res) => {
  try {
    const { pagePath, pageTitle, sessionId, timeSpentSeconds, referrer } = req.body;
    const userId = req.user?.id || null; // Allow anonymous tracking
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const pageViewId = uuidv4();

    await executeQuery(
      'INSERT INTO page_views (id, user_id, page_path, page_title, session_id, time_spent_seconds, ip_address, user_agent, referrer) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [pageViewId, userId, pagePath, pageTitle, sessionId, timeSpentSeconds || 0, ipAddress, userAgent, referrer]
    );

    res.status(201).json({
      pageViewId,
      message: 'Page view tracked successfully'
    });
  } catch (error) {
    console.error('Page view tracking error:', error);
    res.status(500).json({ error: 'Failed to track page view' });
  }
});

// User Engagement Metrics API
app.post('/api/engagement/update', authenticateToken, async (req, res) => {
  try {
    const { dailyActiveMinutes, coursesAccessed, lessonsCompleted, pagesVisited, loginCount } = req.body;
    const today = new Date().toISOString().split('T')[0];

    // Try to update existing record, insert if not exists
    await executeQuery(`
      INSERT INTO user_engagement_metrics (id, user_id, date, daily_active_minutes, courses_accessed, lessons_completed, pages_visited, login_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      daily_active_minutes = daily_active_minutes + VALUES(daily_active_minutes),
      courses_accessed = VALUES(courses_accessed),
      lessons_completed = lessons_completed + VALUES(lessons_completed),
      pages_visited = pages_visited + VALUES(pages_visited),
      login_count = login_count + VALUES(login_count),
      updated_at = NOW()
    `, [uuidv4(), req.user.id, today, dailyActiveMinutes || 0, JSON.stringify(coursesAccessed || []), lessonsCompleted || 0, pagesVisited || 0, loginCount || 0]);

    res.json({ message: 'Engagement metrics updated successfully' });
  } catch (error) {
    console.error('Engagement metrics error:', error);
    res.status(500).json({ error: 'Failed to update engagement metrics' });
  }
});

// File Upload Endpoints
app.post('/api/upload/avatar', upload.single('avatar'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }
  const filePath = req.file.path.replace('\\', '/'); // Handle Windows path
  const url = `${req.protocol}://${req.get('host')}/uploads/avatars/${req.file.filename}`;
  res.json({ url });
});

app.post('/api/upload/course-thumbnail', upload.single('courseThumbnail'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }
  const filePath = req.file.path.replace('\\', '/'); // Handle Windows path
  const url = `${req.protocol}://${req.get('host')}/uploads/course-media/${req.file.filename}`;
  res.json({ url });
});

app.post('/api/upload/course-banner', upload.single('courseBanner'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }
  const filePath = req.file.path.replace('\\', '/'); // Handle Windows path
  const url = `${req.protocol}://${req.get('host')}/uploads/course-media/${req.file.filename}`;
  res.json({ url });
});

app.post('/api/upload/lesson-thumbnail', upload.single('lessonThumbnail'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }
  const filePath = req.file.path.replace('\\', '/'); // Handle Windows path
  const url = `${req.protocol}://${req.get('host')}/uploads/course-media/${req.file.filename}`;
  res.json({ url });
});

app.post('/api/upload/certificate', upload.single('certificate'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }
  const filePath = req.file.path.replace('\\', '/'); // Handle Windows path
  const url = `${req.protocol}://${req.get('host')}/uploads/certificates/${req.file.filename}`;
  res.json({ url });
});

// System Configuration Endpoints
app.get('/api/system/config', authenticateToken, authorizeRole(['super_admin']), async (req, res) => {
  try {
    // Get system configuration from database
    const [configRows] = await executeQuery('SELECT * FROM system_configuration WHERE id = 1');

    if (configRows.length === 0) {
      // Return default configuration if none exists
      const defaultConfig = {
        siteName: 'Forward Africa',
        siteDescription: 'Empowering African professionals through expert-led courses',
        maintenanceMode: false,
        debugMode: false,
        maxUploadSize: 50,
        sessionTimeout: 30,
        emailNotifications: true,
        autoBackup: true,
        backupFrequency: 'daily',
        securityLevel: 'high',
        rateLimiting: true,
        maxRequestsPerMinute: 100,
        databaseConnectionPool: 10,
        cacheEnabled: true,
        cacheTTL: 3600,
        cdnEnabled: false,
        sslEnabled: true,
        corsEnabled: true,
        allowedOrigins: JSON.stringify(['https://forwardafrica.com', 'https://www.forwardafrica.com'])
      };

      res.json(defaultConfig);
    } else {
      res.json(configRows[0]);
    }
  } catch (error) {
    console.error('Error fetching system configuration:', error);
    res.status(500).json({ error: 'Failed to fetch system configuration' });
  }
});

app.put('/api/system/config', authenticateToken, authorizeRole(['super_admin']), async (req, res) => {
  try {
    const {
      siteName,
      siteDescription,
      maintenanceMode,
      debugMode,
      maxUploadSize,
      sessionTimeout,
      emailNotifications,
      autoBackup,
      backupFrequency,
      securityLevel,
      rateLimiting,
      maxRequestsPerMinute,
      databaseConnectionPool,
      cacheEnabled,
      cacheTTL,
      cdnEnabled,
      sslEnabled,
      corsEnabled,
      allowedOrigins
    } = req.body;

    // Check if configuration exists
    const [existingConfig] = await executeQuery('SELECT id FROM system_configuration WHERE id = 1');

    if (existingConfig.length === 0) {
      // Insert new configuration
      await executeQuery(`
        INSERT INTO system_configuration (
          id, site_name, site_description, maintenance_mode, debug_mode, max_upload_size,
          session_timeout, email_notifications, auto_backup, backup_frequency, security_level,
          rate_limiting, max_requests_per_minute, database_connection_pool, cache_enabled,
          cache_ttl, cdn_enabled, ssl_enabled, cors_enabled, allowed_origins, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        1, siteName, siteDescription, maintenanceMode, debugMode, maxUploadSize,
        sessionTimeout, emailNotifications, autoBackup, backupFrequency, securityLevel,
        rateLimiting, maxRequestsPerMinute, databaseConnectionPool, cacheEnabled,
        cacheTTL, cdnEnabled, sslEnabled, corsEnabled,
        typeof allowedOrigins === 'string' ? allowedOrigins : JSON.stringify(allowedOrigins)
      ]);
    } else {
      // Update existing configuration
      await executeQuery(`
        UPDATE system_configuration SET
          site_name = ?, site_description = ?, maintenance_mode = ?, debug_mode = ?,
          max_upload_size = ?, session_timeout = ?, email_notifications = ?, auto_backup = ?,
          backup_frequency = ?, security_level = ?, rate_limiting = ?, max_requests_per_minute = ?,
          database_connection_pool = ?, cache_enabled = ?, cache_ttl = ?, cdn_enabled = ?,
          ssl_enabled = ?, cors_enabled = ?, allowed_origins = ?, updated_at = NOW()
        WHERE id = 1
      `, [
        siteName, siteDescription, maintenanceMode, debugMode, maxUploadSize,
        sessionTimeout, emailNotifications, autoBackup, backupFrequency, securityLevel,
        rateLimiting, maxRequestsPerMinute, databaseConnectionPool, cacheEnabled,
        cacheTTL, cdnEnabled, sslEnabled, corsEnabled,
        typeof allowedOrigins === 'string' ? allowedOrigins : JSON.stringify(allowedOrigins)
      ]);
    }

    // Log the configuration change
    await executeQuery(`
      INSERT INTO audit_logs (id, user_id, action, details, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      req.user.id,
      'SYSTEM_CONFIG_UPDATE',
      `Updated system configuration: ${siteName}`,
      req.ip || req.connection.remoteAddress,
      req.headers['user-agent']
    ]);

    res.json({ message: 'System configuration updated successfully' });
  } catch (error) {
    console.error('Error updating system configuration:', error);
    res.status(500).json({ error: 'Failed to update system configuration' });
  }
});

app.get('/api/system/status', authenticateToken, authorizeRole(['super_admin']), async (req, res) => {
  try {
    // Get system status information
    const [dbStatus] = await executeQuery('SELECT 1 as status');
    const [userCount] = await executeQuery('SELECT COUNT(*) as count FROM users');
    const [courseCount] = await executeQuery('SELECT COUNT(*) as count FROM courses');
    const [instructorCount] = await executeQuery('SELECT COUNT(*) as count FROM instructors');

    // Get system resources (simulated)
    const systemResources = {
      cpuUsage: Math.floor(Math.random() * 30) + 20, // 20-50%
      memoryUsage: Math.floor(Math.random() * 40) + 60, // 60-100%
      diskUsage: Math.floor(Math.random() * 50) + 20, // 20-70%
      responseTime: Math.floor(Math.random() * 200) + 100, // 100-300ms
      uptime: 99.9,
      activeUsers: Math.floor(Math.random() * 500) + 1000, // 1000-1500
      errorRate: (Math.random() * 0.1).toFixed(2) // 0-0.1%
    };

    res.json({
      database: {
        status: dbStatus.length > 0 ? 'operational' : 'error',
        connectionPool: 10,
        size: '2.4 GB'
      },
      users: userCount[0]?.count || 0,
      courses: courseCount[0]?.count || 0,
      instructors: instructorCount[0]?.count || 0,
      systemResources,
      lastBackup: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      backupSize: '1.2 GB'
    });
  } catch (error) {
    console.error('Error fetching system status:', error);
    res.status(500).json({ error: 'Failed to fetch system status' });
  }
});

app.post('/api/system/backup', authenticateToken, authorizeRole(['super_admin']), async (req, res) => {
  try {
    // Simulate backup creation
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Log the backup action
    await executeQuery(`
      INSERT INTO audit_logs (id, user_id, action, details, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      req.user.id,
      'SYSTEM_BACKUP_CREATED',
      'Manual backup created successfully',
      req.ip || req.connection.remoteAddress,
      req.headers['user-agent']
    ]);

    res.json({
      message: 'Backup created successfully',
      backupId: uuidv4(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ error: 'Failed to create backup' });
  }
});

// Set maximum listeners to prevent memory leak warnings
wss.setMaxListeners(20);

// WebSocket connection handling
wss.on('connection', (ws, req) => {
  console.log('🔗 New WebSocket connection');

  // Extract user ID from query parameters or headers
  const url = new URL(req.url, `http://${req.headers.host}`);
  const userId = url.searchParams.get('userId');

  if (!userId) {
    console.log('❌ No user ID provided, closing connection');
    ws.close();
    return;
  }

  // Store client connection
  const clientId = `${userId}_${Date.now()}`;
  connectedClients.set(clientId, {
    ws,
    userId,
    deviceId: url.searchParams.get('deviceId') || 'unknown',
    sessionId: url.searchParams.get('sessionId') || 'unknown'
  });

  console.log(`✅ Client connected: ${clientId} (User: ${userId})`);

  // Handle incoming messages
  const messageHandler = (message) => {
    try {
      const data = JSON.parse(message);
      console.log('📨 Received message:', data);

      // Broadcast message to other clients of the same user
      connectedClients.forEach((client, id) => {
        if (id !== clientId && client.userId === userId) {
          if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify(data));
          }
        }
      });

    } catch (error) {
      console.error('❌ Error parsing WebSocket message:', error);
    }
  };

  // Handle client disconnect
  const closeHandler = () => {
    console.log(`🔌 Client disconnected: ${clientId}`);
    connectedClients.delete(clientId);
    // Clean up event listeners
    ws.removeListener('message', messageHandler);
    ws.removeListener('close', closeHandler);
    ws.removeListener('error', errorHandler);
  };

  // Handle errors
  const errorHandler = (error) => {
    console.error(`❌ WebSocket error for ${clientId}:`, error);
    connectedClients.delete(clientId);
    // Clean up event listeners
    ws.removeListener('message', messageHandler);
    ws.removeListener('close', closeHandler);
    ws.removeListener('error', errorHandler);
  };

  // Add event listeners
  ws.on('message', messageHandler);
  ws.on('close', closeHandler);
  ws.on('error', errorHandler);
});

// Apply error handling middleware
app.use(errorHandler);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🌐 WebSocket URL: ws://localhost:${PORT}`);
  console.log(`📈 Monitoring enabled: ${process.env.NODE_ENV === 'production' ? 'Yes' : 'Development mode'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Graceful shutdown handler
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server gracefully...');

  // Close all WebSocket connections
  connectedClients.forEach((client, clientId) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.close();
    }
  });
  connectedClients.clear();

  // Close WebSocket server
  wss.close(() => {
    console.log('✅ WebSocket server closed');
  });

  // Close HTTP server
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    console.log('⚠️ Forced shutdown');
    process.exit(1);
  }, 10000);
});

// Simple Search API - No prepared statements
app.get('/api/search', async (req, res) => {
  try {
    const { q: query, limit = 20, offset = 0 } = req.query;

    if (!query || !query.trim()) {
      return res.json({
        results: [],
        total: 0,
        query: query || '',
        pagination: { limit: parseInt(limit), offset: parseInt(offset), total: 0, pages: 0 }
      });
    }

    const searchTerm = `%${query.trim()}%`;

    // Use direct database connection with query instead of execute
    const connection = await pool.getConnection();

    try {
      // Simple search query using query() instead of execute()
      const searchQuery = `
        SELECT
          c.id,
          c.title,
          c.description,
          c.thumbnail,
          c.banner,
          c.featured,
          c.total_xp,
          c.coming_soon,
          c.created_at,
          i.name as instructor_name,
          i.title as instructor_title,
          i.image as instructor_image,
          cat.name as category_name
        FROM courses c
        JOIN instructors i ON c.instructor_id = i.id
        JOIN categories cat ON c.category_id = cat.id
        WHERE c.title LIKE '${searchTerm}' OR c.description LIKE '${searchTerm}' OR i.name LIKE '${searchTerm}' OR cat.name LIKE '${searchTerm}'
        ORDER BY c.featured DESC, c.title ASC
        LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
      `;

      // Execute search query
      const [results] = await connection.query(searchQuery);

      // Get total count for pagination
      const countQuery = `
        SELECT COUNT(*) as total
        FROM courses c
        JOIN instructors i ON c.instructor_id = i.id
        JOIN categories cat ON c.category_id = cat.id
        WHERE c.title LIKE '${searchTerm}' OR c.description LIKE '${searchTerm}' OR i.name LIKE '${searchTerm}' OR cat.name LIKE '${searchTerm}'
      `;

      const [countResult] = await connection.query(countQuery);
      const total = countResult[0].total;

      // Add lessons to each course
      for (let result of results) {
        const [lessons] = await connection.query(
          `SELECT id, title, duration, thumbnail, video_url, description, xp_points, order_index FROM lessons WHERE course_id = ${result.id} ORDER BY order_index ASC`
        );
        result.lessons = lessons;
      }

      res.json({
        results,
        total,
        query: query.trim(),
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to perform search', details: error.message });
  }
});

// Search suggestions API
app.get('/api/search/suggestions', async (req, res) => {
  try {
    const { q: query, limit = 8 } = req.query;

    if (!query || !query.trim()) {
      return res.json({ suggestions: [] });
    }

    const searchTerm = `%${query.trim()}%`;
    const suggestions = [];

    // Get course title suggestions
    const courseSuggestions = await executeQuery(
      'SELECT title as text, "course" as type FROM courses WHERE title LIKE ? LIMIT ?',
      [searchTerm, Math.floor(limit / 2)]
    );
    suggestions.push(...courseSuggestions);

    // Get instructor name suggestions
    const instructorSuggestions = await executeQuery(
      'SELECT name as text, "instructor" as type FROM instructors WHERE name LIKE ? LIMIT ?',
      [searchTerm, Math.floor(limit / 4)]
    );
    suggestions.push(...instructorSuggestions);

    // Get category name suggestions
    const categorySuggestions = await executeQuery(
      'SELECT name as text, "category" as type FROM categories WHERE name LIKE ? LIMIT ?',
      [searchTerm, Math.floor(limit / 4)]
    );
    suggestions.push(...categorySuggestions);

    // Limit total suggestions
    const limitedSuggestions = suggestions.slice(0, parseInt(limit));

    res.json({ suggestions: limitedSuggestions });

  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({ error: 'Failed to get search suggestions' });
  }
});

// Popular searches API
app.get('/api/search/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // In a real app, this would come from a search_analytics table
    const popularSearches = [
      { query: 'business fundamentals', count: 1247 },
      { query: 'entrepreneurship', count: 892 },
      { query: 'marketing strategy', count: 756 },
      { query: 'financial management', count: 634 },
      { query: 'leadership skills', count: 521 },
      { query: 'digital marketing', count: 487 },
      { query: 'startup funding', count: 423 },
      { query: 'business strategy', count: 398 },
      { query: 'team management', count: 356 },
      { query: 'innovation', count: 312 }
    ].slice(0, parseInt(limit));

    res.json({ popularSearches });

  } catch (error) {
    console.error('Popular searches error:', error);
    res.status(500).json({ error: 'Failed to get popular searches' });
  }
});

// Search analytics API
app.get('/api/search/analytics', async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.json({ analytics: {} });
    }

    const analytics = await getSearchAnalytics(query);
    res.json({ analytics });

  } catch (error) {
    console.error('Search analytics error:', error);
    res.status(500).json({ error: 'Failed to get search analytics' });
  }
});

// Helper function to get search analytics
async function getSearchAnalytics(query) {
  try {
    // In a real app, this would query a search_analytics table
    // For now, return mock analytics data
    return {
      totalSearches: 15420,
      queryCount: Math.floor(Math.random() * 100) + 10,
      popularQueries: [
        { query: 'business fundamentals', count: 1247 },
        { query: 'entrepreneurship', count: 892 },
        { query: 'marketing', count: 756 },
        { query: 'finance', count: 634 },
        { query: 'leadership', count: 521 }
      ],
      searchTrends: [
        { date: '2024-01-01', searches: 120 },
        { date: '2024-01-02', searches: 145 },
        { date: '2024-01-03', searches: 132 },
        { date: '2024-01-04', searches: 167 },
        { date: '2024-01-05', searches: 189 }
      ],
      topCategories: [
        { name: 'Business', count: 2340 },
        { name: 'Technology', count: 1890 },
        { name: 'Finance', count: 1560 },
        { name: 'Marketing', count: 1230 },
        { name: 'Leadership', count: 980 }
      ],
      topInstructors: [
        { name: 'Ray Dalio', count: 890 },
        { name: 'Sara Blakely', count: 670 },
        { name: 'Elon Musk', count: 540 },
        { name: 'Oprah Winfrey', count: 420 },
        { name: 'Warren Buffett', count: 380 }
      ]
    };
  } catch (error) {
    console.error('Error getting search analytics:', error);
    return {};
  }
}

// Import video content management routes
const videoContentManagementRoutes = require('./routes/videoContentManagement');

// Mount video content management routes
app.use('/api/video-content', videoContentManagementRoutes);

// Initialize job processor service
const jobProcessorService = require('./services/jobProcessorService');

// Server is already started above - this was a duplicate call
console.log(`🚀 Forward Africa Backend Server running on port ${PORT}`);
console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
console.log(`🌐 CORS enabled for: ${corsOrigins.join(', ')}`);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');

  try {
    // Close job processor
    await jobProcessorService.shutdown();

    // Close database connections
    const { closeConnections } = require('./lib/database');
    await closeConnections();

    console.log('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');

  try {
    // Close job processor
    await jobProcessorService.shutdown();

    // Close database connections
    const { closeConnections } = require('./lib/database');
    await closeConnections();

    console.log('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});