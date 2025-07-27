const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_BASE_URL = 'http://localhost:3002/api';

async function testLogin() {
  console.log('🧪 Testing Login Functionality\n');

  try {
    // Test 1: Check if server is running
    console.log('1️⃣ Checking if server is running...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    
    if (!healthResponse.ok) {
      throw new Error(`Server health check failed: ${healthResponse.status}`);
    }
    
    const healthData = await healthResponse.json();
    console.log('✅ Server is running:', healthData.message);

    // Test 2: Test login
    console.log('\n2️⃣ Testing login...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@forwardafrica.com',
        password: 'admin123'
      }),
    });

    if (!loginResponse.ok) {
      const errorData = await loginResponse.json();
      throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText} - ${errorData.error}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    console.log(`   User: ${loginData.user.full_name}`);
    console.log(`   Role: ${loginData.user.role}`);
    console.log(`   Token: ${loginData.token.substring(0, 20)}...`);
    console.log(`   Refresh Token: ${loginData.refreshToken.substring(0, 20)}...`);

    // Test 3: Test accessing protected endpoint
    console.log('\n3️⃣ Testing protected endpoint...');
    const profileResponse = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
      },
    });

    if (!profileResponse.ok) {
      const errorData = await profileResponse.json();
      throw new Error(`Profile access failed: ${profileResponse.status} ${profileResponse.statusText} - ${errorData.error}`);
    }

    const profileData = await profileResponse.json();
    console.log('✅ Protected endpoint access successful');
    console.log(`   User ID: ${profileData.id}`);
    console.log(`   Email: ${profileData.email}`);

    console.log('\n🎉 All tests passed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('\n💡 Troubleshooting tips:');
      console.log('   1. Make sure the backend server is running: npm start');
      console.log('   2. Check if the server is on port 3002');
      console.log('   3. Verify the database is set up correctly');
      console.log('   4. Check the server logs for any errors');
    }
  }
}

testLogin(); 