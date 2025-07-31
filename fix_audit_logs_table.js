const mysql = require('mysql2/promise');

async function fixAuditLogsTable() {
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

    // Check current table structure
    console.log('📋 Checking current table structure...');
    const [currentStructure] = await connection.execute('DESCRIBE audit_logs');
    console.log('📋 Current structure:');
    currentStructure.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type}`);
    });

    // Check if we need to recreate the table
    const idColumn = currentStructure.find(col => col.Field === 'id');
    const userIdColumn = currentStructure.find(col => col.Field === 'user_id');
    
    if (idColumn.Type.includes('int') || userIdColumn.Type.includes('int')) {
      console.log('🔄 Table structure needs to be updated...');
      
      // Create backup of current data
      console.log('📋 Backing up current data...');
      const [currentData] = await connection.execute('SELECT * FROM audit_logs');
      console.log(`📊 Backed up ${currentData.length} records`);
      
      // Drop the current table
      console.log('🗑️ Dropping current table...');
      await connection.execute('DROP TABLE audit_logs');
      
      // Create the correct table structure
      console.log('📋 Creating new table with correct structure...');
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
      
      console.log('✅ New table created successfully');
      
      // Reinsert the data with proper structure
      console.log('📝 Reinserting data with correct structure...');
      for (const record of currentData) {
        const newId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const userId = record.user_id ? `u${record.user_id}` : null;
        
        await connection.execute(
          'INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, details, ip_address, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            newId,
            userId,
            record.action || 'UNKNOWN_ACTION',
            record.resource_type || 'unknown',
            record.resource_id || null,
            record.details || null,
            record.ip_address || null,
            record.user_agent || null,
            record.created_at || new Date()
          ]
        );
      }
      
      console.log('✅ Data reinserted successfully');
    } else {
      console.log('✅ Table structure is already correct');
    }

    // Verify the new structure
    console.log('\n📋 Verifying new table structure...');
    const [newStructure] = await connection.execute('DESCRIBE audit_logs');
    console.log('📋 New structure:');
    newStructure.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type}`);
    });

    // Check data
    const [countResult] = await connection.execute('SELECT COUNT(*) as count FROM audit_logs');
    console.log(`📊 Total audit logs: ${countResult[0].count}`);

    // Test the API query
    console.log('\n📋 Testing API query...');
    const [apiLogs] = await connection.execute(`
      SELECT al.*, u.full_name as user_name, u.email as user_email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
      ORDER BY al.created_at DESC 
      LIMIT 5
    `);
    
    console.log('📋 API query results:');
    apiLogs.forEach((log, index) => {
      console.log(`  ${index + 1}. ${log.action} by ${log.user_email || log.user_id} on ${log.resource_type}`);
    });

    console.log('\n✅ Audit logs table fixed successfully!');

  } catch (error) {
    console.error('❌ Error fixing audit logs table:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the fix
fixAuditLogsTable().then(() => {
  console.log('🎉 Fix script completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Fix script failed:', error);
  process.exit(1);
}); 