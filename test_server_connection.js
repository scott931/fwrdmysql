const fetch = require('node-fetch');

async function testServerConnection() {
  try {
    console.log('🧪 Testing server connection...');

    // Test basic server response
    const response = await fetch('http://localhost:3002/api/test');

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Server is responding:', data);
    } else {
      console.log('❌ Server responded with status:', response.status);
    }

  } catch (error) {
    console.error('❌ Server connection failed:', error.message);
  }
}

testServerConnection();