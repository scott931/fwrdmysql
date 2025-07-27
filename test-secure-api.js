// Comprehensive test for secure API routes
const http = require('http');

console.log('🔒 Testing Secure API Routes...\n');

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3002',
  testUser: {
    email: 'admin@forwardafrica.com',
    password: 'admin123'
  }
};

let authToken = null;
let refreshToken = null;

// Utility functions
function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (error) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

// Test 1: Login with enhanced security
async function testSecureLogin() {
  console.log('📝 Test 1: Secure Login');

  const loginData = JSON.stringify(TEST_CONFIG.testUser);
  const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };

  try {
    const result = await makeRequest({ ...options, body: loginData });

    if (result.status === 200) {
      console.log('✅ Secure login successful');
      console.log('🔑 Access token received:', !!result.data.token);
      console.log('🔄 Refresh token received:', !!result.data.refreshToken);
      console.log('👤 User role:', result.data.user?.role);
      console.log('📋 User permissions:', result.data.user?.permissions?.length || 0);

      authToken = result.data.token;
      refreshToken = result.data.refreshToken;
      return true;
    } else {
      console.error('❌ Secure login failed:', result.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Secure login request failed:', error.message);
    return false;
  }
}

// Test 2: Test token refresh
async function testTokenRefresh() {
  console.log('\n📝 Test 2: Token Refresh');

  if (!refreshToken) {
    console.log('⏭️ Skipping - no refresh token available');
    return false;
  }

  const refreshData = JSON.stringify({ refreshToken });
  const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/auth/refresh',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(refreshData)
    }
  };

  try {
    const result = await makeRequest({ ...options, body: refreshData });

    if (result.status === 200) {
      console.log('✅ Token refresh successful');
      console.log('🔄 New access token received:', !!result.data.token);
      console.log('🔄 New refresh token received:', !!result.data.refreshToken);

      authToken = result.data.token;
      refreshToken = result.data.refreshToken;
      return true;
    } else {
      console.log('⚠️ Token refresh failed:', result.data);
      return false;
    }
  } catch (error) {
    console.log('⚠️ Token refresh request failed:', error.message);
    return false;
  }
}

// Test 3: Test protected system configuration access
async function testSystemConfigAccess() {
  console.log('\n📝 Test 3: System Configuration Access');

  if (!authToken) {
    console.log('⏭️ Skipping - no auth token available');
    return false;
  }

  const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/system/config',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  };

  try {
    const result = await makeRequest(options);

    if (result.status === 200) {
      console.log('✅ System config access successful');
      console.log('⚙️ Config keys:', Object.keys(result.data));
      console.log('🔒 Security headers present:', !!result.headers['x-frame-options']);
      return true;
    } else {
      console.error('❌ System config access failed:', result.data);
      return false;
    }
  } catch (error) {
    console.error('❌ System config request failed:', error.message);
    return false;
  }
}

// Test 4: Test system status access
async function testSystemStatusAccess() {
  console.log('\n📝 Test 4: System Status Access');

  if (!authToken) {
    console.log('⏭️ Skipping - no auth token available');
    return false;
  }

  const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/system/status',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  };

  try {
    const result = await makeRequest(options);

    if (result.status === 200) {
      console.log('✅ System status access successful');
      console.log('📊 Database status:', result.data.database?.status);
      console.log('💻 CPU usage:', result.data.systemResources?.cpuUsage + '%');
      console.log('👥 Active users:', result.data.systemResources?.activeUsers);
      return true;
    } else {
      console.error('❌ System status access failed:', result.data);
      return false;
    }
  } catch (error) {
    console.error('❌ System status request failed:', error.message);
    return false;
  }
}

// Test 5: Test system backup creation
async function testSystemBackup() {
  console.log('\n📝 Test 5: System Backup Creation');

  if (!authToken) {
    console.log('⏭️ Skipping - no auth token available');
    return false;
  }

  const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/system/backup',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  };

  try {
    const result = await makeRequest(options);

    if (result.status === 200) {
      console.log('✅ System backup creation successful');
      console.log('💾 Backup ID:', result.data.backupId);
      console.log('📦 Backup size:', result.data.size);
      return true;
    } else {
      console.error('❌ System backup creation failed:', result.data);
      return false;
    }
  } catch (error) {
    console.error('❌ System backup request failed:', error.message);
    return false;
  }
}

// Test 6: Test user management access
async function testUserManagement() {
  console.log('\n📝 Test 6: User Management Access');

  if (!authToken) {
    console.log('⏭️ Skipping - no auth token available');
    return false;
  }

  const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/users?limit=5',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  };

  try {
    const result = await makeRequest(options);

    if (result.status === 200) {
      console.log('✅ User management access successful');
      console.log('👥 Users returned:', result.data.users?.length || 0);
      console.log('📄 Pagination info:', result.data.pagination);
      return true;
    } else {
      console.error('❌ User management access failed:', result.data);
      return false;
    }
  } catch (error) {
    console.error('❌ User management request failed:', error.message);
    return false;
  }
}

