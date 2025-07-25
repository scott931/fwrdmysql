const mysql = require('mysql2/promise');

async function checkInstructors() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'fowardafrica'
    });

    const [rows] = await connection.execute('SELECT id, name, email FROM instructors');

    console.log('Current instructors in database:');
    if (rows.length === 0) {
      console.log('No instructors found in database');
    } else {
      console.table(rows);
    }

    await connection.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkInstructors();