const fetch = require('node-fetch');

async function testAnalytics() {
  try {
    console.log('Testing analytics endpoint...');

    const response = await fetch('http://localhost:3002/api/analytics/detailed');
    const data = await response.json();

    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error testing analytics:', error);
  }
}

testAnalytics();