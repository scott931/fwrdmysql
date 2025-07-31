const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Test script for Next.js banner upload API
async function testNextJsUpload() {
  try {
    console.log('🧪 Testing Next.js banner upload API...');

    // Create a test image file
    const testFilePath = path.join(__dirname, 'test_banner_nextjs.jpg');
    const testContent = Buffer.from('fake image data for Next.js test', 'utf8');
    fs.writeFileSync(testFilePath, testContent);

    const formData = new FormData();
    formData.append('banner', fs.createReadStream(testFilePath), {
      filename: 'test_banner_nextjs.jpg',
      contentType: 'image/jpeg'
    });

    const response = await fetch('http://localhost:3000/api/banner/upload', {
      method: 'POST',
      body: formData
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('Response text:', responseText);

    if (response.ok) {
      try {
        const responseJson = JSON.parse(responseText);
        console.log('✅ Next.js upload successful:', responseJson);
        console.log('✅ URL generated:', responseJson.url);
        console.log('✅ File type:', responseJson.fileType);
        console.log('✅ File size:', responseJson.size);
      } catch (parseError) {
        console.log('⚠️ Response is not JSON:', parseError);
      }
    } else {
      console.log('❌ Next.js upload failed');
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
    console.error('❌ Next.js test error:', error);
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error?.constructor?.name);

    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
}

// Test banner config API
async function testBannerConfig() {
  try {
    console.log('\n🧪 Testing banner config API...');

    // Test GET request
    const getResponse = await fetch('http://localhost:3000/api/banner/config');
    console.log('GET response status:', getResponse.status);

    if (getResponse.ok) {
      const config = await getResponse.json();
      console.log('✅ Current banner config:', config);
    } else {
      console.log('❌ Failed to get banner config');
    }

    // Test PUT request
    const testConfig = {
      homepage_banner_enabled: true,
      homepage_banner_type: 'image',
      homepage_banner_title: 'Test Banner',
      homepage_banner_button_text: 'Test Button'
    };

    const putResponse = await fetch('http://localhost:3000/api/banner/config', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testConfig)
    });

    console.log('PUT response status:', putResponse.status);

    if (putResponse.ok) {
      const result = await putResponse.json();
      console.log('✅ Banner config updated:', result);
    } else {
      console.log('❌ Failed to update banner config');
    }

  } catch (error) {
    console.error('❌ Banner config test error:', error);
  }
}

// Run tests
async function runNextJsTests() {
  console.log('🚀 Starting Next.js API tests...\n');

  await testNextJsUpload();
  console.log('\n' + '='.repeat(50) + '\n');
  await testBannerConfig();

  console.log('\n✅ Next.js API tests completed!');
}

runNextJsTests();