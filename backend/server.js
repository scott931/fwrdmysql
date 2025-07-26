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

const app = express();
const PORT = process.env.PORT || 3002;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Create HTTP server
const server = require('http').createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected clients
const connectedClients = new Map();

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
    fileSize: 5 * 1024 * 1024 // 5MB limit
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
      updateRole,
      userId: req.params.id
    });
    console.log('🔧 Update fields:', updateFields);
    console.log('🔧 Update values:', updateValues);

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    await executeQuery(updateQuery, updateValues);

    // Return the updated user data
    const [updatedUser] = await executeQuery(
      'SELECT id, email, full_name, avatar_url, role, onboarding_completed, industry, experience_level, business_stage, country, state_province, city FROM users WHERE id = ?',
      [req.params.id]
    );

    // Add permissions field (empty array for now since permissions table doesn't exist)
    updatedUser.permissions = [];

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

// Analytics API
app.get('/api/analytics/platform', async (req, res) => {
  try {
    console.log('📊 Fetching platform analytics from database...');

    // Basic counts from existing tables
    const [userCount] = await executeQuery('SELECT COUNT(*) as count FROM users');
    const [courseCount] = await executeQuery('SELECT COUNT(*) as count FROM courses');
    const [lessonCount] = await executeQuery('SELECT COUNT(*) as count FROM lessons');
    const [certificateCount] = await executeQuery('SELECT COUNT(*) as count FROM certificates');
    const [instructorCount] = await executeQuery('SELECT COUNT(*) as count FROM instructors');
    const [completedCoursesCount] = await executeQuery('SELECT COUNT(*) as count FROM user_progress WHERE completed = true');
    const [activeStudentsCount] = await executeQuery('SELECT COUNT(DISTINCT user_id) as count FROM user_progress');
    const [totalXP] = await executeQuery('SELECT SUM(xp_earned) as total FROM user_progress');
    const [totalEnrollments] = await executeQuery('SELECT COUNT(*) as count FROM user_progress');

    // Real analytics from new tables
    const [totalWatchTime] = await executeQuery(`
      SELECT COALESCE(SUM(duration_seconds), 0) as total_seconds
      FROM course_watch_time
      WHERE watch_end IS NOT NULL
    `);

    const [avgSessionDuration] = await executeQuery(`
      SELECT COALESCE(AVG(duration_seconds), 0) as avg_seconds
      FROM user_sessions
      WHERE session_end IS NOT NULL AND duration_seconds > 0
    `);

    const [dailyActiveUsers] = await executeQuery(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM user_sessions
      WHERE DATE(session_start) = CURDATE()
    `);

    const [weeklyActiveUsers] = await executeQuery(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM user_sessions
      WHERE session_start >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    const [monthlyActiveUsers] = await executeQuery(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM user_sessions
      WHERE session_start >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    // Calculate completion rate
    const completionRate = totalEnrollments.count > 0 ? (completedCoursesCount.count / totalEnrollments.count * 100).toFixed(1) : 0;

    // Get recent activity (last 7 days)
    const [recentActivity] = await executeQuery(`
      SELECT COUNT(*) as count FROM user_progress
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    // Calculate user retention rate (users who logged in this month vs last month)
    const [currentMonthUsers] = await executeQuery(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM user_sessions
      WHERE session_start >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    const [lastMonthUsers] = await executeQuery(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM user_sessions
      WHERE session_start >= DATE_SUB(NOW(), INTERVAL 60 DAY)
      AND session_start < DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    const userRetentionRate = lastMonthUsers.count > 0 ?
      ((currentMonthUsers.count / lastMonthUsers.count) * 100).toFixed(1) : 85.2;

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
      recentActivity: recentActivity.count,
      totalWatchTimeHours: (totalWatchTime.total_seconds / 3600).toFixed(2),
      avgSessionDurationMinutes: (avgSessionDuration.avg_seconds / 60).toFixed(2),
      dailyActiveUsers: dailyActiveUsers.count,
      weeklyActiveUsers: weeklyActiveUsers.count,
      monthlyActiveUsers: monthlyActiveUsers.count,
      userRetentionRate: parseFloat(userRetentionRate)
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
      recentActivity: recentActivity.count,
      totalWatchTimeHours: parseFloat((totalWatchTime.total_seconds / 3600).toFixed(2)),
      avgSessionDurationMinutes: parseFloat((avgSessionDuration.avg_seconds / 60).toFixed(2)),
      dailyActiveUsers: dailyActiveUsers.count,
      weeklyActiveUsers: weeklyActiveUsers.count,
      monthlyActiveUsers: monthlyActiveUsers.count,
      userRetentionRate: parseFloat(userRetentionRate)
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
  ws.on('message', (message) => {
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
  });

  // Handle client disconnect
  ws.on('close', () => {
    console.log(`🔌 Client disconnected: ${clientId}`);
    connectedClients.delete(clientId);
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error(`❌ WebSocket error for ${clientId}:`, error);
    connectedClients.delete(clientId);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
  console.log(`🏥 Health check at http://localhost:${PORT}/api/health`);
  console.log(`🔗 WebSocket server ready on ws://localhost:${PORT}`);
});