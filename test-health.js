// Test configuration
const BASE_URL = 'http://localhost:3002';

async function testHealth() {
  console.log('🔍 Testing server health...');

  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    console.log('📡 Health response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Health check successful:', data);
    } else {
      console.log('❌ Health check failed');
    }
  } catch (error) {
    console.error('❌ Health check error:', error.message);
  }
}

testHealth();