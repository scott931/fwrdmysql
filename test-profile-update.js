// Test configuration
const BASE_URL = 'http://localhost:3002';

// Test data
const testUser = {
  email: 'admin@forwardafrica.com',
  password: 'admin123'
};

async function testProfileUpdate() {
  console.log('🔍 Testing profile update...');

  try {
    // Step 1: Login to get a token
    console.log('\n🔐 Step 1: Getting authentication token...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    const userId = loginData.user.id;
    console.log('✅ Login successful');
    console.log('👤 User ID:', userId);
    console.log('👤 User role:', loginData.user.role);

    // Step 2: Test profile update
    console.log('\n📝 Step 2: Testing profile update...');
    const updateData = {
      full_name: 'Updated Admin Name',
      industry: 'Technology'
    };

    const updateResponse = await fetch(`${BASE_URL}/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });

    console.log('📡 Update response status:', updateResponse.status);
    console.log('📡 Update response headers:', Object.fromEntries(updateResponse.headers.entries()));

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('❌ Profile update failed:', errorText);
      throw new Error(`Profile update failed: ${updateResponse.status} - ${errorText}`);
    }

    const updateResult = await updateResponse.json();
    console.log('✅ Profile update successful');
    console.log('📋 Update result:', updateResult);

    return true;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

testProfileUpdate();