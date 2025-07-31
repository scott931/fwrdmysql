const mysql = require('mysql2/promise');

async function fixDatabaseColumns() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'forward_africa_db'
  };

  console.log('🔧 Fixing missing banner columns...\n');

  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Add missing columns
    console.log('📝 Adding missing columns...');
    await connection.execute(`
      ALTER TABLE system_configuration
      ADD COLUMN homepage_banner_enabled BOOLEAN DEFAULT FALSE,
      ADD COLUMN homepage_banner_overlay_opacity DECIMAL(3,2) DEFAULT 0.70
    `);
    console.log('✅ Added homepage_banner_enabled column');
    console.log('✅ Added homepage_banner_overlay_opacity column');

    // Update existing record
    console.log('📝 Updating existing record...');
    await connection.execute(`
      UPDATE system_configuration
      SET
          homepage_banner_enabled = FALSE,
          homepage_banner_overlay_opacity = 0.70
      WHERE id = 1
    `);
    console.log('✅ Updated existing record');

    // Verify the changes
    console.log('🔍 Verifying changes...');
    const [rows] = await connection.execute(`
      SELECT
          id,
          site_name,
          homepage_banner_enabled,
          homepage_banner_type,
          homepage_banner_button_text,
          homepage_banner_overlay_opacity
      FROM system_configuration
      WHERE id = 1
    `);

    console.log('✅ Database fix completed successfully!');
    console.log('📊 Current configuration:', JSON.stringify(rows[0], null, 2));

    await connection.end();

  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('⚠️  Columns already exist, skipping...');
    } else {
      console.log('❌ Database fix failed');
      console.log('Error:', error.message);
    }
  }
}

fixDatabaseColumns();