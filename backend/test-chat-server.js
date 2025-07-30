const WebSocket = require('ws');

// Test configuration
const CHAT_SERVER_URL = 'ws://localhost:3001';
const TEST_GROUP_ID = 'group1';
const TEST_TOKEN = 'test-jwt-token'; // Replace with actual JWT token

console.log('🧪 Testing WebSocket Chat Server...\n');

// Test 1: Connection without authentication
console.log('Test 1: Connection without authentication');
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

// Test 4: Valid connection (if token is provided)
if (TEST_TOKEN !== 'test-jwt-token') {
  console.log('\nTest 4: Valid connection with proper token');
  const ws3 = new WebSocket(`${CHAT_SERVER_URL}/group/${TEST_GROUP_ID}?token=${TEST_TOKEN}`);

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
} else {
  console.log('\nTest 4: Skipped - No valid JWT token provided');
  console.log('To test with valid token, update TEST_TOKEN in this script');
}

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
  console.log('3. Update TEST_TOKEN with a valid JWT token');
  console.log('4. Run this test script again');

  process.exit(0);
}, 2000);