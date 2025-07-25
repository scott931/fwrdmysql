const fetch = require('node-fetch');

async function testInstructorCreation() {
  try {
    console.log('Testing instructor creation...');

    const testData = {
      name: "Test Instructor Debug",
      title: "Test Title Debug",
      email: "debug-test-" + Date.now() + "@example.com",
      bio: "Test bio debug",
      image: "https://example.com/image-debug.jpg",
      experience: 5,
      expertise: ["Test"],
      socialLinks: {}
    };

    console.log('Sending data:', JSON.stringify(testData, null, 2));

    const response = await fetch('http://localhost:3002/api/instructors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());

    const responseText = await response.text();
    console.log('Response body:', responseText);

    if (response.ok) {
      console.log('✅ Instructor created successfully!');
    } else {
      console.log('❌ Failed to create instructor');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testInstructorCreation();