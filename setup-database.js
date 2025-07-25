const mysql = require('mysql2/promise');

async function setupDatabase() {
  let connection;

  try {
    console.log('🔧 Setting up database...');

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

    // Use the database
    await connection.execute('USE forward_africa_db');
    console.log('✅ Using forward_africa_db database');

    // Create instructors table
    await connection.execute(`
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
    console.log('✅ Instructors table created or already exists');

    // Test the connection by inserting a test instructor
    const testInstructor = {
      id: 'test-instructor-1',
      name: 'Test Instructor',
      title: 'Test Title',
      image: 'https://example.com/test.jpg',
      bio: 'Test bio',
      email: 'test@example.com',
      phone: null,
      expertise: JSON.stringify(['Test']),
      experience: 5,
      social_links: JSON.stringify({})
    };

    try {
      await connection.execute(
        'INSERT INTO instructors (id, name, title, image, bio, email, phone, expertise, experience, social_links) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [testInstructor.id, testInstructor.name, testInstructor.title, testInstructor.image, testInstructor.bio, testInstructor.email, testInstructor.phone, testInstructor.expertise, testInstructor.experience, testInstructor.social_links]
      );
      console.log('✅ Test instructor inserted successfully');
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log('ℹ️ Test instructor already exists');
      } else {
        throw error;
      }
    }

    console.log('✅ Database setup completed successfully!');

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

setupDatabase();