const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'forward_africa_db'
});

async function checkAuditLogsTable() {
  try {
    console.log('🔍 Testing database connection...');

    // Test connection
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();

    // Check if audit_logs table exists
    const [tables] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = 'forward_africa_db'
      AND table_name = 'audit_logs'
    `);

    console.log('📋 Audit logs table exists:', tables[0].count > 0);

    if (tables[0].count > 0) {
      // Check audit logs data
      const [logs] = await pool.execute('SELECT COUNT(*) as count FROM audit_logs');
      console.log('📋 Audit logs count:', logs[0].count);

      // Get sample audit logs
      const [sampleLogs] = await pool.execute('SELECT * FROM audit_logs LIMIT 5');
      console.log('📋 Sample audit logs:', sampleLogs);
    } else {
      console.log('❌ Audit logs table does not exist');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkAuditLogsTable();