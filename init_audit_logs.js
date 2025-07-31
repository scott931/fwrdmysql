const mysql = require('mysql2/promise');

async function initAuditLogs() {
  let connection;

  try {
    // Create connection
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'forward_africa_db'
    });

    console.log('🔗 Connected to database');

    // Check if audit_logs table exists
    const [tables] = await connection.execute('SHOW TABLES LIKE "audit_logs"');

    if (tables.length === 0) {
      console.log('📋 Creating audit_logs table...');

      // Create the audit_logs table
      await connection.execute(`
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
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        )
      `);

      // Create indexes
      await connection.execute('CREATE INDEX idx_audit_logs_user ON audit_logs(user_id)');
      await connection.execute('CREATE INDEX idx_audit_logs_action ON audit_logs(action)');
      await connection.execute('CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at)');

      console.log('✅ audit_logs table created successfully');
    } else {
      console.log('✅ audit_logs table already exists');
    }

    // Check if we have any audit logs
    const [countResult] = await connection.execute('SELECT COUNT(*) as count FROM audit_logs');
    const count = countResult[0].count;

    console.log(`📊 Current audit logs count: ${count}`);

    // Add sample audit logs if table is empty
    if (count === 0) {
      console.log('📝 Adding sample audit logs...');

      const sampleLogs = [
        {
          id: 'audit1',
          user_id: 'u1',
          action: 'LOGIN',
          resource_type: 'user',
          resource_id: 'u1',
          details: JSON.stringify({ method: 'email', success: true }),
          ip_address: '192.168.1.100'
        },
        {
          id: 'audit2',
          user_id: 'u2',
          action: 'CREATE_COURSE',
          resource_type: 'course',
          resource_id: 'course1',
          details: JSON.stringify({ title: 'Business Fundamentals', instructor: 'inst1' }),
          ip_address: '192.168.1.101'
        },
        {
          id: 'audit3',
          user_id: 'u4',
          action: 'COMPLETE_COURSE',
          resource_type: 'course',
          resource_id: 'course1',
          details: JSON.stringify({ courseTitle: 'Business Fundamentals', xpEarned: 500 }),
          ip_address: '192.168.1.102'
        },
        {
          id: 'audit4',
          user_id: 'u3',
          action: 'JOIN_GROUP',
          resource_type: 'community_group',
          resource_id: 'group2',
          details: JSON.stringify({ groupName: 'Tech Innovators' }),
          ip_address: '192.168.1.103'
        },
        {
          id: 'audit5',
          user_id: 'u2',
          action: 'UPDATE_PROFILE',
          resource_type: 'user',
          resource_id: 'u2',
          details: JSON.stringify({ fields: ['job_title', 'topics_of_interest'] }),
          ip_address: '192.168.1.101'
        },
        {
          id: 'audit6',
          user_id: 'u1',
          action: 'LOGOUT',
          resource_type: 'user',
          resource_id: 'u1',
          details: JSON.stringify({ session_duration: '2h 15m' }),
          ip_address: '192.168.1.100'
        },
        {
          id: 'audit7',
          user_id: 'u3',
          action: 'CREATE_LESSON',
          resource_type: 'lesson',
          resource_id: 'lesson1',
          details: JSON.stringify({ courseId: 'course1', title: 'Introduction to Business' }),
          ip_address: '192.168.1.103'
        },
        {
          id: 'audit8',
          user_id: 'u4',
          action: 'ADD_FAVORITE',
          resource_type: 'course',
          resource_id: 'course2',
          details: JSON.stringify({ courseTitle: 'Digital Marketing' }),
          ip_address: '192.168.1.102'
        }
      ];

      for (const log of sampleLogs) {
        await connection.execute(
          'INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [log.id, log.user_id, log.action, log.resource_type, log.resource_id, log.details, log.ip_address]
        );
      }

      console.log('✅ Sample audit logs added successfully');
    } else {
      console.log('ℹ️  Audit logs already exist, skipping sample data');
    }

    // Verify the data
    const [logs] = await connection.execute('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 5');
    console.log('📋 Recent audit logs:');
    logs.forEach((log, index) => {
      console.log(`  ${index + 1}. ${log.action} by user ${log.user_id} on ${log.resource_type}`);
    });

    console.log('✅ Audit logs initialization completed successfully');

  } catch (error) {
    console.error('❌ Error initializing audit logs:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the initialization
initAuditLogs().then(() => {
  console.log('🎉 Script completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});