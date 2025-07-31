const mysql = require('mysql2/promise');

async function addSampleAuditLogs() {
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

    // Clear existing audit logs
    console.log('🗑️ Clearing existing audit logs...');
    await connection.execute('DELETE FROM audit_logs');
    console.log('✅ Existing logs cleared');

    // Add meaningful sample audit logs
    console.log('📝 Adding sample audit logs...');

    const sampleLogs = [
      {
        id: 'audit_001',
        user_id: 'u1',
        action: 'LOGIN',
        resource_type: 'user',
        resource_id: 'u1',
        details: JSON.stringify({ method: 'email', success: true, ip: '192.168.1.100' }),
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        id: 'audit_002',
        user_id: 'u2',
        action: 'CREATE_COURSE',
        resource_type: 'course',
        resource_id: 'course1',
        details: JSON.stringify({ title: 'Business Fundamentals', instructor: 'inst1', category: 'Business' }),
        ip_address: '192.168.1.101',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      {
        id: 'audit_003',
        user_id: 'u4',
        action: 'COMPLETE_COURSE',
        resource_type: 'course',
        resource_id: 'course1',
        details: JSON.stringify({ courseTitle: 'Business Fundamentals', xpEarned: 500, grade: 'A' }),
        ip_address: '192.168.1.102',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        id: 'audit_004',
        user_id: 'u3',
        action: 'JOIN_GROUP',
        resource_type: 'community_group',
        resource_id: 'group2',
        details: JSON.stringify({ groupName: 'Tech Innovators', memberCount: 45 }),
        ip_address: '192.168.1.103',
        user_agent: 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36'
      },
      {
        id: 'audit_005',
        user_id: 'u2',
        action: 'UPDATE_PROFILE',
        resource_type: 'user',
        resource_id: 'u2',
        details: JSON.stringify({ fields: ['job_title', 'topics_of_interest'], oldValues: {}, newValues: {} }),
        ip_address: '192.168.1.101',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      {
        id: 'audit_006',
        user_id: 'u1',
        action: 'LOGOUT',
        resource_type: 'user',
        resource_id: 'u1',
        details: JSON.stringify({ session_duration: '2h 15m', reason: 'user_initiated' }),
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        id: 'audit_007',
        user_id: 'u3',
        action: 'CREATE_LESSON',
        resource_type: 'lesson',
        resource_id: 'lesson1',
        details: JSON.stringify({ courseId: 'course1', title: 'Introduction to Business', duration: '45min' }),
        ip_address: '192.168.1.103',
        user_agent: 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36'
      },
      {
        id: 'audit_008',
        user_id: 'u4',
        action: 'ADD_FAVORITE',
        resource_type: 'course',
        resource_id: 'course2',
        details: JSON.stringify({ courseTitle: 'Digital Marketing', category: 'Marketing' }),
        ip_address: '192.168.1.102',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        id: 'audit_009',
        user_id: 'u1',
        action: 'UPLOAD_VIDEO',
        resource_type: 'lesson',
        resource_id: 'lesson2',
        details: JSON.stringify({ fileName: 'business_intro.mp4', size: '15.2MB', duration: '12:30' }),
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        id: 'audit_010',
        user_id: 'u2',
        action: 'DELETE_COURSE',
        resource_type: 'course',
        resource_id: 'course3',
        details: JSON.stringify({ courseTitle: 'Old Course', reason: 'outdated_content' }),
        ip_address: '192.168.1.101',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      {
        id: 'audit_011',
        user_id: 'u3',
        action: 'SEND_MESSAGE',
        resource_type: 'community_group',
        resource_id: 'group2',
        details: JSON.stringify({ messageType: 'text', groupName: 'Tech Innovators', messageLength: 120 }),
        ip_address: '192.168.1.103',
        user_agent: 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36'
      },
      {
        id: 'audit_012',
        user_id: 'u4',
        action: 'EARN_CERTIFICATE',
        resource_type: 'certificate',
        resource_id: 'cert1',
        details: JSON.stringify({ courseTitle: 'Business Fundamentals', certificateId: 'CERT-2024-001', grade: 'A' }),
        ip_address: '192.168.1.102',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        id: 'audit_013',
        user_id: 'u1',
        action: 'RESET_PASSWORD',
        resource_type: 'user',
        resource_id: 'u1',
        details: JSON.stringify({ method: 'email', success: true, ip: '192.168.1.100' }),
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        id: 'audit_014',
        user_id: 'u2',
        action: 'UPDATE_COURSE',
        resource_type: 'course',
        resource_id: 'course1',
        details: JSON.stringify({ field: 'description', oldValue: 'Old description', newValue: 'Updated description' }),
        ip_address: '192.168.1.101',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      {
        id: 'audit_015',
        user_id: 'u3',
        action: 'VIEW_LESSON',
        resource_type: 'lesson',
        resource_id: 'lesson1',
        details: JSON.stringify({ duration: '25min', progress: 100, courseId: 'course1' }),
        ip_address: '192.168.1.103',
        user_agent: 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36'
      }
    ];

    for (const log of sampleLogs) {
      await connection.execute(
        'INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, details, ip_address, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
        [log.id, log.user_id, log.action, log.resource_type, log.resource_id, log.details, log.ip_address, log.user_agent]
      );
    }

    console.log('✅ Sample audit logs added successfully');

    // Verify the data
    console.log('\n📋 Verifying sample data...');
    const [logs] = await connection.execute(`
      SELECT al.*, u.email as user_email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 10
    `);

    console.log('📋 Recent audit logs:');
    logs.forEach((log, index) => {
      console.log(`  ${index + 1}. ${log.action} by ${log.user_email || log.user_id} on ${log.resource_type}`);
    });

    console.log('\n✅ Sample audit logs setup completed successfully!');

  } catch (error) {
    console.error('❌ Error adding sample audit logs:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the script
addSampleAuditLogs().then(() => {
  console.log('🎉 Script completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});