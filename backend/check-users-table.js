const mysql = require('mysql2/promise');

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

async function checkUsersTable() {
  console.log('🔍 Checking users table structure...');

  try {
    // Create database connection
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected');

    // Check table structure
    console.log('\n📋 Users table structure:');
    const [columns] = await connection.execute('DESCRIBE users');
    columns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Check if permissions column exists
    const hasPermissions = columns.some(col => col.Field === 'permissions');
    console.log('\n📋 Permissions column exists:', hasPermissions);

    // Check if is_active column exists
    const hasIsActive = columns.some(col => col.Field === 'is_active');
    console.log('📋 is_active column exists:', hasIsActive);

    // Show sample user data
    console.log('\n📋 Sample user data:');
    const [users] = await connection.execute('SELECT id, email, full_name, role FROM users LIMIT 3');
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ID: ${user.id}, Email: ${user.email}, Name: ${user.full_name}, Role: ${user.role}`);
    });

    await connection.end();
    console.log('\n✅ Users table check completed');

  } catch (error) {
    console.error('❌ Check failed:', error);
    console.error('Error details:', error.message);
  }
}

checkUsersTable();