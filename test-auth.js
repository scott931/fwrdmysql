const fetch = require('node-fetch');

async function testAuth() {
  console.log('🔐 Testing authentication system...');

  try {
    // Test login
    console.log('📝 Testing login...');
    const loginResponse = await fetch('http://localhost:3002/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@forwardafrica.com',
        password: 'admin123'
      })
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login successful:', loginData.message);
      console.log('   User:', loginData.user.email);
      console.log('   Role:', loginData.user.role);

      // Test protected endpoint with token
      console.log('🔒 Testing protected endpoint...');
      const coursesResponse = await fetch('http://localhost:3002/api/courses', {
        headers: {
          'Authorization': `Bearer ${loginData.token}`
        }
      });

      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        console.log('✅ Protected endpoint working:', coursesData.length, 'courses found');
      } else {
        console.log('❌ Protected endpoint failed:', coursesResponse.status);
      }
    } else {
      const errorData = await loginResponse.json();
      console.log('❌ Login failed:', errorData.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAuth();