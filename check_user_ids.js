const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'forward_africa_db',
  port: process.env.DB_PORT || 3306,
};

async function checkUserIDs() {
  let connection;
  
  try {
    console.log('🔍 Checking user ID format in database...');
    
    connection = await mysql.createConnection(dbConfig);
    
    // Check users table structure
    const [columns] = await connection.execute(`
      DESCRIBE users
    `);
    
    console.log('📋 Users table structure:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Check all users with their ID format
    const [users] = await connection.execute(`
      SELECT id, email, full_name FROM users LIMIT 10
    `);
    
    console.log(`\n📊 Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`  - ID: "${user.id}" (type: ${typeof user.id}, length: ${String(user.id).length})`);
      console.log(`    Email: ${user.email}`);
      console.log(`    Name: ${user.full_name}`);
    });
    
    // Check user_favorites table structure
    const [favoriteColumns] = await connection.execute(`
      DESCRIBE user_favorites
    `);
    
    console.log('\n📋 User_favorites table structure:');
    favoriteColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Check if there are any favorites
    const [favorites] = await connection.execute(`
      SELECT user_id, course_id FROM user_favorites LIMIT 5
    `);
    
    console.log(`\n📊 Found ${favorites.length} favorites:`);
    favorites.forEach(fav => {
      console.log(`  - User ID: "${fav.user_id}" (type: ${typeof fav.user_id})`);
      console.log(`    Course ID: "${fav.course_id}" (type: ${typeof fav.course_id})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkUserIDs(); 