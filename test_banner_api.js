const fetch = require('node-fetch');

async function testBannerAPI() {
  const baseURL = 'http://localhost:3002/api';

  console.log('🧪 Testing Banner API Endpoints...\n');

  // Test 1: GET banner config
  try {
    console.log('1. Testing GET /api/banner/config...');
    const response = await fetch(`${baseURL}/banner/config`);
    const data = await response.json();
    console.log('✅ GET /api/banner/config - Success');
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ GET /api/banner/config - Failed');
    console.log('Error:', error.message);
  }

  console.log('\n2. Testing server health...');
  try {
    const healthResponse = await fetch(`${baseURL}/health`);
    if (healthResponse.ok) {
      console.log('✅ Server is running');
    } else {
      console.log('❌ Server health check failed');
    }
  } catch (error) {
    console.log('❌ Cannot connect to server');
    console.log('Error:', error.message);
  }

  console.log('\n3. Testing system config endpoint...');
  try {
    const sysResponse = await fetch(`${baseURL}/system/config`);
    if (sysResponse.ok) {
      console.log('✅ System config endpoint working');
    } else {
      console.log('❌ System config endpoint failed');
    }
  } catch (error) {
    console.log('❌ System config endpoint error');
    console.log('Error:', error.message);
  }
}

testBannerAPI();