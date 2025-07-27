// Test configuration
const BASE_URL = 'http://localhost:3002';

// Test data
const testUser = {
  email: 'admin@forwardafrica.com',
  password: 'admin123'
};

async function testAuditLogsWithRealToken() {
  console.log('🔍 Testing audit logs with real token...');

  try {
    // Step 1: Login to get a real token
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
    console.log('✅ Login successful');
    console.log('👤 User role:', loginData.user.role);
    console.log('🔑 Token received:', token.substring(0, 50) + '...');

    // Step 2: Test audit logs endpoint with real token
    console.log('\n📋 Step 2: Testing audit logs endpoint...');
    const auditResponse = await fetch(`${BASE_URL}/api/audit-logs?limit=5`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('📡 Audit logs response status:', auditResponse.status);
    console.log('📡 Audit logs response headers:', Object.fromEntries(auditResponse.headers.entries()));

    if (!auditResponse.ok) {
      const errorText = await auditResponse.text();
      console.error('❌ Audit logs failed:', errorText);
      throw new Error(`Audit logs failed: ${auditResponse.status} - ${errorText}`);
    }

    const auditData = await auditResponse.json();
    console.log('✅ Audit logs successful');
    console.log('📊 Logs count:', Array.isArray(auditData) ? auditData.length : 'Unknown format');

    if (Array.isArray(auditData) && auditData.length > 0) {
      console.log('📋 Sample log:', auditData[0]);
    }

    return true;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

testAuditLogsWithRealToken();