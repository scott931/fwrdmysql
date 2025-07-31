const fetch = require('node-fetch');

async function debugBannerAPI() {
  const baseURL = 'http://localhost:3002/api';

  console.log('🔍 Debugging Banner API...\n');

  try {
    console.log('1. Testing GET /api/banner/config...');
    const response = await fetch(`${baseURL}/banner/config`);

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const text = await response.text();
    console.log('Raw response:', text);

    if (text.trim()) {
      try {
        const data = JSON.parse(text);
        console.log('✅ Parsed JSON:', JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.log('❌ JSON parse error:', parseError.message);
      }
    } else {
      console.log('❌ Empty response');
    }

  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }
}

debugBannerAPI();