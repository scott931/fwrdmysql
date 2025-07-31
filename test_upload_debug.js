const fs = require('fs');
const path = require('path');

// Test script to debug upload issues
async function testUpload() {
  try {
    console.log('🧪 Testing banner upload...');

    // Create a test file
    const testFilePath = path.join(__dirname, 'test_banner.jpg');
    const testContent = 'This is a test banner file';
    fs.writeFileSync(testFilePath, testContent);

    const formData = new FormData();
    formData.append('banner', fs.createReadStream(testFilePath));

    const response = await fetch('http://localhost:3002/api/banner/upload', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token'
      },
      body: formData
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    const responseText = await response.text();
    console.log('Response text:', responseText);

    try {
      const responseJson = JSON.parse(responseText);
      console.log('Response JSON:', responseJson);
    } catch (parseError) {
      console.log('Failed to parse JSON:', parseError);
    }

  } catch (error) {
    console.error('Test error:', error);
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error?.constructor?.name);

    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
}

testUpload();