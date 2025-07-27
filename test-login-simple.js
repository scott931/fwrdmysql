const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('🔐 Testing login with admin credentials...');

    const response = await fetch('http://localhost:3002/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@forwardafrica.com',
        password: 'admin123'
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Login successful!');
      console.log('Token:', data.token ? 'Present' : 'Missing');
      console.log('User:', data.user ? data.user.email : 'Missing');
      console.log('Role:', data.user ? data.user.role : 'Missing');
    } else {
      console.log('❌ Login failed:', data.error);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLogin();