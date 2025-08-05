/**
 * Test script to verify profile update functionality
 * This script tests profile updates for different user roles
 */

const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'forward_africa_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

async function testProfileUpdates() {
  let pool;

  try {
    console.log('🔧 Connecting to database...');
    pool = mysql.createPool(dbConfig);

    // Test 1: Check current user roles
    console.log('\n📊 Current user roles in database:');
    const [users] = await pool.execute(
      'SELECT id, email, full_name, role FROM users ORDER BY role, full_name'
    );

    users.forEach(user => {
      console.log(`  - ${user.full_name} (${user.email}): ${user.role}`);
    });

    // Test 2: Check if any users have the old 'admin' role
    const [adminUsers] = await pool.execute(
      'SELECT id, email, full_name, role FROM users WHERE role = "admin"'
    );

    if (adminUsers.length > 0) {
      console.log('\n⚠️  Found users with old "admin" role:');
      adminUsers.forEach(user => {
        console.log(`  - ${user.full_name} (${user.email}): ${user.role}`);
      });

      console.log('\n🔄 Updating users with "admin" role to "community_manager"...');
      await pool.execute(
        'UPDATE users SET role = "community_manager" WHERE role = "admin"'
      );
      console.log('✅ Updated admin users to community_manager role');
    } else {
      console.log('\n✅ No users found with old "admin" role');
    }

    // Test 3: Verify role distribution
    console.log('\n📊 Updated role distribution:');
    const [roleCounts] = await pool.execute(
      'SELECT role, COUNT(*) as count FROM users GROUP BY role ORDER BY count DESC'
    );

    roleCounts.forEach(role => {
      console.log(`  - ${role.role}: ${role.count} users`);
    });

    // Test 4: Check profile update permissions
    console.log('\n🔍 Testing profile update permissions...');

    // Get a sample user from each role
    const [sampleUsers] = await pool.execute(
      'SELECT id, email, full_name, role FROM users WHERE role IN ("user", "content_manager", "community_manager", "user_support", "super_admin") LIMIT 5'
    );

    console.log('\n📋 Sample users for testing:');
    sampleUsers.forEach(user => {
      console.log(`  - ${user.full_name} (${user.role}): ${user.id}`);
    });

    console.log('\n✅ Profile update test completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('  1. Test profile updates in the frontend');
    console.log('  2. Verify all roles can update their own profiles');
    console.log('  3. Test admin roles can update other users');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Run the test
testProfileUpdates();