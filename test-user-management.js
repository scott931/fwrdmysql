const API_BASE_URL = 'http://localhost:3002/api';

async function testUserManagement() {
  console.log('🧪 Testing User Management Endpoint...\n');

  try {
    // Step 1: Login to get token
    console.log('1️⃣ Logging in...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@forwardafrica.com',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      const error = await loginResponse.json();
      console.log('❌ Login failed:', error);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    console.log('   User role:', loginData.user.role);

    // Step 2: Test user management endpoint
    console.log('\n2️⃣ Testing user management endpoint...');
    const usersResponse = await fetch(`${API_BASE_URL}/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.token}`
      }
    });

    console.log('   Response status:', usersResponse.status);
    console.log('   Response headers:', Object.fromEntries(usersResponse.headers.entries()));

    if (!usersResponse.ok) {
      const error = await usersResponse.json();
      console.log('❌ User management failed:', error);
      return;
    }

    const usersData = await usersResponse.json();
    console.log('✅ User management successful');
    console.log('   Users found:', usersData.users?.length || 0);
    console.log('   Pagination:', usersData.pagination);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testUserManagement().catch(console.error);