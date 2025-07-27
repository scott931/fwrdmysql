const mysql = require('mysql2/promise');

// Database configuration (same as secureRoutes)
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

async function testSecureRoutesDB() {
  console.log('🔍 Testing secureRoutes database connection...');

  try {
    // Create database connection
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected');

    // Test the exact query from secureRoutes audit logs
    console.log('\n📋 Testing secureRoutes audit logs query...');

    const page = 1;
    const limit = 5;
    const offset = (page - 1) * limit;
    const action = '';
    const userId = '';

    let query = `
      SELECT al.*, u.email, u.full_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
    let params = [];

    if (action) {
      query += ` AND al.action LIKE ?`;
      params.push(`%${action}%`);
    }

    if (userId) {
      query += ` AND al.user_id = ?`;
      params.push(userId);
    }

    query += ` ORDER BY al.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    console.log('🔍 Executing query:', query);
    console.log('📋 Query parameters:', params);

    const [logs] = await connection.execute(query, params);
    console.log('✅ Query successful! Found logs:', logs.length);

    if (logs.length > 0) {
      console.log('📋 Sample log:', logs[0]);
    }

    // Test the count query
    console.log('\n📋 Testing count query...');
    let countQuery = `SELECT COUNT(*) as total FROM audit_logs al WHERE 1=1`;
    if (action) {
      countQuery += ` AND al.action LIKE ?`;
    }
    if (userId) {
      countQuery += ` AND al.user_id = ?`;
    }
    const [countResult] = await connection.execute(countQuery, action || userId ? [action, userId].filter(Boolean) : []);
    const total = countResult[0].total;
    console.log('✅ Count query successful! Total logs:', total);

    await connection.end();
    console.log('\n✅ SecureRoutes database test completed successfully');

  } catch (error) {
    console.error('❌ SecureRoutes database test failed:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
  }
}

testSecureRoutesDB();