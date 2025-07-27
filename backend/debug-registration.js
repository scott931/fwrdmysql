const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'forward_africa_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

async function debugRegistration() {
  console.log('🔍 Debugging registration...');
  
  try {
    // Create database connection
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected');

    // Test data
    const testData = {
      email: 'debuguser@example.com',
      password: 'debugpassword123',
      full_name: 'Debug User',
      education_level: 'bachelor',
      job_title: 'Developer',
      topics_of_interest: ['programming', 'technology'],
      industry: 'Technology',
      experience_level: 'intermediate',
      business_stage: 'growth',
      country: 'Kenya',
      state_province: 'Nairobi',
      city: 'Nairobi'
    };

    // Check if user already exists
    console.log('\n📋 Step 1: Checking if user exists...');
    const [existingUser] = await connection.execute('SELECT id FROM users WHERE email = ?', [testData.email]);
    console.log('📋 Existing user found:', existingUser.length > 0);

    if (existingUser.length > 0) {
      console.log('⚠️ User already exists, skipping registration test');
      await connection.end();
      return;
    }

    // Hash password
    console.log('\n📋 Step 2: Hashing password...');
    const hashedPassword = await bcrypt.hash(testData.password, 10);
    console.log('✅ Password hashed successfully');

    // Generate ID
    const id = uuidv4();
    console.log('📋 Generated ID:', id);

    // Test the exact INSERT query
    console.log('\n📋 Step 3: Testing INSERT query...');
    const insertQuery = `
      INSERT INTO users (
        id, email, full_name, education_level, job_title, 
        topics_of_interest, industry, experience_level, business_stage, 
        country, state_province, city, password
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const insertParams = [
      id, 
      testData.email, 
      testData.full_name, 
      testData.education_level, 
      testData.job_title, 
      JSON.stringify(testData.topics_of_interest), 
      testData.industry, 
      testData.experience_level, 
      testData.business_stage, 
      testData.country, 
      testData.state_province, 
      testData.city, 
      hashedPassword
    ];

    console.log('🔍 Executing query:', insertQuery);
    console.log('📋 Parameters:', insertParams.map((param, index) => `${index}: ${typeof param} = ${param}`));

    await connection.execute(insertQuery, insertParams);
    console.log('✅ INSERT query successful');

    // Verify the user was created
    console.log('\n📋 Step 4: Verifying user creation...');
    const [newUser] = await connection.execute('SELECT id, email, full_name, role FROM users WHERE id = ?', [id]);
    console.log('📋 New user:', newUser[0]);

    // Test password verification
    console.log('\n📋 Step 5: Testing password verification...');
    const [userForLogin] = await connection.execute('SELECT * FROM users WHERE email = ?', [testData.email]);
    if (userForLogin.length > 0) {
      const validPassword = await bcrypt.compare(testData.password, userForLogin[0].password);
      console.log('✅ Password verification:', validPassword);
    }

    // Clean up - delete the test user
    console.log('\n📋 Step 6: Cleaning up test user...');
    await connection.execute('DELETE FROM users WHERE id = ?', [id]);
    console.log('✅ Test user deleted');

    await connection.end();
    console.log('\n✅ Registration debug completed successfully');

  } catch (error) {
    console.error('❌ Registration debug failed:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
  }
}

debugRegistration(); 