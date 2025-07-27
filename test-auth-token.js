// Test script to verify authentication token functionality
const http = require('http');

function testAuthToken() {
  console.log('🔐 Testing Authentication Token...');

  // Test 1: Check if user can log in and get token
  console.log('\n📝 Test 1: Login and get token');

  const loginData = JSON.stringify({
    email: 'admin@forwardafrica.com',
    password: 'admin123'
  });

  const loginOptions = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };

  const loginReq = http.request(loginOptions, (res) => {
    console.log(`📊 Login Status: ${res.statusCode}`);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      if (res.statusCode === 200) {
        try {
          const response = JSON.parse(data);
          console.log('✅ Login successful');
          console.log('🔑 Token received:', !!response.token);
          console.log('👤 User role:', response.user?.role);

          // Test 2: Use token to access system config
          testSystemConfigWithToken(response.token);
        } catch (error) {
          console.error('❌ Failed to parse login response:', error);
        }
      } else {
        console.error('❌ Login failed:', data);
      }
    });
  });

  loginReq.on('error', (error) => {
    console.error('❌ Login request failed:', error.message);
  });

  loginReq.write(loginData);
  loginReq.end();
}

function testSystemConfigWithToken(token) {
  console.log('\n📝 Test 2: Access system config with token');

  const configOptions = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/system/config',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const configReq = http.request(configOptions, (res) => {
    console.log(`📊 Config Status: ${res.statusCode}`);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('✅ System config access successful');
        try {
          const config = JSON.parse(data);
          console.log('⚙️ Config loaded:', Object.keys(config));
        } catch (error) {
          console.log('📄 Raw config data:', data.substring(0, 200));
        }
      } else {
        console.error('❌ System config access failed:', data);
      }
    });
  });

  configReq.on('error', (error) => {
    console.error('❌ Config request failed:', error.message);
  });

  configReq.end();
}

// Run the test
testAuthToken();