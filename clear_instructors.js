const mysql = require('mysql2/promise');

async function clearInstructors() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'fowardafrica'
    });

    console.log('Clearing instructors table...');
    await connection.execute('DELETE FROM instructors');
    console.log('Instructors table cleared successfully');

    await connection.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

clearInstructors();