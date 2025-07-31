const fetch = require('node-fetch');

async function testBannerSimple() {
  try {
    console.log('🧪 Testing Banner API...');

    const response = await fetch('http://localhost:3002/api/banner/config');
    console.log('Response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Banner API working!');
      console.log('Response:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Banner API failed with status:', response.status);
      const text = await response.text();
      console.log('Response text:', text);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testBannerSimple();