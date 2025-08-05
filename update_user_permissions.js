/**
 * Script to update existing users with correct permissions based on their roles
 * This script ensures all users have the appropriate permissions for their role
 */

const mysql = require('mysql2/promise');
const { getPermissionsForRole, getAllRoles } = require('./backend/lib/rolePermissions');

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

async function updateUserPermissions() {
  let pool;

  try {
    console.log('🔧 Connecting to database...');
    pool = mysql.createPool(dbConfig);

    // Test connection
    await pool.execute('SELECT 1');
    console.log('✅ Database connection successful');

    // Get all users
    console.log('📋 Fetching all users...');
    const [users] = await pool.execute(
      'SELECT id, email, full_name, role, permissions FROM users'
    );

    console.log(`📊 Found ${users.length} users to update`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        console.log(`\n👤 Processing user: ${user.email} (${user.role})`);

        // Get permissions for the user's role
        const rolePermissions = getPermissionsForRole(user.role);

        // Parse existing permissions
        let existingPermissions = [];
        if (user.permissions) {
          try {
            if (typeof user.permissions === 'string') {
              existingPermissions = JSON.parse(user.permissions);
            } else if (Array.isArray(user.permissions)) {
              existingPermissions = user.permissions;
            }
          } catch (error) {
            console.log(`⚠️  Could not parse existing permissions for ${user.email}`);
            existingPermissions = [];
          }
        }

        // Combine role permissions with existing permissions
        const allPermissions = new Set([...rolePermissions, ...existingPermissions]);
        const finalPermissions = Array.from(allPermissions);

        // Check if permissions need to be updated
        const existingPermissionsSet = new Set(existingPermissions);
        const needsUpdate = rolePermissions.some(permission => !existingPermissionsSet.has(permission));

        if (needsUpdate) {
          console.log(`📝 Updating permissions for ${user.email}`);
          console.log(`   Role: ${user.role}`);
          console.log(`   Role permissions: ${rolePermissions.length}`);
          console.log(`   Final permissions: ${finalPermissions.length}`);

          // Update user permissions
          await pool.execute(
            'UPDATE users SET permissions = ? WHERE id = ?',
            [JSON.stringify(finalPermissions), user.id]
          );

          updatedCount++;
          console.log(`✅ Updated permissions for ${user.email}`);
        } else {
          console.log(`⏭️  Skipped ${user.email} (permissions already up to date)`);
          skippedCount++;
        }

      } catch (error) {
        console.error(`❌ Error updating user ${user.email}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 Update Summary:');
    console.log(`✅ Updated: ${updatedCount} users`);
    console.log(`⏭️  Skipped: ${skippedCount} users`);
    console.log(`❌ Errors: ${errorCount} users`);

    // Show role distribution
    console.log('\n👥 Role Distribution:');
    const roleCounts = {};
    users.forEach(user => {
      roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
    });

    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`   ${role}: ${count} users`);
    });

    // Show permission counts by role
    console.log('\n🔐 Permission Counts by Role:');
    getAllRoles().forEach(role => {
      const permissions = getPermissionsForRole(role);
      console.log(`   ${role}: ${permissions.length} permissions`);
    });

  } catch (error) {
    console.error('❌ Database error:', error.message);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the script
if (require.main === module) {
  updateUserPermissions()
    .then(() => {
      console.log('\n🎉 User permissions update completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Script failed:', error.message);
      process.exit(1);
    });
}

module.exports = { updateUserPermissions };