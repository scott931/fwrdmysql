const mysql = require('mysql2/promise');

async function checkDatabaseContent() {
  console.log('🔍 Checking database content...');

  const dbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'forward_africa_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };

  try {
    const pool = mysql.createPool(dbConfig);
    const connection = await pool.getConnection();

    // Check all tables
    const tables = [
      'users', 'categories', 'instructors', 'courses', 'lessons',
      'user_progress', 'certificates', 'achievements', 'audit_logs'
    ];

    for (const table of tables) {
      try {
        const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`📊 ${table}: ${rows[0].count} records`);

        // Show sample data for tables with records
        if (rows[0].count > 0) {
          const [sampleData] = await connection.execute(`SELECT * FROM ${table} LIMIT 3`);
          console.log(`   Sample data:`, sampleData);
        }
      } catch (error) {
        console.log(`❌ Error checking ${table}:`, error.message);
      }
    }

    connection.release();
    await pool.end();

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

checkDatabaseContent();