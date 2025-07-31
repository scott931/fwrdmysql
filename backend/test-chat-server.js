const WebSocket = require('ws');
const TestAuthHelper = require('../test_auth_helper');

// Test configuration
const CHAT_SERVER_URL = 'ws://localhost:3001';
const TEST_GROUP_ID = 'group1';

console.log('🧪 Testing WebSocket Chat Server with proper authentication...\n');

async function runTests() {
  const authHelper = new TestAuthHelper();
  
  try {
    // First, login to get a valid token
    console.log('🔐 Logging in to get valid token...');
    
    // Using test user credentials
    await authHelper.login('test@forwardafrica.com', 'test123');
    
    const token = authHelper.token;
    console.log(`✅ Got valid token for user: ${authHelper.getUser()?.email}`);

    // Test 1: Connection without authentication
    console.log('\nTest 1: Connection without authentication');
    const ws1 = new WebSocket(`${CHAT_SERVER_URL}/group/${TEST_GROUP_ID}`);

    ws1.on('open', () => {
      console.log('❌ Connection should have failed without token');
      ws1.close();
    });

    ws1.on('close', (code, reason) => {
      console.log(`✅ Connection properly closed with code: ${code}, reason: ${reason}`);
    });

    ws1.on('error', (error) => {
      console.log('✅ Connection properly rejected without authentication');
    });

    // Test 2: Connection with invalid token
    console.log('\nTest 2: Connection with invalid token');
    const ws2 = new WebSocket(`${CHAT_SERVER_URL}/group/${TEST_GROUP_ID}?token=invalid-token`);

    ws2.on('open', () => {
      console.log('❌ Connection should have failed with invalid token');
      ws2.close();
    });

    ws2.on('close', (code, reason) => {
      console.log(`✅ Connection properly closed with code: ${code}, reason: ${reason}`);
    });

    ws2.on('error', (error) => {
      console.log('✅ Connection properly rejected with invalid token');
    });

    // Test 3: Health check endpoint
    console.log('\nTest 3: Health check endpoint');
    const http = require('http');

    const healthCheck = () => {
      return new Promise((resolve, reject) => {
        const req = http.request({
          hostname: 'localhost',
          port: 3001,
          path: '/health',
          method: 'GET'
        }, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            try {
              const health = JSON.parse(data);
              console.log('✅ Health check response:', health);
              resolve(health);
            } catch (error) {
              console.log('❌ Invalid health check response');
              reject(error);
            }
          });
        });

        req.on('error', (error) => {
          console.log('❌ Health check failed:', error.message);
          reject(error);
        });

        req.end();
      });
    };

    // Test 4: Valid connection with proper token
    console.log('\nTest 4: Valid connection with proper token');
    const ws3 = new WebSocket(`${CHAT_SERVER_URL}/group/${TEST_GROUP_ID}?token=${token}`);

    ws3.on('open', () => {
      console.log('✅ WebSocket connected successfully');

      // Send a test message
      const testMessage = {
        content: 'Hello from test script!',
        messageType: 'text'
      };

      ws3.send(JSON.stringify(testMessage));
      console.log('📤 Test message sent');
    });

    ws3.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        console.log('📥 Received message:', message.type);

        if (message.type === 'connection_established') {
          console.log('✅ Connection established successfully');
        } else if (message.type === 'recent_messages') {
          console.log(`✅ Received ${message.messages.length} recent messages`);
        } else if (message.type === 'message') {
          console.log('✅ Message broadcast working');
          ws3.close();
        }
      } catch (error) {
        console.log('❌ Invalid message format:', error.message);
      }
    });

    ws3.on('close', (code, reason) => {
      console.log(`✅ Test connection closed: ${code} - ${reason}`);
    });

    ws3.on('error', (error) => {
      console.log('❌ WebSocket error:', error.message);
    });

    // Run health check
    setTimeout(async () => {
      try {
        await healthCheck();
      } catch (error) {
        console.log('Health check failed - server may not be running');
      }

      console.log('\n🧪 Chat server tests completed!');
      console.log('\nTo run the chat server:');
      console.log('1. cd backend');
      console.log('2. npm run chat');
      console.log('3. Make sure you have valid user credentials in the database');
      console.log('4. Run this test script again');

      // Logout
      await authHelper.logout();
      process.exit(0);
    }, 2000);

  } catch (error) {
    console.error('❌ Test setup failed:', error.message);
    
    if (error.message.includes('Login failed')) {
      console.log('\n💡 To fix this:');
      console.log('1. Make sure your server is running on localhost:3002');
      console.log('2. Create a user in your database');
      console.log('3. Update the login credentials in this test file');
      console.log('4. Or use the registration endpoint to create a test user first');
    }
    
    // Logout if we have any tokens
    await authHelper.logout();
    process.exit(1);
  }
}

runTests();