const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const TestAuthHelper = require('./test_auth_helper');

// Create a simple test image (1x1 pixel PNG)
const testImageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');

// Write test image to file
const testImagePath = path.join(__dirname, 'test-image.png');
fs.writeFileSync(testImagePath, testImageData);

console.log('🧪 Testing banner upload endpoint with proper authentication...');

// Create form data
const formData = new FormData();
formData.append('banner', fs.createReadStream(testImagePath));

// Test the endpoint
const fetch = require('node-fetch');

async function testBannerUpload() {
  const authHelper = new TestAuthHelper();
  
  try {
    // First, login with a super_admin account
    console.log('🔐 Logging in as super_admin...');
    
    // Using test user credentials
    await authHelper.login('test@forwardafrica.com', 'test123');
    
    // Check if user has super_admin role
    if (!authHelper.hasRole('super_admin')) {
      console.log('❌ User does not have super_admin role. Banner upload requires super_admin permissions.');
      console.log(`Current user role: ${authHelper.getUser()?.role}`);
      return;
    }
    
    console.log('📤 Sending banner upload request with proper authentication...');

    const response = await fetch('http://localhost:3002/api/banner/upload', {
      method: 'POST',
      body: formData,
      headers: {
        ...formData.getHeaders(),
        ...authHelper.getAuthHeaders()
      }
    });

    console.log(`📊 Response status: ${response.status}`);
    console.log(`📊 Response headers:`, Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log(`📊 Response body:`, responseText);

    if (response.ok) {
      console.log('✅ Banner upload test successful!');
    } else {
      console.log('❌ Banner upload test failed');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    
    if (error.message.includes('Login failed')) {
      console.log('\n💡 To fix this:');
      console.log('1. Make sure your server is running on localhost:3002');
      console.log('2. Create a super_admin user in your database');
      console.log('3. Update the login credentials in this test file');
      console.log('4. Or use the registration endpoint to create a test user first');
    }
  } finally {
    // Clean up test file
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
    
    // Logout
    await authHelper.logout();
  }
}

testBannerUpload();