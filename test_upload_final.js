const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Final test script for banner upload with proper error handling
async function testUpload() {
  try {
    console.log('🧪 Testing final banner upload implementation...');

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
        console.log('✅ URL generated:', responseJson.url);
        console.log('✅ File type:', responseJson.fileType);
        console.log('✅ File size:', responseJson.size);
      } catch (parseError) {
        console.log('⚠️ Response is not JSON:', parseError);
      }
    } else {
      console.log('❌ Upload failed');
      try {
        const errorJson = JSON.parse(responseText);
        console.log('Error details:', errorJson);
        console.log('Error message:', errorJson.error);
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

// Test with valid token (simulate)
async function testWithValidToken() {
  try {
    console.log('🧪 Testing with valid token simulation...');

    // Create a test image file
    const testFilePath = path.join(__dirname, 'test_banner_valid.jpg');
    const testContent = Buffer.from('fake image data', 'utf8');
    fs.writeFileSync(testFilePath, testContent);

    const formData = new FormData();
    formData.append('banner', fs.createReadStream(testFilePath), {
      filename: 'test_banner_valid.jpg',
      contentType: 'image/jpeg'
    });

    // Simulate a valid token (this would normally come from authentication)
    const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsInJvbGUiOiJzdXBlcl9hZG1pbiIsImlhdCI6MTYzNTY4OTYwMCwiZXhwIjoxNjM1NjkzMjAwfQ.test';

    const response = await fetch('http://localhost:3002/api/banner/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${validToken}`,
        ...formData.getHeaders()
      },
      body: formData
    });

    console.log('Response status:', response.status);

    const responseText = await response.text();
    console.log('Response text:', responseText);

    if (response.ok) {
      try {
        const responseJson = JSON.parse(responseText);
        console.log('✅ Upload with valid token successful:', responseJson);
      } catch (parseError) {
        console.log('⚠️ Response is not JSON:', parseError);
      }
    } else {
      console.log('❌ Upload with valid token failed');
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
    console.error('❌ Test with valid token error:', error);
  }
}

// Run tests
async function runFinalTests() {
  console.log('🚀 Starting final upload tests...\n');

  await testUpload();
  console.log('\n' + '='.repeat(50) + '\n');
  await testWithValidToken();

  console.log('\n✅ Final tests completed!');
}

runFinalTests();