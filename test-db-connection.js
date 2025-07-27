const mysql = require('mysql2/promise');

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  
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
    
    // Test connection
    const connection = await pool.getConnection();
    console.log('✅ Database connection successful');
    
    // Test query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Database query successful:', rows);
    
    // Test users table
    try {
      const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
      console.log('✅ Users table accessible:', users[0]);
    } catch (error) {
      console.log('❌ Users table error:', error.message);
    }
    
    connection.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error details:', error);
  }
}

testDatabaseConnection(); 