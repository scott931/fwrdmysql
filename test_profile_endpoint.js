/**
 * Test script to directly test the profile update endpoint
 * This will help us verify if the authorization fix is working
 */

const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3002/api';

async function testProfileUpdate() {
  try {
    console.log('🧪 Testing profile update endpoint...');

    // First, let's login to get a token
    console.log('\n1. Logging in to get authentication token...');

    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@forwardafrica.com',
        password: 'admin123'
      }),
    });

    if (!loginResponse.ok) {
      const errorData = await loginResponse.json();
      console.error('❌ Login failed:', errorData);
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    const user = loginData.user;

    console.log('✅ Login successful');
    console.log(`   User: ${user.full_name} (${user.email})`);
    console.log(`   Role: ${user.role}`);
    console.log(`   User ID: ${user.id}`);

    // Now test the profile update endpoint
    console.log('\n2. Testing profile update endpoint...');

    const updateData = {
      full_name: 'Scott M (Updated)',
      industry: 'Technology',
      experience_level: 'Senior',
      business_stage: 'Growth'
    };

    console.log('   Update data:', updateData);
    console.log(`   Endpoint: ${API_BASE_URL}/users/${user.id}`);

    const updateResponse = await fetch(`${API_BASE_URL}/users/${user.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    console.log(`   Response status: ${updateResponse.status}`);

    if (updateResponse.ok) {
      const updatedUser = await updateResponse.json();
      console.log('✅ Profile update successful!');
      console.log('   Updated user data:', {
        id: updatedUser.id,
        full_name: updatedUser.full_name,
        industry: updatedUser.industry,
        experience_level: updatedUser.experience_level,
        business_stage: updatedUser.business_stage
      });
    } else {
      const errorData = await updateResponse.json();
      console.error('❌ Profile update failed:', errorData);
    }

    // Test with a different user (if we have one)
    console.log('\n3. Testing with a regular user...');

    const userLoginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'user@forwardafrica.com',
        password: 'user123'
      }),
    });

    if (userLoginResponse.ok) {
      const userLoginData = await userLoginResponse.json();
      const userToken = userLoginData.token;
      const regularUser = userLoginData.user;

      console.log(`   Testing with user: ${regularUser.full_name} (${regularUser.role})`);

      const userUpdateResponse = await fetch(`${API_BASE_URL}/users/${regularUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: 'Sample User (Updated)',
          industry: 'Education'
        }),
      });

      console.log(`   Response status: ${userUpdateResponse.status}`);

      if (userUpdateResponse.ok) {
        const updatedRegularUser = await userUpdateResponse.json();
        console.log('✅ Regular user profile update successful!');
        console.log('   Updated user data:', {
          id: updatedRegularUser.id,
          full_name: updatedRegularUser.full_name,
          industry: updatedRegularUser.industry
        });
      } else {
        const errorData = await userUpdateResponse.json();
        console.error('❌ Regular user profile update failed:', errorData);
      }
    } else {
      console.log('   Skipping regular user test (login failed)');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testProfileUpdate();