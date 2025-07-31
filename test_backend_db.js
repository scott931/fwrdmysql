const mysql = require('mysql2/promise');

async function testBackendDB() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'forward_africa_db'
  };

  console.log('🔍 Testing Backend Database Connection...\n');
  console.log('Database config:', {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    database: dbConfig.database
  });

  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Test simple query
    console.log('📝 Testing simple query...');
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM system_configuration');
    console.log('✅ Simple query result:', rows[0]);

    // Test banner query
    console.log('📝 Testing banner query...');
    const [bannerRows] = await connection.execute(`
      SELECT homepage_banner_enabled, homepage_banner_type
      FROM system_configuration WHERE id = 1
    `);
    console.log('✅ Banner query result:', bannerRows);

    await connection.end();

  } catch (error) {
    console.log('❌ Database connection failed');
    console.log('Error:', error.message);
    console.log('Error code:', error.code);
  }
}

testBackendDB();