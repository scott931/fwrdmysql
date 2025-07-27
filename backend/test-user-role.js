// Test configuration
const BASE_URL = 'http://localhost:3002';

// Test data
const testUser = {
  email: 'admin@forwardafrica.com',
  password: 'admin123'
};

async function testUserRole() {
  console.log('🔍 Testing user role and permissions...');

  try {
    // Step 1: Login to get user details
    console.log('\n🔐 Step 1: Getting user details...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    console.log('👤 User details:', {
      id: loginData.user.id,
      email: loginData.user.email,
      role: loginData.user.role,
      permissions: loginData.user.permissions
    });

    // Step 2: Test if user has super_admin role
    console.log('\n🔍 Step 2: Checking role authorization...');
    if (loginData.user.role === 'super_admin') {
      console.log('✅ User has super_admin role');
    } else {
      console.log('❌ User does not have super_admin role');
      console.log('Current role:', loginData.user.role);
    }

    // Step 3: Test a simple endpoint that doesn't require super_admin
    console.log('\n🔍 Step 3: Testing simple endpoint...');
    const token = loginData.token;
    const simpleResponse = await fetch(`${BASE_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('📡 Health check response status:', simpleResponse.status);
    if (simpleResponse.ok) {
      const healthData = await simpleResponse.json();
      console.log('✅ Health check successful:', healthData);
    } else {
      console.log('❌ Health check failed');
    }

    return true;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

testUserRole();