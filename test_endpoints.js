const fetch = require('node-fetch');

async function testEndpoints() {
  const baseURL = 'http://localhost:3002/api';

  console.log('🧪 Testing Backend Endpoints...\n');

  // Test 1: Simple test endpoint
  try {
    console.log('1. Testing GET /api/test...');
    const testResponse = await fetch(`${baseURL}/test`);
    const testData = await testResponse.json();
    console.log('✅ GET /api/test - Success');
    console.log('Response:', JSON.stringify(testData, null, 2));
  } catch (error) {
    console.log('❌ GET /api/test - Failed');
    console.log('Error:', error.message);
  }

  // Test 2: Banner config endpoint
  try {
    console.log('\n2. Testing GET /api/banner/config...');
    const bannerResponse = await fetch(`${baseURL}/banner/config`);
    const bannerText = await bannerResponse.text();
    console.log('Response status:', bannerResponse.status);
    console.log('Response length:', bannerText.length);
    console.log('Raw response:', bannerText);

    if (bannerText.trim()) {
      try {
        const bannerData = JSON.parse(bannerText);
        console.log('✅ GET /api/banner/config - Success');
        console.log('Response:', JSON.stringify(bannerData, null, 2));
      } catch (parseError) {
        console.log('❌ JSON parse error:', parseError.message);
      }
    } else {
      console.log('❌ Empty response from banner API');
    }
  } catch (error) {
    console.log('❌ GET /api/banner/config - Failed');
    console.log('Error:', error.message);
  }
}

testEndpoints();