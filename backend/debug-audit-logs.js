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

async function debugAuditLogs() {
  console.log('🔍 Debugging audit logs...');

  try {
    // Create database connection
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected');

    // Test 1: Check if audit_logs table exists
    console.log('\n📋 Test 1: Checking audit_logs table...');
    const [tables] = await connection.execute(`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = ? AND table_name = 'audit_logs'
    `, [dbConfig.database]);

    console.log('📋 Audit logs table exists:', tables[0].count > 0);

    if (tables[0].count === 0) {
      console.log('❌ Audit logs table does not exist!');
      return;
    }

    // Test 2: Check table structure
    console.log('\n📋 Test 2: Checking table structure...');
    const [columns] = await connection.execute(`
      DESCRIBE audit_logs
    `);

    console.log('📋 Table columns:');
    columns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Test 3: Check if there are any records
    console.log('\n📋 Test 3: Checking for records...');
    const [count] = await connection.execute('SELECT COUNT(*) as count FROM audit_logs');
    console.log('📋 Total audit logs:', count[0].count);

    // Test 4: Get sample records
    console.log('\n📋 Test 4: Getting sample records...');
    const [logs] = await connection.execute(`
      SELECT al.*, u.full_name as user_name, u.email as user_email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 5
    `);

    console.log('📋 Sample logs:');
    logs.forEach((log, index) => {
      console.log(`   ${index + 1}. ${log.action} by ${log.user_email || 'Unknown'} at ${log.created_at}`);
    });

    // Test 5: Test the exact query from the API
    console.log('\n📋 Test 5: Testing API query...');
    const { action, resource_type, user_id, start_date, end_date, limit = 100 } = { limit: 5 };

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

    console.log('🔍 Executing query:', query);
    console.log('📋 Query parameters:', params);

    const [result] = await connection.execute(query, params);
    console.log('✅ Query successful! Found logs:', result.length);

    await connection.end();
    console.log('\n✅ Debug completed successfully');

  } catch (error) {
    console.error('❌ Debug failed:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
  }
}

debugAuditLogs();