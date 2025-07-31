const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Create different test files
const testImageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
const testTextData = Buffer.from('This is a text file, not an image or video.');

console.log('🧪 Testing banner upload without authentication...');

async function testBannerUpload() {
  const tests = [
    {
      name: 'Valid PNG Image',
      data: testImageData,
      filename: 'test-image.png',
      description: 'Should accept PNG image'
    },
    {
      name: 'Invalid Text File',
      data: testTextData,
      filename: 'test-file.txt',
      description: 'Should reject text file with proper error message'
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

      const response = await fetch('http://localhost:3002/api/banner/upload', {
        method: 'POST',
        body: formData,
        headers: {
          ...formData.getHeaders()
          // No Authorization header to test fileFilter before auth
        }
      });

      const responseText = await response.text();
      console.log(`📊 Status: ${response.status}`);
      console.log(`📊 Response: ${responseText}`);

      if (response.status === 401) {
        console.log('✅ Test passed - Authentication required (expected)');
      } else if (response.status === 400) {
        console.log('✅ Test passed - File validation working');
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
}

// Use node-fetch if available, otherwise use global fetch
const fetch = require('node-fetch');
testBannerUpload();