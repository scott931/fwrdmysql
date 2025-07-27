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

async function fixAuditLogsTable() {
  console.log('🔧 Fixing audit_logs table structure...');

  try {
    // Create database connection
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected');

    // Check current table structure
    console.log('\n📋 Current table structure:');
    const [columns] = await connection.execute('DESCRIBE audit_logs');
    columns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Check if columns already exist
    const existingColumns = columns.map(col => col.Field);
    const missingColumns = ['resource_type', 'resource_id', 'details'].filter(col => !existingColumns.includes(col));

    if (missingColumns.length === 0) {
      console.log('✅ All required columns already exist');
      await connection.end();
      return;
    }

    console.log('\n📋 Missing columns:', missingColumns);

    // Add missing columns
    for (const column of missingColumns) {
      console.log(`\n🔧 Adding column: ${column}`);

      let alterQuery;
      switch (column) {
        case 'resource_type':
          alterQuery = 'ALTER TABLE audit_logs ADD COLUMN resource_type VARCHAR(255) NULL AFTER action';
          break;
        case 'resource_id':
          alterQuery = 'ALTER TABLE audit_logs ADD COLUMN resource_id VARCHAR(255) NULL AFTER resource_type';
          break;
        case 'details':
          alterQuery = 'ALTER TABLE audit_logs ADD COLUMN details TEXT NULL AFTER resource_id';
          break;
      }

      await connection.execute(alterQuery);
      console.log(`✅ Added column: ${column}`);
    }

    // Update existing records with default values
    console.log('\n🔧 Updating existing records...');
    await connection.execute(`
      UPDATE audit_logs SET
      resource_type = 'system' WHERE resource_type IS NULL
    `);

    await connection.execute(`
      UPDATE audit_logs SET
      details = '{}' WHERE details IS NULL
    `);

    console.log('✅ Updated existing records');

    // Show updated table structure
    console.log('\n📋 Updated table structure:');
    const [updatedColumns] = await connection.execute('DESCRIBE audit_logs');
    updatedColumns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Show sample data
    console.log('\n📋 Sample data:');
    const [sampleData] = await connection.execute(`
      SELECT id, user_id, action, resource_type, resource_id, details, ip_address, created_at
      FROM audit_logs
      ORDER BY created_at DESC
      LIMIT 3
    `);

    sampleData.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.action} (${row.resource_type}) by user ${row.user_id} at ${row.created_at}`);
    });

    await connection.end();
    console.log('\n✅ Audit logs table fixed successfully');

  } catch (error) {
    console.error('❌ Failed to fix audit logs table:', error);
    console.error('Error details:', error.message);
  }
}

fixAuditLogsTable();