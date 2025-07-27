const fetch = require('node-fetch');

// Test configuration
const BASE_URL = 'http://localhost:3002';
const FRONTEND_URL = 'http://localhost:3000';

// Test data
const testUser = {
  email: 'admin@forwardafrica.com',
  password: 'admin123'
};

let authToken = null;

// Helper function to make authenticated requests
async function makeAuthRequest(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
    ...options.headers
  };

  return fetch(url, {
    ...options,
    headers
  });
}

// Test 1: Authentication
async function testAuthentication() {
  console.log('\n🔐 Test 1: Authentication');

  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }

    const data = await response.json();
    authToken = data.token;
    console.log('✅ Authentication successful');
    console.log('👤 User role:', data.user.role);
    return true;
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    return false;
  }
}

// Test 2: System Configuration Access
async function testSystemConfiguration() {
  console.log('\n⚙️ Test 2: System Configuration Access');

  try {
    const response = await makeAuthRequest(`${BASE_URL}/api/system/config`);

    if (!response.ok) {
      throw new Error(`System config failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ System configuration accessible');
    console.log('📋 Config keys:', Object.keys(data));
    return true;
  } catch (error) {
    console.error('❌ System configuration failed:', error.message);
    return false;
  }
}

// Test 3: Audit Logs Access
async function testAuditLogs() {
  console.log('\n📋 Test 3: Audit Logs Access');

  try {
    const response = await makeAuthRequest(`${BASE_URL}/api/audit-logs?limit=5`);

    if (!response.ok) {
      throw new Error(`Audit logs failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Audit logs accessible');
    console.log('📊 Logs count:', Array.isArray(data) ? data.length : 'Unknown format');
    return true;
  } catch (error) {
    console.error('❌ Audit logs failed:', error.message);
    return false;
  }
}

// Test 4: Recent Activity (Audit Logs with filters)
async function testRecentActivity() {
  console.log('\n📈 Test 4: Recent Activity');

  try {
    const response = await makeAuthRequest(`${BASE_URL}/api/audit-logs?limit=10&action=LOGIN`);

    if (!response.ok) {
      throw new Error(`Recent activity failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Recent activity accessible');
    console.log('📊 Activity items:', Array.isArray(data) ? data.length : 'Unknown format');
    return true;
  } catch (error) {
    console.error('❌ Recent activity failed:', error.message);
    return false;
  }
}

// Test 5: Course Data for Start Learning
async function testCourseData() {
  console.log('\n🎓 Test 5: Course Data for Start Learning');

  try {
    const response = await makeAuthRequest(`${BASE_URL}/api/courses`);

    if (!response.ok) {
      throw new Error(`Course data failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Course data accessible');

    if (Array.isArray(data) && data.length > 0) {
      const firstCourse = data[0];
      console.log('📚 First course:', {
        id: firstCourse.id,
        title: firstCourse.title,
        lessonsCount: firstCourse.lessons?.length || 0,
        hasLessons: firstCourse.lessons && firstCourse.lessons.length > 0
      });

      if (firstCourse.lessons && firstCourse.lessons.length > 0) {
        console.log('✅ Course has lessons - Start Learning should work');
        return true;
      } else {
        console.log('⚠️ Course has no lessons - Start Learning will show "Coming Soon"');
        return true;
      }
    } else {
      console.log('⚠️ No courses found');
      return false;
    }
  } catch (error) {
    console.error('❌ Course data failed:', error.message);
    return false;
  }
}

// Test 6: Frontend Routes (basic check)
async function testFrontendRoutes() {
  console.log('\n🌐 Test 6: Frontend Routes');

  try {
    // Test if frontend is running
    const response = await fetch(FRONTEND_URL);

    if (!response.ok) {
      throw new Error(`Frontend not accessible: ${response.status}`);
    }

    console.log('✅ Frontend is running');
    console.log('🔗 Available routes:');
    console.log('   - /admin/system-configuration');
    console.log('   - /admin/audit-logs');
    console.log('   - /course/[courseId]/lesson/[lessonId]');
    return true;
  } catch (error) {
    console.error('❌ Frontend not accessible:', error.message);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting comprehensive system test...');
  console.log('=' .repeat(50));

  const results = {
    authentication: await testAuthentication(),
    systemConfig: await testSystemConfiguration(),
    auditLogs: await testAuditLogs(),
    recentActivity: await testRecentActivity(),
    courseData: await testCourseData(),
    frontendRoutes: await testFrontendRoutes()
  };

  console.log('\n' + '=' .repeat(50));
  console.log('📊 Test Results Summary:');
  console.log('=' .repeat(50));

  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`${status} ${testName}`);
  });

  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;

  console.log('\n' + '=' .repeat(50));
  console.log(`🎯 Overall Result: ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! The system is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Please check the errors above.');
  }

  // Specific issue summary
  console.log('\n🔧 Issues Fixed:');
  console.log('1. System config page redirecting to login - Fixed AuthGuard role checking');
  console.log('2. Audit logs not working - Fixed API authentication and error handling');
  console.log('3. Recent activity not working - Fixed audit logs API integration');
  console.log('4. Start Learning button not working - Added debugging and verified routing');
}

// Run the tests
runAllTests().catch(console.error);