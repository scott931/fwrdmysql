const mysql = require('mysql2/promise');

async function testAuditLogs() {
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

    // Test 1: Check if audit_logs table exists and has data
    console.log('\n📋 Test 1: Checking audit_logs table...');
    const [tables] = await connection.execute('SHOW TABLES LIKE "audit_logs"');
    console.log('✅ Table exists:', tables.length > 0);

    if (tables.length > 0) {
      const [countResult] = await connection.execute('SELECT COUNT(*) as count FROM audit_logs');
      console.log('📊 Total audit logs:', countResult[0].count);
    }

    // Test 2: Check table structure
    console.log('\n📋 Test 2: Checking table structure...');
    const [structure] = await connection.execute('DESCRIBE audit_logs');
    console.log('📋 Table structure:');
    structure.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
    });

    // Test 3: Get sample data
    console.log('\n📋 Test 3: Getting sample audit logs...');
    const [logs] = await connection.execute(`
      SELECT al.*, u.email as user_email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 5
    `);

    console.log('📋 Sample audit logs:');
    logs.forEach((log, index) => {
      console.log(`  ${index + 1}. ${log.action} by ${log.user_email || log.user_id} on ${log.resource_type} at ${log.created_at}`);
    });

    // Test 4: Test the exact query that the API uses
    console.log('\n📋 Test 4: Testing API query...');
    const [apiLogs] = await connection.execute(`
      SELECT al.*, u.full_name as user_name, u.email as user_email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
      ORDER BY al.created_at DESC
      LIMIT 10
    `);

    console.log('📋 API query results:', apiLogs.length, 'records');
    apiLogs.forEach((log, index) => {
      console.log(`  ${index + 1}. ${log.action} by ${log.user_email || log.user_id} on ${log.resource_type}`);
    });

    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the test
testAuditLogs().then(() => {
  console.log('🎉 Test script completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test script failed:', error);
  process.exit(1);
});