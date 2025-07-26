const mysql = require('mysql2/promise');

async function setupSystemConfig() {
  let connection;

  try {
    console.log('🔧 Setting up system configuration table...');

    // Connect to the database
    const config = {
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '', // Empty password for root user
      database: 'forward_africa_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    };

    connection = await mysql.createConnection(config);
    console.log('✅ Connected to forward_africa_db database');

    // Create System Configuration table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS system_configuration (
        id INT PRIMARY KEY DEFAULT 1,
        site_name VARCHAR(255) NOT NULL DEFAULT 'Forward Africa',
        site_description TEXT,
        maintenance_mode BOOLEAN DEFAULT FALSE,
        debug_mode BOOLEAN DEFAULT FALSE,
        max_upload_size INT DEFAULT 50,
        session_timeout INT DEFAULT 30,
        email_notifications BOOLEAN DEFAULT TRUE,
        auto_backup BOOLEAN DEFAULT TRUE,
        backup_frequency ENUM('hourly', 'daily', 'weekly', 'monthly') DEFAULT 'daily',
        security_level ENUM('low', 'medium', 'high', 'maximum') DEFAULT 'high',
        rate_limiting BOOLEAN DEFAULT TRUE,
        max_requests_per_minute INT DEFAULT 100,
        database_connection_pool INT DEFAULT 10,
        cache_enabled BOOLEAN DEFAULT TRUE,
        cache_ttl INT DEFAULT 3600,
        cdn_enabled BOOLEAN DEFAULT FALSE,
        ssl_enabled BOOLEAN DEFAULT TRUE,
        cors_enabled BOOLEAN DEFAULT TRUE,
        allowed_origins JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ System configuration table created or already exists');

    // Insert default configuration if table is empty
    try {
      await connection.execute(`
        INSERT INTO system_configuration (id, site_name, site_description, allowed_origins) VALUES (?, ?, ?, ?)
      `, [
        1,
        'Forward Africa',
        'Empowering African professionals through expert-led courses',
        JSON.stringify(['https://forwardafrica.com', 'https://www.forwardafrica.com'])
      ]);
      console.log('✅ Default system configuration inserted');
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log('ℹ️ Default system configuration already exists');
      } else {
        throw error;
      }
    }

    // Verify the table was created
    const [rows] = await connection.execute('SELECT * FROM system_configuration');
    console.log('✅ System configuration table verification:');
    console.log(JSON.stringify(rows, null, 2));

    console.log('✅ System configuration setup completed successfully!');

  } catch (error) {
    console.error('❌ System configuration setup failed:', error);
    console.error('Error details:', error.message);
    console.error('Error code:', error.code);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Database connection closed');
    }
  }
}

setupSystemConfig();