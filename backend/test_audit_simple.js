const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'forward_africa_db'
});

async function testAuditLogsQuery() {
  try {
    console.log('🔍 Testing audit logs query...');

    // Test the exact query from the API
    const query = `
      SELECT al.*, u.full_name as user_name, u.email as user_email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
      ORDER BY al.created_at DESC LIMIT 100
    `;

    console.log('📋 Executing query:', query);

    const [logs] = await pool.execute(query);
    console.log('📋 Query successful! Found logs:', logs.length);

    if (logs.length > 0) {
      console.log('📋 Sample log:', logs[0]);
    }

  } catch (error) {
    console.error('❌ Error testing audit logs query:', error.message);
    console.error('❌ Full error:', error);
  } finally {
    await pool.end();
  }
}

testAuditLogsQuery();