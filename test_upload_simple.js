const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Simple test script for banner upload
async function testUpload() {
  try {
    console.log('🧪 Testing simplified banner upload...');

    // Create a test image file
    const testFilePath = path.join(__dirname, 'test_banner.jpg');
    const testContent = Buffer.from('fake image data', 'utf8');
    fs.writeFileSync(testFilePath, testContent);

    const formData = new FormData();
    formData.append('banner', fs.createReadStream(testFilePath), {
      filename: 'test_banner.jpg',
      contentType: 'image/jpeg'
    });

    const response = await fetch('http://localhost:3002/api/banner/upload', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token',
        ...formData.getHeaders()
      },
      body: formData
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('Response text:', responseText);

    if (response.ok) {
      try {
        const responseJson = JSON.parse(responseText);
        console.log('✅ Upload successful:', responseJson);
      } catch (parseError) {
        console.log('⚠️ Response is not JSON:', parseError);
      }
    } else {
      console.log('❌ Upload failed');
      try {
        const errorJson = JSON.parse(responseText);
        console.log('Error details:', errorJson);
      } catch (parseError) {
        console.log('Error response is not JSON');
      }
    }

    // Clean up test file
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }

  } catch (error) {
    console.error('❌ Test error:', error);
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error?.constructor?.name);

    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
}

// Test the test endpoint first
async function testEndpoint() {
  try {
    console.log('🧪 Testing endpoint availability...');

    const response = await fetch('http://localhost:3002/api/banner/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Test endpoint status:', response.status);
    const responseText = await response.text();
    console.log('Test endpoint response:', responseText);

  } catch (error) {
    console.error('❌ Test endpoint error:', error);
  }
}

// Run tests
async function runTests() {
  await testEndpoint();
  console.log('\n' + '='.repeat(50) + '\n');
  await testUpload();
}

runTests();