// Test script to verify logout functionality
// This script can be run in the browser console to test the logout behavior

console.log('🧪 Testing logout functionality...');

// Test 1: Check if auth context is available
function testAuthContext() {
  console.log('Test 1: Checking AuthContext availability');

  // Check if we can access localStorage
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('forward_africa_token');
    const user = localStorage.getItem('forward_africa_user');

    console.log('Current auth state:', {
      hasToken: !!token,
      hasUser: !!user,
      tokenLength: token ? token.length : 0
    });

    return { hasToken: !!token, hasUser: !!user };
  }

  return { hasToken: false, hasUser: false };
}

// Test 2: Simulate logout
function testLogout() {
  console.log('Test 2: Simulating logout');

  if (typeof window !== 'undefined') {
    // Clear auth data
    localStorage.removeItem('forward_africa_token');
    localStorage.removeItem('forward_africa_refresh_token');
    localStorage.removeItem('forward_africa_user');
    localStorage.removeItem('forward_africa_token_expiry');

    console.log('✅ Auth data cleared');

    // Check if data was actually cleared
    const token = localStorage.getItem('forward_africa_token');
    const user = localStorage.getItem('forward_africa_user');

    console.log('After logout:', {
      hasToken: !!token,
      hasUser: !!user
    });

    return { success: !token && !user };
  }

  return { success: false };
}

// Test 3: Check current page and navigation
function testNavigation() {
  console.log('Test 3: Checking navigation state');

  const currentPath = window.location.pathname;
  const publicPaths = [
    '/login',
    '/register',
    '/',
    '/landing',
    '/about',
    '/afri-sage',
    '/community',
    '/courses',
    '/category'
  ];

  const isPublicPath = publicPaths.some(path =>
    currentPath === path || currentPath.startsWith(path)
  );

  console.log('Navigation check:', {
    currentPath,
    isPublicPath,
    shouldRedirect: !isPublicPath
  });

  return { currentPath, isPublicPath, shouldRedirect: !isPublicPath };
}

// Test 4: Simulate session expiration
function testSessionExpiration() {
  console.log('Test 4: Simulating session expiration');

  // Create a mock expired token
  const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

  if (typeof window !== 'undefined') {
    localStorage.setItem('forward_africa_token', expiredToken);
    console.log('✅ Expired token set');

    // Check if token is expired
    try {
      const payload = JSON.parse(atob(expiredToken.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp < currentTime;

      console.log('Token expiration check:', {
        tokenExpiry: payload.exp,
        currentTime,
        isExpired
      });

      return { isExpired };
    } catch (error) {
      console.error('Error parsing token:', error);
      return { isExpired: true };
    }
  }

  return { isExpired: false };
}

// Run all tests
function runAllTests() {
  console.log('🚀 Starting logout functionality tests...\n');

  const test1 = testAuthContext();
  console.log('Test 1 result:', test1, '\n');

  const test2 = testLogout();
  console.log('Test 2 result:', test2, '\n');

  const test3 = testNavigation();
  console.log('Test 3 result:', test3, '\n');

  const test4 = testSessionExpiration();
  console.log('Test 4 result:', test4, '\n');

  console.log('✅ All tests completed!');

  return {
    authContext: test1,
    logout: test2,
    navigation: test3,
    sessionExpiration: test4
  };
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testLogoutFunctionality = {
    runAllTests,
    testAuthContext,
    testLogout,
    testNavigation,
    testSessionExpiration
  };

  console.log('🧪 Logout test functions available at window.testLogoutFunctionality');
  console.log('Run: window.testLogoutFunctionality.runAllTests()');
}

module.exports = {
  runAllTests,
  testAuthContext,
  testLogout,
  testNavigation,
  testSessionExpiration
};