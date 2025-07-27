const mysql = require('mysql2/promise');

async function testSimpleSearch() {
  console.log('🔍 Testing simplified search...');

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

    // Simple search query
    const searchTerm = '%business%';
    const query = `
      SELECT
        c.id,
        c.title,
        c.description,
        c.thumbnail,
        c.featured,
        i.name as instructor_name,
        cat.name as category_name
      FROM courses c
      JOIN instructors i ON c.instructor_id = i.id
      JOIN categories cat ON c.category_id = cat.id
      WHERE c.title LIKE ? OR c.description LIKE ? OR i.name LIKE ?
      ORDER BY c.featured DESC, c.title ASC
      LIMIT 10
    `;

    const [results] = await connection.execute(query, [searchTerm, searchTerm, searchTerm]);

    console.log('✅ Search query successful');
    console.log(`📊 Found ${results.length} results for "business"`);

    if (results.length > 0) {
      console.log('📋 Sample results:');
      results.slice(0, 3).forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.title} (${result.instructor_name})`);
      });
    }

    connection.release();
    await pool.end();

  } catch (error) {
    console.error('❌ Search test failed:', error.message);
  }
}

testSimpleSearch();