const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'forward_africa_db'
});

async function debugAuditLogs() {
  try {
    console.log('🔍 Debugging audit logs endpoint...');

    // Simulate the exact logic from the API endpoint
    const action = undefined;
    const resource_type = undefined;
    const user_id = undefined;
    const start_date = undefined;
    const end_date = undefined;
    const limit = 100;

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

    console.log('📋 Final query:', query);
    console.log('📋 Parameters:', params);

    const [logs] = await pool.execute(query, params);
    console.log('✅ Query successful! Found logs:', logs.length);

    if (logs.length > 0) {
      console.log('📋 Sample log:', logs[0]);
    }

  } catch (error) {
    console.error('❌ Error in audit logs query:', error.message);
    console.error('❌ Full error:', error);
  } finally {
    await pool.end();
  }
}

debugAuditLogs();