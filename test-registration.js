// Test configuration
const BASE_URL = 'http://localhost:3002';

// Test registration data
const testRegistrationData = {
  email: 'testuser@example.com',
  password: 'testpassword123',
  full_name: 'Test User',
  industry: 'Technology',
  country: 'Kenya'
};

async function testUserRegistration() {
  console.log('🔍 Testing user registration...');
  
  try {
    // Test registration
    console.log('\n📝 Step 1: Testing registration...');
    console.log('📋 Registration data:', testRegistrationData);

    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testRegistrationData)
    });

    console.log('📡 Registration response status:', registerResponse.status);
    console.log('📡 Registration response headers:', Object.fromEntries(registerResponse.headers.entries()));

    if (!registerResponse.ok) {
      const errorText = await registerResponse.text();
      console.error('❌ Registration failed:', errorText);
      throw new Error(`Registration failed: ${registerResponse.status} - ${errorText}`);
    }

    const registerResult = await registerResponse.json();
    console.log('✅ Registration successful');
    console.log('📋 Registration result:', registerResult);

    // Test login with the new user
    console.log('\n🔐 Step 2: Testing login with new user...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testRegistrationData.email,
        password: testRegistrationData.password
      })
    });

    if (loginResponse.ok) {
      const loginResult = await loginResponse.json();
      console.log('✅ Login successful with new user');
      console.log('👤 User ID:', loginResult.user.id);
      console.log('👤 User role:', loginResult.user.role);
    } else {
      console.log('⚠️ Login failed with new user (this might be expected)');
    }

    return true;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

testUserRegistration(); 