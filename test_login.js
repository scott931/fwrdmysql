// Test Login Functionality
// This script tests the backend login system

const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3002/api';

async function testLogin() {
  console.log('🔍 Testing Login Functionality...\n');

  // Test 1: Check if backend is running
  console.log('1. Testing backend health...');
  try {
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    if (healthResponse.ok) {
      console.log('✅ Backend is running');
    } else {
      console.log('❌ Backend health check failed');
      return;
    }
  } catch (error) {
    console.log('❌ Backend is not running. Please start it with: cd backend && npm start');
    return;
  }

  // Test 2: Test login with admin credentials
  console.log('\n2. Testing admin login...');
  try {
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@forwardafrica.com',
        password: 'admin123'
      })
    });

    if (loginResponse.ok) {
      const data = await loginResponse.json();
      console.log('✅ Admin login successful');
      console.log('   Token received:', data.token ? 'Yes' : 'No');
      console.log('   User data:', data.user ? 'Yes' : 'No');
    } else {
      const error = await loginResponse.json();
      console.log('❌ Admin login failed:', error.error);
    }
  } catch (error) {
    console.log('❌ Login request failed:', error.message);
  }

  // Test 3: Test login with regular user
  console.log('\n3. Testing user login...');
  try {
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'john.doe@example.com',
        password: 'user123'
      })
    });

    if (loginResponse.ok) {
      const data = await loginResponse.json();
      console.log('✅ User login successful');
      console.log('   Token received:', data.token ? 'Yes' : 'No');
      console.log('   User data:', data.user ? 'Yes' : 'No');
    } else {
      const error = await loginResponse.json();
      console.log('❌ User login failed:', error.error);
    }
  } catch (error) {
    console.log('❌ Login request failed:', error.message);
  }

  // Test 4: Test invalid credentials
  console.log('\n4. Testing invalid credentials...');
  try {
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'invalid@example.com',
        password: 'wrongpassword'
      })
    });

    if (!loginResponse.ok) {
      const error = await loginResponse.json();
      console.log('✅ Invalid credentials properly rejected:', error.error);
    } else {
      console.log('❌ Invalid credentials were accepted (security issue)');
    }
  } catch (error) {
    console.log('❌ Invalid credentials test failed:', error.message);
  }

  console.log('\n🎯 Login Test Complete!');
  console.log('\n📋 Next Steps:');
  console.log('1. If all tests pass, your login system is working');
  console.log('2. If tests fail, check:');
  console.log('   - Backend is running (cd backend && npm start)');
  console.log('   - Database is connected');
  console.log('   - .env file exists in backend directory');
  console.log('   - Password hashes are set (run fix_login_issue.sql)');
}

// Run the test
testLogin().catch(console.error);