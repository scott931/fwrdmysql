const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'forward_africa_db'
});

async function fixAuditLogs() {
  try {
    console.log('🔧 Fixing audit logs table...');

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

    if (tables[0].count === 0) {
      console.log('📋 Creating audit_logs table...');

      // Create the audit_logs table
      await pool.execute(`
        CREATE TABLE audit_logs (
          id VARCHAR(36) PRIMARY KEY,
          user_id VARCHAR(36),
          action VARCHAR(100) NOT NULL,
          resource_type VARCHAR(50) NOT NULL,
          resource_id VARCHAR(36),
          details JSON,
          ip_address VARCHAR(45),
          user_agent TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'low',
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        )
      `);

      console.log('📋 Audit logs table created successfully');
    }

    // Check if table has data
    const [count] = await pool.execute('SELECT COUNT(*) as count FROM audit_logs');
    console.log('📋 Current audit logs count:', count[0].count);

    if (count[0].count === 0) {
      console.log('📋 Inserting sample audit logs...');

      // Insert sample audit logs
      await pool.execute(`
        INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, details, ip_address, severity) VALUES
        ('audit1', 'u1', 'login', 'user', 'u1', '{"method": "email", "success": true}', '192.168.1.100', 'low'),
        ('audit2', 'u2', 'create_course', 'course', 'course1', '{"title": "Business Fundamentals", "instructor": "inst1"}', '192.168.1.101', 'medium'),
        ('audit3', 'u4', 'complete_course', 'course', 'course1', '{"courseTitle": "Business Fundamentals", "xpEarned": 500}', '192.168.1.102', 'low'),
        ('audit4', 'u3', 'join_group', 'community_group', 'group2', '{"groupName": "Tech Innovators"}', '192.168.1.103', 'low'),
        ('audit5', 'u2', 'update_profile', 'user', 'u2', '{"fields": ["job_title", "topics_of_interest"]}', '192.168.1.101', 'low'),
        ('audit6', 'u1', 'admin_login', 'auth', 'u1', '{"admin_panel": true, "ip_whitelisted": true}', '192.168.1.100', 'medium'),
        ('audit7', 'u2', 'delete_user', 'user', 'u5', '{"deleted_user_email": "user5@example.com", "reason": "inactive"}', '192.168.1.101', 'high'),
        ('audit8', 'u1', 'change_permissions', 'user', 'u3', '{"old_role": "user", "new_role": "content_manager"}', '192.168.1.100', 'high')
      `);

      console.log('📋 Sample audit logs inserted successfully');
    }

    // Test the query that the API uses
    const [logs] = await pool.execute(`
      SELECT al.*, u.full_name as user_name, u.email as user_email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 10
    `);

    console.log('📋 Test query successful, found logs:', logs.length);
    console.log('📋 Sample log:', logs[0]);

  } catch (error) {
    console.error('❌ Error fixing audit logs:', error.message);
  } finally {
    await pool.end();
  }
}

fixAuditLogs();