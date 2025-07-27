const fetch = require('node-fetch');

async function testSearch() {
  console.log('🔍 Testing search functionality...');

  try {
    // Test simple search
    console.log('📝 Testing simple search...');
    const response = await fetch('http://localhost:3002/api/search?q=business');

    console.log('Status:', response.status);
    console.log('Headers:', response.headers.get('content-type'));

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Search successful');
      console.log('Results:', data.results?.length || 0);
      console.log('Total:', data.total);
    } else {
      const errorText = await response.text();
      console.log('❌ Search failed');
      console.log('Error response:', errorText);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSearch();