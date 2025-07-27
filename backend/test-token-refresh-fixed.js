// Test Token Refresh Functionality (Fixed Version)
// This script tests the token refresh system with proper error handling

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_BASE_URL = 'http://localhost:3002/api';

async function testTokenRefresh() {
  console.log('🧪 Testing Token Refresh Functionality (Fixed Version)\n');

  try {
    // Step 1: Login to get initial tokens
    console.log('1️⃣ Logging in to get initial tokens...');
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
      throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText} - ${errorData.error}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    console.log(`   Access Token: ${loginData.token.substring(0, 20)}...`);
    console.log(`   Refresh Token: ${loginData.refreshToken.substring(0, 20)}...`);
    console.log(`   User: ${loginData.user.full_name}\n`);

    // Step 2: Test accessing protected endpoint
    console.log('2️⃣ Testing access to protected endpoint...');
    const profileResponse = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
      },
    });

    if (!profileResponse.ok) {
      const errorData = await profileResponse.json();
      throw new Error(`Profile access failed: ${profileResponse.status} ${profileResponse.statusText} - ${errorData.error}`);
    }

    const profileData = await profileResponse.json();
    console.log('✅ Profile access successful');
    console.log(`   User ID: ${profileData.id}`);
    console.log(`   Email: ${profileData.email}\n`);

    // Step 3: Test token refresh
    console.log('3️⃣ Testing token refresh...');
    const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: loginData.refreshToken
      }),
    });

    if (!refreshResponse.ok) {
      const errorData = await refreshResponse.json();
      throw new Error(`Token refresh failed: ${refreshResponse.status} ${refreshResponse.statusText} - ${errorData.error}`);
    }

    const refreshData = await refreshResponse.json();
    console.log('✅ Token refresh successful');
    console.log(`   New Access Token: ${refreshData.token.substring(0, 20)}...`);
    console.log(`   New Refresh Token: ${refreshData.refreshToken.substring(0, 20)}...`);
    console.log(`   Message: ${refreshData.message}\n`);

    // Step 4: Test accessing protected endpoint with new token
    console.log('4️⃣ Testing access with refreshed token...');
    const newProfileResponse = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${refreshData.token}`,
      },
    });

    if (!newProfileResponse.ok) {
      const errorData = await newProfileResponse.json();
      throw new Error(`Profile access with new token failed: ${newProfileResponse.status} ${newProfileResponse.statusText} - ${errorData.error}`);
    }

    const newProfileData = await newProfileResponse.json();
    console.log('✅ Profile access with new token successful');
    console.log(`   User ID: ${newProfileData.id}`);
    console.log(`   Email: ${newProfileData.email}\n`);

    // Step 5: Test invalid refresh token
    console.log('5️⃣ Testing invalid refresh token...');
    const invalidRefreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: 'invalid.refresh.token'
      }),
    });

    if (invalidRefreshResponse.ok) {
      throw new Error('Invalid refresh token should have failed');
    }

    const invalidRefreshData = await invalidRefreshResponse.json();
    console.log('✅ Invalid refresh token correctly rejected');
    console.log(`   Error: ${invalidRefreshData.error}`);
    console.log(`   Code: ${invalidRefreshData.code}\n`);

    // Step 6: Test undefined refresh token
    console.log('6️⃣ Testing undefined refresh token...');
    const undefinedRefreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: undefined
      }),
    });

    if (undefinedRefreshResponse.ok) {
      throw new Error('Undefined refresh token should have failed');
    }

    const undefinedRefreshData = await undefinedRefreshResponse.json();
    console.log('✅ Undefined refresh token correctly rejected');
    console.log(`   Error: ${undefinedRefreshData.error}`);
    console.log(`   Code: ${undefinedRefreshData.code}\n`);

    // Step 7: Test empty refresh token
    console.log('7️⃣ Testing empty refresh token...');
    const emptyRefreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: ''
      }),
    });

    if (emptyRefreshResponse.ok) {
      throw new Error('Empty refresh token should have failed');
    }

    const emptyRefreshData = await emptyRefreshResponse.json();
    console.log('✅ Empty refresh token correctly rejected');
    console.log(`   Error: ${emptyRefreshData.error}`);
    console.log(`   Code: ${emptyRefreshData.code}\n`);

    // Step 8: Test logout
    console.log('8️⃣ Testing logout...');
    const logoutResponse = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${refreshData.token}`,
      },
    });

    if (!logoutResponse.ok) {
      const errorData = await logoutResponse.json();
      throw new Error(`Logout failed: ${logoutResponse.status} ${logoutResponse.statusText} - ${errorData.error}`);
    }

    const logoutData = await logoutResponse.json();
    console.log('✅ Logout successful');
    console.log(`   Message: ${logoutData.message}\n`);

    // Step 9: Test that refresh token is invalidated
    console.log('9️⃣ Testing that refresh token is invalidated after logout...');
    const invalidatedRefreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: refreshData.refreshToken
      }),
    });

    if (invalidatedRefreshResponse.ok) {
      throw new Error('Refresh token should be invalidated after logout');
    }

    const invalidatedRefreshData = await invalidatedRefreshResponse.json();
    console.log('✅ Refresh token correctly invalidated after logout');
    console.log(`   Error: ${invalidatedRefreshData.error}`);
    console.log(`   Code: ${invalidatedRefreshData.code}\n`);

    console.log('🎉 All token refresh tests passed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Test token expiration handling
async function testTokenExpiration() {
  console.log('\n🧪 Testing Token Expiration Handling\n');

  try {
    // Login to get tokens
    console.log('1️⃣ Logging in...');
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
      throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText} - ${errorData.error}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful\n');

    // Test accessing endpoint with expired token (simulated)
    console.log('2️⃣ Testing access with expired token...');

    // Create an expired token by modifying the existing one
    const tokenParts = loginData.token.split('.');
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());

    // Set expiration to past time
    payload.exp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago

    const expiredToken = tokenParts[0] + '.' +
                       Buffer.from(JSON.stringify(payload)).toString('base64') + '.' +
                       tokenParts[2];

    const expiredResponse = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${expiredToken}`,
      },
    });

    if (expiredResponse.ok) {
      throw new Error('Expired token should have been rejected');
    }

    const expiredData = await expiredResponse.json();
    console.log('✅ Expired token correctly rejected');
    console.log(`   Error: ${expiredData.error}`);
    console.log(`   Code: ${expiredData.code}\n`);

    console.log('🎉 Token expiration tests passed!');

  } catch (error) {
    console.error('❌ Token expiration test failed:', error.message);
    process.exit(1);
  }
}

// Test malformed tokens
async function testMalformedTokens() {
  console.log('\n🧪 Testing Malformed Token Handling\n');

  try {
    // Test with malformed token
    console.log('1️⃣ Testing malformed token...');
    const malformedResponse = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer malformed.token.here`,
      },
    });

    if (malformedResponse.ok) {
      throw new Error('Malformed token should have been rejected');
    }

    const malformedData = await malformedResponse.json();
    console.log('✅ Malformed token correctly rejected');
    console.log(`   Error: ${malformedData.error}`);
    console.log(`   Code: ${malformedData.code}\n`);

    // Test with token missing userId
    console.log('2️⃣ Testing token with missing userId...');
    const tokenWithoutUserId = jwt.sign(
      { role: 'user', exp: Math.floor(Date.now() / 1000) + 3600 },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    );

    const noUserIdResponse = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${tokenWithoutUserId}`,
      },
    });

    if (noUserIdResponse.ok) {
      throw new Error('Token without userId should have been rejected');
    }

    const noUserIdData = await noUserIdResponse.json();
    console.log('✅ Token without userId correctly rejected');
    console.log(`   Error: ${noUserIdData.error}`);
    console.log(`   Code: ${noUserIdData.code}\n`);

    console.log('🎉 Malformed token tests passed!');

  } catch (error) {
    console.error('❌ Malformed token test failed:', error.message);
    process.exit(1);
  }
}

// Run tests
async function runAllTests() {
  await testTokenRefresh();
  await testTokenExpiration();
  await testMalformedTokens();
  console.log('\n✨ All token refresh and error handling tests completed successfully!');
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (response.ok) {
      console.log('✅ Server is running');
      return true;
    }
  } catch (error) {
    console.error('❌ Server is not running. Please start the backend server first.');
    console.error('   Run: cd backend && npm start');
    return false;
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting Token Refresh Tests (Fixed Version)\n');

  const serverRunning = await checkServer();
  if (!serverRunning) {
    process.exit(1);
  }

  await runAllTests();
}

main().catch(console.error);