// Test 7: Test audit logs access
async function testAuditLogs() {
  console.log('\n📝 Test 7: Audit Logs Access');

  if (!authToken) {
    console.log('⏭️ Skipping - no auth token available');
    return false;
  }

  const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/audit-logs?limit=5',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  };

  try {
    const result = await makeRequest(options);

    if (result.status === 200) {
      console.log('✅ Audit logs access successful');
      console.log('📋 Logs returned:', result.data.logs?.length || 0);
      console.log('📄 Pagination info:', result.data.pagination);
      return true;
    } else {
      console.error('❌ Audit logs access failed:', result.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Audit logs request failed:', error.message);
    return false;
  }
}

// Test 8: Test unauthorized access
async function testUnauthorizedAccess() {
  console.log('\n📝 Test 8: Unauthorized Access Test');

  const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/system/config',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  try {
    const result = await makeRequest(options);

    if (result.status === 401) {
      console.log('✅ Unauthorized access properly blocked');
      console.log('🔒 Error code:', result.data.code);
      return true;
    } else {
      console.error('❌ Unauthorized access not properly blocked:', result.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Unauthorized access test failed:', error.message);
    return false;
  }
}

// Test 9: Test rate limiting
async function testRateLimiting() {
  console.log('\n📝 Test 9: Rate Limiting Test');

  const loginData = JSON.stringify({
    email: 'test@example.com',
    password: 'wrongpassword'
  });

  const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };

  try {
    // Make multiple failed login attempts
    const promises = [];
    for (let i = 0; i < 6; i++) {
      promises.push(makeRequest({ ...options, body: loginData }));
    }

    const results = await Promise.all(promises);
    const lastResult = results[results.length - 1];

    if (lastResult.status === 429) {
      console.log('✅ Rate limiting working correctly');
      console.log('⏱️ Rate limit error:', lastResult.data.error);
      return true;
    } else {
      console.log('⚠️ Rate limiting may not be working as expected');
      return false;
    }
  } catch (error) {
    console.error('❌ Rate limiting test failed:', error.message);
    return false;
  }
}

// Test 10: Test security headers
async function testSecurityHeaders() {
  console.log('\n📝 Test 10: Security Headers Test');

  const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/health',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  try {
    const result = await makeRequest(options);

    const securityHeaders = {
      'X-Frame-Options': result.headers['x-frame-options'],
      'X-Content-Type-Options': result.headers['x-content-type-options'],
      'X-XSS-Protection': result.headers['x-xss-protection'],
      'Content-Security-Policy': result.headers['content-security-policy']
    };

    console.log('🔒 Security headers check:');
    Object.entries(securityHeaders).forEach(([header, value]) => {
      console.log(`  ${header}: ${value ? '✅ Present' : '❌ Missing'}`);
    });

    const allPresent = Object.values(securityHeaders).every(header => header);
    return allPresent;
  } catch (error) {
    console.error('❌ Security headers test failed:', error.message);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Secure API Tests...\n');

  let allTestsPassed = true;

  // Test 1: Secure login
  const loginSuccess = await testSecureLogin();
  if (!loginSuccess) {
    allTestsPassed = false;
  }

  // Test 2: Token refresh
  const refreshSuccess = await testTokenRefresh();
  if (!refreshSuccess) {
    allTestsPassed = false;
  }

  // Test 3: System config access
  const configSuccess = await testSystemConfigAccess();
  if (!configSuccess) {
    allTestsPassed = false;
  }

  // Test 4: System status access
  const statusSuccess = await testSystemStatusAccess();
  if (!statusSuccess) {
    allTestsPassed = false;
  }

  // Test 5: System backup
  const backupSuccess = await testSystemBackup();
  if (!backupSuccess) {
    allTestsPassed = false;
  }

  // Test 6: User management
  const userSuccess = await testUserManagement();
  if (!userSuccess) {
    allTestsPassed = false;
  }

  // Test 7: Audit logs
  const auditSuccess = await testAuditLogs();
  if (!auditSuccess) {
    allTestsPassed = false;
  }

  // Test 8: Unauthorized access
  const unauthorizedSuccess = await testUnauthorizedAccess();
  if (!unauthorizedSuccess) {
    allTestsPassed = false;
  }

  // Test 9: Rate limiting
  const rateLimitSuccess = await testRateLimiting();
  if (!rateLimitSuccess) {
    allTestsPassed = false;
  }

  // Test 10: Security headers
  const headersSuccess = await testSecurityHeaders();
  if (!headersSuccess) {
    allTestsPassed = false;
  }

  // Summary
  console.log('\n📊 Secure API Test Summary:');
  console.log('============================');
  console.log(`🔐 Secure Login: ${loginSuccess ? '✅' : '❌'}`);
  console.log(`🔄 Token Refresh: ${refreshSuccess ? '✅' : '❌'}`);
  console.log(`⚙️ System Config: ${configSuccess ? '✅' : '❌'}`);
  console.log(`📊 System Status: ${statusSuccess ? '✅' : '❌'}`);
  console.log(`💾 System Backup: ${backupSuccess ? '✅' : '❌'}`);
  console.log(`👥 User Management: ${userSuccess ? '✅' : '❌'}`);
  console.log(`📋 Audit Logs: ${auditSuccess ? '✅' : '❌'}`);
  console.log(`🚫 Unauthorized Access: ${unauthorizedSuccess ? '✅' : '❌'}`);
  console.log(`⏱️ Rate Limiting: ${rateLimitSuccess ? '✅' : '❌'}`);
  console.log(`🔒 Security Headers: ${headersSuccess ? '✅' : '❌'}`);

  if (allTestsPassed) {
    console.log('\n🎉 All secure API tests passed! Your API is properly secured.');
  } else {
    console.log('\n⚠️ Some tests failed. Check the logs above for details.');
  }

  console.log('\n💡 Security Features Implemented:');
  console.log('• JWT token authentication with refresh tokens');
  console.log('• Role-based access control (RBAC)');
  console.log('• Rate limiting on sensitive endpoints');
  console.log('• Security headers (XSS, CSRF protection)');
  console.log('• Audit logging for all actions');
  console.log('• Account lockout after failed attempts');
  console.log('• Input validation and sanitization');
  console.log('• Secure password handling with bcrypt');
}

// Run the tests
runAllTests().catch(console.error);