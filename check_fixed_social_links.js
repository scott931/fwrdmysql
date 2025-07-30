const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'forward_africa_db',
  port: process.env.DB_PORT || 3306,
};

async function checkFixedSocialLinks() {
  let connection;

  try {
    console.log('🔍 Checking fixed social links data...');

    connection = await mysql.createConnection(dbConfig);

    // Check what's actually stored in the database
    const [instructors] = await connection.execute(`
      SELECT id, name, social_links,
             JSON_TYPE(social_links) as json_type,
             JSON_VALID(social_links) as is_valid_json
      FROM instructors
      WHERE id IN (1, 2, 3, 5, 6)
    `);

    console.log('\n📊 Social links data:');
    instructors.forEach(instructor => {
      console.log(`\n--- Instructor ${instructor.id} (${instructor.name}) ---`);
      console.log(`Raw data: ${instructor.social_links}`);
      console.log(`JSON type: ${instructor.json_type}`);
      console.log(`Valid JSON: ${instructor.is_valid_json}`);

      if (instructor.social_links && instructor.is_valid_json) {
        try {
          const parsed = JSON.parse(instructor.social_links);
          console.log('Parsed successfully:', parsed);
        } catch (error) {
          console.log('❌ Parse error:', error.message);
        }
      }
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkFixedSocialLinks();