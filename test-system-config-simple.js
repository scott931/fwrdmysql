// Simple test to verify system configuration page loads
const http = require('http');

function testSystemConfigPage() {
  console.log('🧪 Testing System Configuration Page...');

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/admin/system-configuration',
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`📊 Status: ${res.statusCode}`);
    console.log(`📋 Headers:`, res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('✅ Response received');

      // Check if the page contains expected content
      if (data.includes('System Configuration') ||
          data.includes('Loading') ||
          data.includes('Access Denied') ||
          data.includes('Authentication Required')) {
        console.log('✅ Page content looks good');
      } else {
        console.log('❌ Unexpected page content');
        console.log('📄 First 500 characters:', data.substring(0, 500));
      }

      // Check for hydration errors in the HTML
      if (data.includes('hydration') || data.includes('Abort')) {
        console.log('❌ Found potential hydration issues in HTML');
      } else {
        console.log('✅ No obvious hydration issues found');
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request failed:', error.message);
  });

  req.setTimeout(10000, () => {
    console.error('❌ Request timeout');
    req.destroy();
  });

  req.end();
}

// Run the test
testSystemConfigPage();