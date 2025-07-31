const fetch = require('node-fetch');

async function createTestUser() {
  console.log('🧪 Creating test user for authentication...');
  
  const testUser = {
    email: 'test@forwardafrica.com',
    password: 'test123',
    full_name: 'Test User',
    role: 'super_admin' // This will give full permissions for testing
  };

  try {
    console.log(`📝 Registering user: ${testUser.email}`);
    
    const response = await fetch('http://localhost:3002/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Test user created successfully!');
      console.log(`📧 Email: ${testUser.email}`);
      console.log(`🔑 Password: ${testUser.password}`);
      console.log(`👤 Role: ${testUser.role}`);
      console.log('\n💡 You can now use these credentials in your test files:');
      console.log(`   Email: ${testUser.email}`);
      console.log(`   Password: ${testUser.password}`);
    } else {
      const errorText = await response.text();
      console.log(`❌ Failed to create test user: ${response.status} - ${errorText}`);
      
      if (response.status === 409) {
        console.log('\n💡 User already exists. You can use these credentials:');
        console.log(`   Email: ${testUser.email}`);
        console.log(`   Password: ${testUser.password}`);
      }
    }
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
    console.log('\n💡 Make sure your server is running on localhost:3002');
  }
}

createTestUser(); 