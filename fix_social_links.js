const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'forward_africa_db',
  port: process.env.DB_PORT || 3306,
};

async function fixSocialLinks() {
  let connection;

  try {
    console.log('🔧 Fixing social links data in database...');

    connection = await mysql.createConnection(dbConfig);

    // Sample social links data for each instructor
    const socialLinksData = {
      1: { // Dr. Sarah Johnson
        linkedin: 'https://linkedin.com/in/sarah-johnson',
        twitter: 'https://twitter.com/sarahjohnson',
        website: 'https://sarahjohnson.com'
      },
      2: { // Mike Chen
        linkedin: 'https://linkedin.com/in/mike-chen',
        twitter: 'https://twitter.com/mikechen',
        website: 'https://mikechen.com'
      },
      3: { // Lisa Rodriguez
        linkedin: 'https://linkedin.com/in/lisa-rodriguez',
        twitter: 'https://twitter.com/lisarodriguez',
        website: 'https://lisarodriguez.com'
      },
      5: { // Paul Giannamore
        linkedin: 'https://linkedin.com/in/paul-giannamore',
        twitter: 'https://twitter.com/paulgiannamore',
        website: 'https://paulgiannamore.com'
      },
      6: { // Paul Giannamore (duplicate)
        linkedin: 'https://linkedin.com/in/paul-giannamore',
        twitter: 'https://twitter.com/paulgiannamore',
        website: 'https://paulgiannamore.com'
      }
    };

    // Update each instructor with proper JSON social links
    for (const [instructorId, socialLinks] of Object.entries(socialLinksData)) {
      const jsonSocialLinks = JSON.stringify(socialLinks);

      console.log(`Updating instructor ${instructorId} with social links:`, socialLinks);

      await connection.execute(
        'UPDATE instructors SET social_links = ? WHERE id = ?',
        [jsonSocialLinks, instructorId]
      );
    }

    console.log('✅ Social links updated successfully!');

    // Verify the updates
    const [instructors] = await connection.execute(`
      SELECT id, name, social_links
      FROM instructors
      WHERE id IN (1, 2, 3, 5, 6)
    `);

    console.log('\n📊 Updated instructors:');
    instructors.forEach(instructor => {
      console.log(`\n--- Instructor ${instructor.id} (${instructor.name}) ---`);
      if (instructor.social_links) {
        try {
          const parsed = JSON.parse(instructor.social_links);
          console.log('Social Links:', parsed);
        } catch (error) {
          console.log('❌ Error parsing:', instructor.social_links);
        }
      } else {
        console.log('No social links');
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

fixSocialLinks();