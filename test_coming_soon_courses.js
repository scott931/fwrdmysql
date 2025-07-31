const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'forward_africa_db'
};

async function checkComingSoonCourses() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    console.log('🔍 Checking all courses with coming_soon status...');

    const [courses] = await connection.execute('SELECT id, title, coming_soon FROM courses ORDER BY id');

    console.log('\n📊 All courses:');
    courses.forEach(course => {
      console.log(`  - ${course.title} (ID: ${course.id}, Coming Soon: ${course.coming_soon})`);
    });

    const comingSoonCourses = courses.filter(course => course.coming_soon === 1);
    console.log(`\n🎯 Found ${comingSoonCourses.length} coming soon courses:`);
    comingSoonCourses.forEach(course => {
      console.log(`  - ${course.title} (ID: ${course.id})`);
    });

    if (comingSoonCourses.length === 0) {
      console.log('\n❌ No coming soon courses found in database!');
      console.log('💡 To test coming soon indicators, you need to:');
      console.log('   1. Set coming_soon = 1 for a course in the database');
      console.log('   2. Or create a new course with coming_soon = 1');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

checkComingSoonCourses();