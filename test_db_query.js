const mysql = require('mysql2/promise');

async function testBannerQuery() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'forward_africa_db'
  };

  console.log('🔍 Testing Banner Database Query...\n');

  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Test the exact query from the banner API
    console.log('📝 Testing banner configuration query...');
    const [configRows] = await connection.execute(`
      SELECT
        homepage_banner_enabled,
        homepage_banner_type,
        homepage_banner_video_url,
        homepage_banner_image_url,
        homepage_banner_title,
        homepage_banner_subtitle,
        homepage_banner_description,
        homepage_banner_button_text,
        homepage_banner_button_url,
        homepage_banner_overlay_opacity
      FROM system_configuration WHERE id = 1
    `);

    console.log('✅ Query executed successfully');
    console.log('📊 Results:', configRows);

    if (configRows.length === 0) {
      console.log('⚠️  No configuration found, this is expected for new installations');
    } else {
      console.log('✅ Configuration found:', JSON.stringify(configRows[0], null, 2));
    }

    await connection.end();

  } catch (error) {
    console.log('❌ Database query failed');
    console.log('Error:', error.message);
    console.log('Error code:', error.code);
  }
}

testBannerQuery();