const fetch = require('node-fetch');

async function testInstructorCreation() {
  try {
    console.log('Testing instructor creation...');

    // Test data
    const instructorData = {
      name: 'Test Instructor',
      title: 'Test Title',
      email: 'test@example.com',
      phone: '+1234567890',
      bio: 'Test bio',
      image: 'https://example.com/image.jpg',
      experience: 5,
      expertise: ['JavaScript', 'React'],
      socialLinks: {
        linkedin: 'https://linkedin.com/test',
        twitter: 'https://twitter.com/test',
        website: 'https://test.com'
      }
    };

    console.log('Sending request to create instructor...');
    const response = await fetch('http://localhost:3002/api/instructors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(instructorData)
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);

    if (!response.ok) {
      console.error('Error creating instructor:', data.error);
    } else {
      console.log('Instructor created successfully:', data);
    }

  } catch (error) {
    console.error('Request failed:', error.message);
  }
}

testInstructorCreation();