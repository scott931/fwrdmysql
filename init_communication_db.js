const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'forward_africa_db'
};

async function initCommunicationDatabase() {
  let connection;

  try {
    console.log('🔧 Initializing communication database...');

    // Create database connection
    connection = await mysql.createConnection(dbConfig);

    // Read and execute the communication schema
    const schemaPath = path.join(__dirname, 'backend/database/communication_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        await connection.execute(statement);
      }
    }

    console.log('✅ Communication database initialized successfully!');

    // Insert sample data
    await insertSampleData(connection);

  } catch (error) {
    console.error('❌ Error initializing communication database:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function insertSampleData(connection) {
  try {
    console.log('📝 Inserting sample communication data...');

    // Insert sample announcements
    const sampleAnnouncements = [
      {
        title: 'Platform Maintenance Notice',
        content: 'Scheduled maintenance will occur on January 20th from 2:00 AM to 4:00 AM UTC. During this time, the platform will be temporarily unavailable.',
        audience: 'all',
        status: 'published',
        created_by: 1
      },
      {
        title: 'New Course Available',
        content: 'We\'re excited to announce our new course on "Advanced Business Strategy" taught by industry expert Dr. Sarah Johnson.',
        audience: 'all',
        status: 'published',
        created_by: 1
      },
      {
        title: 'Welcome to Forward Africa',
        content: 'Welcome to our learning platform! We\'re excited to have you join our community of learners.',
        audience: 'users',
        status: 'draft',
        created_by: 1
      }
    ];

    for (const announcement of sampleAnnouncements) {
      await connection.execute(
        'INSERT INTO announcements (title, content, audience, status, created_by, published_at) VALUES (?, ?, ?, ?, ?, ?)',
        [
          announcement.title,
          announcement.content,
          announcement.audience,
          announcement.status,
          announcement.created_by,
          announcement.status === 'published' ? new Date() : null
        ]
      );
    }

    // Insert sample email campaigns
    const sampleCampaigns = [
      {
        name: 'Welcome Series',
        subject: 'Welcome to Forward Africa!',
        content: '<h2>Welcome to Forward Africa!</h2><p>Hi {{name}},</p><p>Welcome to Forward Africa! We\'re excited to have you join our learning community.</p>',
        audience: 'all',
        status: 'sent',
        total_recipients: 1234,
        delivered_count: 1220,
        opened_count: 987,
        clicked_count: 123,
        created_by: 1
      },
      {
        name: 'Course Reminder',
        subject: 'Continue Your Learning Journey',
        content: '<h2>Don\'t Forget Your Learning Goals!</h2><p>Hi {{name}},</p><p>We noticed you haven\'t been active in your course recently.</p>',
        audience: 'users',
        status: 'draft',
        created_by: 1
      }
    ];

    for (const campaign of sampleCampaigns) {
      await connection.execute(
        'INSERT INTO email_campaigns (name, subject, content, audience, status, total_recipients, delivered_count, opened_count, clicked_count, created_by, sent_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          campaign.name,
          campaign.subject,
          campaign.content,
          campaign.audience,
          campaign.status,
          campaign.total_recipients || 0,
          campaign.delivered_count || 0,
          campaign.opened_count || 0,
          campaign.clicked_count || 0,
          campaign.created_by,
          campaign.status === 'sent' ? new Date() : null
        ]
      );
    }

    // Insert sample push notifications
    const sampleNotifications = [
      {
        title: 'Course Completion',
        message: 'Congratulations! You\'ve completed the "Business Fundamentals" course.',
        audience: 'users',
        status: 'sent',
        total_recipients: 50,
        delivered_count: 48,
        opened_count: 35,
        created_by: 1
      },
      {
        title: 'New Lesson Available',
        message: 'A new lesson is available in your enrolled course "Digital Marketing".',
        audience: 'users',
        status: 'sent',
        total_recipients: 200,
        delivered_count: 195,
        opened_count: 120,
        created_by: 1
      }
    ];

    for (const notification of sampleNotifications) {
      await connection.execute(
        'INSERT INTO push_notifications (title, message, audience, status, total_recipients, delivered_count, opened_count, created_by, sent_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          notification.title,
          notification.message,
          notification.audience,
          notification.status,
          notification.total_recipients,
          notification.delivered_count,
          notification.opened_count,
          notification.created_by,
          notification.status === 'sent' ? new Date() : null
        ]
      );
    }

    console.log('✅ Sample communication data inserted successfully!');

  } catch (error) {
    console.error('❌ Error inserting sample data:', error);
    throw error;
  }
}

// Run the initialization
if (require.main === module) {
  initCommunicationDatabase()
    .then(() => {
      console.log('🎉 Communication database setup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Communication database setup failed:', error);
      process.exit(1);
    });
}

module.exports = { initCommunicationDatabase };