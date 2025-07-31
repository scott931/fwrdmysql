const mysql = require('mysql2/promise');

async function testDatabase() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'forward_africa_db'
  };

  console.log('🔍 Testing Database Connection...\n');

  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection successful');

    // Check if system_configuration table exists
    const [tables] = await connection.execute('SHOW TABLES LIKE "system_configuration"');
    if (tables.length === 0) {
      console.log('❌ system_configuration table does not exist');
      return;
    }
    console.log('✅ system_configuration table exists');

    // Check table structure
    const [columns] = await connection.execute('DESCRIBE system_configuration');
    console.log('\n📋 Table structure:');
    columns.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Check if banner columns exist
    const bannerColumns = [
      'homepage_banner_enabled',
      'homepage_banner_type',
      'homepage_banner_video_url',
      'homepage_banner_image_url',
      'homepage_banner_title',
      'homepage_banner_subtitle',
      'homepage_banner_description',
      'homepage_banner_button_text',
      'homepage_banner_button_url',
      'homepage_banner_overlay_opacity'
    ];

    const existingColumns = columns.map(col => col.Field);
    const missingColumns = bannerColumns.filter(col => !existingColumns.includes(col));

    if (missingColumns.length === 0) {
      console.log('\n✅ All banner columns exist');
    } else {
      console.log('\n❌ Missing banner columns:');
      missingColumns.forEach(col => console.log(`  - ${col}`));
    }

    // Check if there's any data
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM system_configuration');
    console.log(`\n📊 Records in system_configuration: ${rows[0].count}`);

    await connection.end();

  } catch (error) {
    console.log('❌ Database connection failed');
    console.log('Error:', error.message);
  }
}

testDatabase();