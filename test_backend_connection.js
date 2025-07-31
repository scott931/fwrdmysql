const mysql = require('mysql2/promise');

async function testBackendConnection() {
  // Use the same database config as the backend server
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

  console.log('🔍 Testing Backend Database Connection...\n');
  console.log('Database config:', {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    database: dbConfig.database,
    password: dbConfig.password ? '***' : 'empty'
  });

  try {
    // Create pool like the backend server
    const pool = mysql.createPool(dbConfig);
    console.log('✅ Pool created successfully');

    // Test connection
    const connection = await pool.getConnection();
    console.log('✅ Got connection from pool');
    connection.release();

    // Test executeQuery function like the backend
    const executeQuery = async (query, params = []) => {
      try {
        const [rows] = await pool.execute(query, params);
        return rows;
      } catch (error) {
        console.error('Database query error:', error);
        if (error.code === 'ER_ACCESS_DENIED_ERROR' || error.code === 'ECONNREFUSED') {
          console.log('⚠️ Database not available, returning empty results');
          return [];
        }
        throw error;
      }
    };

    // Test banner query
    console.log('📝 Testing banner query with executeQuery...');
    const configRows = await executeQuery(`
      SELECT
        homepage_banner_enabled,
        homepage_banner_type,
        homepage_banner_video_url,
        homepage_banner_image_url,
        homepage_banner_title,
        homepage_banner_subtitle,
        homepage_banner_description,
        homepage_banner_button_text,
        homepage_banner_button_url,
        homepage_banner_overlay_opacity
      FROM system_configuration WHERE id = 1
    `);

    console.log('✅ executeQuery result:', configRows);

    await pool.end();

  } catch (error) {
    console.log('❌ Backend connection test failed');
    console.log('Error:', error.message);
    console.log('Error code:', error.code);
  }
}

testBackendConnection();