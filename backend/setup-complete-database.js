const mysql = require('mysql2/promise');

async function setupCompleteDatabase() {
  let connection;

  try {
    console.log('🔧 Setting up complete database with authentication...');

    // First, connect without specifying a database
    const config = {
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '', // Empty password for root user
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    };

    connection = await mysql.createConnection(config);
    console.log('✅ Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.execute('CREATE DATABASE IF NOT EXISTS forward_africa_db');
    console.log('✅ Database created or already exists');

    // Close connection and reconnect with database
    await connection.end();

    // Reconnect with database specified
    const dbConfig = {
      ...config,
      database: 'forward_africa_db'
    };

    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to forward_africa_db database');

    // Drop existing tables if they exist (for clean setup)
    console.log('🗑️ Dropping existing tables...');
    await connection.execute('DROP TABLE IF EXISTS audit_logs');
    await connection.execute('DROP TABLE IF EXISTS user_progress');
    await connection.execute('DROP TABLE IF EXISTS certificates');
    await connection.execute('DROP TABLE IF EXISTS achievements');
    await connection.execute('DROP TABLE IF EXISTS lessons');
    await connection.execute('DROP TABLE IF EXISTS courses');
    await connection.execute('DROP TABLE IF EXISTS categories');
    await connection.execute('DROP TABLE IF EXISTS instructors');
    await connection.execute('DROP TABLE IF EXISTS users');
    await connection.execute('DROP TABLE IF EXISTS security_events');
    await connection.execute('DROP TABLE IF EXISTS system_config');

    // Create users table with authentication fields
    console.log('👥 Creating users table...');
    await connection.execute(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(191) UNIQUE NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'content_manager', 'admin', 'super_admin') DEFAULT 'user',
        permissions JSON,
        avatar_url TEXT,
        onboarding_completed BOOLEAN DEFAULT FALSE,
        industry VARCHAR(255),
        experience_level VARCHAR(100),
        business_stage VARCHAR(100),
        country VARCHAR(100),
        state_province VARCHAR(100),
        city VARCHAR(100),
        is_active BOOLEAN DEFAULT TRUE,
        failed_login_attempts INT DEFAULT 0,
        last_failed_login TIMESTAMP NULL,
        refresh_token TEXT NULL,
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    // Create categories table
    console.log('📂 Creating categories table...');
    await connection.execute(`
      CREATE TABLE categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Categories table created');

    // Create instructors table
    console.log('👨‍🏫 Creating instructors table...');
    await connection.execute(`
      CREATE TABLE instructors (
        id INT AUTO_INCREMENT PRIMARY KEY,
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
    console.log('✅ Instructors table created');

    // Create courses table
    console.log('📚 Creating courses table...');
    await connection.execute(`
      CREATE TABLE courses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        instructor_id INT NOT NULL,
        category_id INT NOT NULL,
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
    console.log('✅ Courses table created');

    // Create lessons table
    console.log('📖 Creating lessons table...');
    await connection.execute(`
      CREATE TABLE lessons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course_id INT NOT NULL,
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
    console.log('✅ Lessons table created');

    // Create audit_logs table
    console.log('📝 Creating audit_logs table...');
    await connection.execute(`
      CREATE TABLE audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        action VARCHAR(255) NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        status_code INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_action (action),
        INDEX idx_created_at (created_at),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Audit_logs table created');

    // Create security_events table
    console.log('🔒 Creating security_events table...');
    await connection.execute(`
      CREATE TABLE security_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        event_type VARCHAR(50) NOT NULL,
        ip_address VARCHAR(45),
        details JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_event_type (event_type),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Security_events table created');

    // Create system_config table
    console.log('⚙️ Creating system_config table...');
    await connection.execute(`
      CREATE TABLE system_config (
        id INT AUTO_INCREMENT PRIMARY KEY,
        config_key VARCHAR(191) NOT NULL UNIQUE,
        config_value TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ System_config table created');

    // Insert default system config
    console.log('📋 Inserting default system configuration...');
    await connection.execute(`
      INSERT INTO system_config (config_key, config_value, description) VALUES
      ('site_name', 'Forward Africa', 'Website name'),
      ('maintenance_mode', 'false', 'Maintenance mode status'),
      ('max_upload_size', '50', 'Maximum file upload size in MB'),
      ('session_timeout', '30', 'Session timeout in minutes'),
      ('security_level', 'high', 'Security level')
    `);
    console.log('✅ Default system configuration inserted');

    // Insert sample categories
    console.log('📂 Inserting sample categories...');
    await connection.execute(`
      INSERT INTO categories (name, description) VALUES
      ('Business & Entrepreneurship', 'Learn essential business skills and entrepreneurial strategies'),
      ('Technology & Innovation', 'Master modern technology and innovation practices'),
      ('Leadership & Management', 'Develop leadership skills and management techniques'),
      ('Marketing & Sales', 'Learn effective marketing and sales strategies'),
      ('Finance & Investment', 'Understand financial management and investment principles')
    `);
    console.log('✅ Sample categories inserted');

    // Insert sample instructors
    console.log('👨‍🏫 Inserting sample instructors...');
    await connection.execute(`
      INSERT INTO instructors (name, title, image, bio, email, phone, expertise, experience, social_links) VALUES
      ('Dr. Sarah Johnson', 'Business Professor', 'https://example.com/sarah.jpg', 'Expert in business strategy and entrepreneurship', 'sarah@forwardafrica.com', '+1234567890', '["Business Strategy", "Entrepreneurship", "Leadership"]', 15, '{"linkedin": "https://linkedin.com/in/sarah", "twitter": "https://twitter.com/sarah"}'),
      ('Mike Chen', 'Marketing Expert', 'https://example.com/mike.jpg', 'Digital marketing specialist with 10+ years experience', 'mike@forwardafrica.com', '+1234567891', '["Digital Marketing", "Social Media", "Brand Strategy"]', 12, '{"linkedin": "https://linkedin.com/in/mike", "twitter": "https://twitter.com/mike"}'),
      ('Lisa Rodriguez', 'Financial Advisor', 'https://example.com/lisa.jpg', 'Certified financial planner and investment advisor', 'lisa@forwardafrica.com', '+1234567892', '["Financial Planning", "Investment", "Risk Management"]', 18, '{"linkedin": "https://linkedin.com/in/lisa", "twitter": "https://twitter.com/lisa"}')
    `);
    console.log('✅ Sample instructors inserted');

    // Insert admin user with hashed password
    console.log('👤 Creating admin user...');
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await connection.execute(`
      INSERT INTO users (email, full_name, password, role, permissions, is_active) VALUES
      ('admin@forwardafrica.com', 'System Administrator', ?, 'super_admin', '["all"]', TRUE)
    `, [hashedPassword]);
    console.log('✅ Admin user created');

    // Insert sample regular user
    console.log('👤 Creating sample user...');
    const userPassword = await bcrypt.hash('user123', 10);

    await connection.execute(`
      INSERT INTO users (email, full_name, password, role, permissions, is_active) VALUES
      ('user@forwardafrica.com', 'Sample User', ?, 'user', '["read_courses", "watch_videos"]', TRUE)
    `, [userPassword]);
    console.log('✅ Sample user created');

    console.log('✅ Complete database setup finished successfully!');
    console.log('');
    console.log('📋 Database Summary:');
    console.log('   - Database: forward_africa_db');
    console.log('   - Admin user: admin@forwardafrica.com / admin123');
    console.log('   - Sample user: user@forwardafrica.com / user123');
    console.log('   - Categories: 5 sample categories');
    console.log('   - Instructors: 3 sample instructors');
    console.log('   - Security: Audit logs and security events enabled');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    console.error('Error details:', error.message);
    console.error('Error code:', error.code);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Database connection closed');
    }
  }
}

setupCompleteDatabase();