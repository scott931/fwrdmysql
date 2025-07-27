const mysql = require('mysql2/promise');

async function checkPermissions() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'forward_africa_db'
  });

  try {
    const [rows] = await pool.execute('SELECT id, email, role, permissions FROM users LIMIT 10');
    console.log('Users and their permissions:');
    rows.forEach(row => {
      console.log(`ID: ${row.id}, Email: ${row.email}, Role: ${row.role}, Permissions: ${row.permissions} (type: ${typeof row.permissions})`);
    });
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

checkPermissions();