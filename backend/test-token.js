const jwt = require('jsonwebtoken');

// Use the same JWT_SECRET as in the server
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Test user data
const testUser = {
  id: 1,
  email: 'admin@forwardafrica.com',
  role: 'super_admin'
};

console.log('🔍 Testing JWT token generation and verification...');

try {
  // Generate a token
  const token = jwt.sign(testUser, JWT_SECRET, { expiresIn: '24h' });
  console.log('✅ Token generated successfully');
  console.log('🔑 Token:', token.substring(0, 50) + '...');

  // Verify the token
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log('✅ Token verified successfully');
  console.log('👤 Decoded user:', decoded);

  // Test with the token from the test script
  const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBmb3J3YXJkYWZyaWNhLmNvbSIsInJvbGUiOiJzdXBlcl9hZG1pbiIsImlhdCI6MTczMjU2Mjc5OSwiZXhwIjoxNzMyNjQ5MTk5fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

  try {
    const testDecoded = jwt.verify(testToken, JWT_SECRET);
    console.log('✅ Test token verified successfully');
    console.log('👤 Test decoded user:', testDecoded);
  } catch (error) {
    console.log('❌ Test token verification failed:', error.message);
  }

} catch (error) {
  console.error('❌ JWT test failed:', error.message);
}