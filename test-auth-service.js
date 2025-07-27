// Test script to verify authService.isAuthenticated function
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAuthService() {
  console.log('🧪 Testing AuthService.isAuthenticated function...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing server health...');
    const healthResponse = await fetch('http://localhost:3002/api/health');
    if (healthResponse.ok) {
      console.log('✅ Server is running');
    } else {
      console.log('❌ Server health check failed');
      return;
    }

    // Test 2: Login with admin credentials
    console.log('\n2️⃣ Testing login...');
    const loginResponse = await fetch('http://localhost:3002/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@forwardafrica.com',
        password: 'admin123'
      }),
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login successful');
      console.log('   Token received:', !!loginData.token);
      console.log('   Refresh token received:', !!loginData.refreshToken);
      console.log('   User data received:', !!loginData.user);

      // Test 3: Test authenticated endpoint
      console.log('\n3️⃣ Testing authenticated endpoint...');
      const meResponse = await fetch('http://localhost:3002/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
        },
      });

      if (meResponse.ok) {
        const userData = await meResponse.json();
        console.log('✅ Authenticated endpoint works');
        console.log('   User email:', userData.email);
        console.log('   User role:', userData.role);
      } else {
        console.log('❌ Authenticated endpoint failed');
      }
    } else {
      const errorData = await loginResponse.json();
      console.log('❌ Login failed:', errorData.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAuthService();