const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'forward_africa_db',
  port: process.env.DB_PORT || 3306,
};

async function checkInstructorData() {
  let connection;

  try {
    console.log('🔍 Checking instructor data in database...');

    connection = await mysql.createConnection(dbConfig);

    // Check instructors table structure
    const [columns] = await connection.execute(`
      DESCRIBE instructors
    `);

    console.log('📋 Instructors table structure:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Check all instructors with their data
    const [instructors] = await connection.execute(`
      SELECT id, name, title, email, phone, experience, bio, social_links
      FROM instructors
      LIMIT 5
    `);

    console.log(`\n📊 Found ${instructors.length} instructors:`);
    instructors.forEach((instructor, index) => {
      console.log(`\n--- Instructor ${index + 1} ---`);
      console.log(`  ID: "${instructor.id}"`);
      console.log(`  Name: "${instructor.name}"`);
      console.log(`  Title: "${instructor.title}"`);
      console.log(`  Email: "${instructor.email}"`);
      console.log(`  Phone: "${instructor.phone || 'NULL'}"`);
      console.log(`  Experience: ${instructor.experience || 'NULL'} years`);
      console.log(`  Bio: "${instructor.bio || 'NULL'}"`);
      console.log(`  Social Links: "${instructor.social_links || 'NULL'}"`);

      // Try to parse social_links if it exists
      if (instructor.social_links) {
        try {
          const socialLinks = JSON.parse(instructor.social_links);
          console.log(`  Parsed Social Links:`, socialLinks);
        } catch (error) {
          console.log(`  ❌ Error parsing social_links: ${error.message}`);
        }
      }
    });

    // Check if there are any courses with instructors
    const [courses] = await connection.execute(`
      SELECT c.id, c.title, i.name as instructor_name, i.title as instructor_title,
             i.email as instructor_email, i.phone as instructor_phone,
             i.experience as instructor_experience, i.bio as instructor_bio,
             i.social_links as instructor_social_links
      FROM courses c
      JOIN instructors i ON c.instructor_id = i.id
      LIMIT 3
    `);

    console.log(`\n📊 Found ${courses.length} courses with instructor data:`);
    courses.forEach((course, index) => {
      console.log(`\n--- Course ${index + 1} ---`);
      console.log(`  Course ID: "${course.id}"`);
      console.log(`  Course Title: "${course.title}"`);
      console.log(`  Instructor Name: "${course.instructor_name}"`);
      console.log(`  Instructor Title: "${course.instructor_title}"`);
      console.log(`  Instructor Email: "${course.instructor_email}"`);
      console.log(`  Instructor Phone: "${course.instructor_phone || 'NULL'}"`);
      console.log(`  Instructor Experience: ${course.instructor_experience || 'NULL'} years`);
      console.log(`  Instructor Bio: "${course.instructor_bio || 'NULL'}"`);
      console.log(`  Instructor Social Links: "${course.instructor_social_links || 'NULL'}"`);

      // Try to parse social_links if it exists
      if (course.instructor_social_links) {
        try {
          const socialLinks = JSON.parse(course.instructor_social_links);
          console.log(`  Parsed Social Links:`, socialLinks);
        } catch (error) {
          console.log(`  ❌ Error parsing social_links: ${error.message}`);
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

checkInstructorData();