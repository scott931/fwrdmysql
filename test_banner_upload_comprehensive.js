const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const TestAuthHelper = require('./test_auth_helper');

// Create different test files
const testImageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
const testTextData = Buffer.from('This is a text file, not an image or video.');

console.log('🧪 Comprehensive banner upload testing with proper authentication...');

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

    const tests = [
      {
        name: 'Valid PNG Image with Auth',
        data: testImageData,
        filename: 'test-image.png',
        expectedStatus: 200, // Should succeed with proper auth
        description: 'Should accept PNG image with proper authentication',
        useAuth: true
      },
      {
        name: 'Valid PNG Image without Auth',
        data: testImageData,
        filename: 'test-image-no-auth.png',
        expectedStatus: 401, // Should fail without auth
        description: 'Should reject PNG image without authentication',
        useAuth: false
      },
      {
        name: 'Invalid Text File with Auth',
        data: testTextData,
        filename: 'test-file.txt',
        expectedStatus: 400,
        description: 'Should reject text file with proper error message',
        useAuth: true
      }
    ];

    for (const test of tests) {
      console.log(`\n📋 Testing: ${test.name}`);
      console.log(`📝 ${test.description}`);

      // Write test file
      const testFilePath = path.join(__dirname, test.filename);
      fs.writeFileSync(testFilePath, test.data);

      try {
        // Create form data
        const formData = new FormData();
        formData.append('banner', fs.createReadStream(testFilePath));

        console.log('📤 Sending request...');

        const headers = {
          ...formData.getHeaders()
        };

        // Add auth headers if needed
        if (test.useAuth) {
          Object.assign(headers, authHelper.getAuthHeaders());
        }

        const response = await fetch('http://localhost:3002/api/banner/upload', {
          method: 'POST',
          body: formData,
          headers
        });

        const responseText = await response.text();
        console.log(`📊 Status: ${response.status}`);
        console.log(`📊 Response: ${responseText}`);

        if (response.status === test.expectedStatus) {
          console.log('✅ Test passed - Expected status received');
        } else {
          console.log('❌ Test failed - Unexpected status');
        }

      } catch (error) {
        console.error('❌ Test failed with error:', error.message);
      } finally {
        // Clean up test file
        if (fs.existsSync(testFilePath)) {
          fs.unlinkSync(testFilePath);
        }
      }
    }

  } catch (error) {
    console.error('❌ Test setup failed with error:', error.message);
    
    if (error.message.includes('Login failed')) {
      console.log('\n💡 To fix this:');
      console.log('1. Make sure your server is running on localhost:3002');
      console.log('2. Create a super_admin user in your database');
      console.log('3. Update the login credentials in this test file');
      console.log('4. Or use the registration endpoint to create a test user first');
    }
  } finally {
    // Logout
    await authHelper.logout();
  }
}

// Use node-fetch if available, otherwise use global fetch
const fetch = require('node-fetch');
testBannerUpload();