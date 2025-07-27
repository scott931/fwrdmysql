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

// Role permissions mapping
const ROLE_PERMISSIONS = {
  super_admin: [
    'system:full_access',
    'system:configuration',
    'system:maintenance',
    'system:backup',
    'users:view',
    'users:create',
    'users:edit',
    'users:delete',
    'users:assign_roles',
    'users:suspend',
    'users:activate',
    'content:upload',
    'content:edit',
    'content:delete',
    'content:publish',
    'content:review',
    'content:workflow',
    'courses:view',
    'courses:create',
    'courses:edit',
    'courses:delete',
    'courses:publish',
    'courses:assign_instructors',
    'instructors:view',
    'instructors:create',
    'instructors:edit',
    'instructors:delete',
    'instructors:approve',
    'community:moderate',
    'community:ban_users',
    'community:delete_posts',
    'community:pin_posts',
    'community:analytics',
    'support:view_tickets',
    'support:respond_tickets',
    'support:escalate_tickets',
    'support:close_tickets',
    'analytics:view',
    'analytics:export',
    'financial:view',
    'financial:export',
    'financial:refund',
    'communication:send_announcements',
    'communication:send_emails',
    'communication:send_notifications',
    'audit:view_logs',
    'audit:export_logs',
    'security:view_sessions',
    'security:terminate_sessions'
  ],
  content_manager: [
    'content:upload',
    'content:edit',
    'content:delete',
    'content:publish',
    'content:review',
    'content:workflow',
    'courses:view',
    'courses:create',
    'courses:edit',
    'courses:delete',
    'courses:publish',
    'courses:assign_instructors',
    'instructors:view',
    'instructors:create',
    'instructors:edit',
    'instructors:approve',
    'users:view',
    'users:edit',
    'analytics:view',
    'communication:send_announcements',
    'communication:send_notifications'
  ],
  community_manager: [
    'community:moderate',
    'community:ban_users',
    'community:delete_posts',
    'community:pin_posts',
    'community:analytics',
    'support:view_tickets',
    'support:respond_tickets',
    'support:close_tickets',
    'users:view',
    'users:suspend',
    'users:activate',
    'communication:send_announcements',
    'communication:send_notifications',
    'analytics:view'
  ],
  user_support: [
    'support:view_tickets',
    'support:respond_tickets',
    'support:escalate_tickets',
    'support:close_tickets',
    'users:view',
    'users:edit',
    'communication:send_notifications',
    'analytics:view'
  ],
  user: [
    'courses:view'
  ]
};

async function fixPermissionsV2() {
  console.log('🔧 Fixing Permission Inconsistencies (Version 2)...\n');

  let pool;

  try {
    // Connect to database
    pool = mysql.createPool(dbConfig);
    console.log('✅ Database connection established\n');

    // First, let's check the current state
    console.log('🔍 Checking current database state...');
    const [users] = await pool.execute(`
      SELECT id, email, full_name, role, permissions
      FROM users
      ORDER BY role, id
    `);

    console.log(`📊 Found ${users.length} users\n`);

    // Show current state
    users.forEach(user => {
      console.log(`   ${user.email}:`);
      console.log(`      Role: ${user.role}`);
      console.log(`      Permissions: ${user.permissions || 'null'}`);
      console.log('');
    });

    // Fix permissions one by one with better error handling
    let fixedCount = 0;
    let errorCount = 0;

    for (const user of users) {
      console.log(`🔧 Processing: ${user.email}`);

      try {
        const expectedPermissions = ROLE_PERMISSIONS[user.role] || [];

        if (expectedPermissions.length === 0) {
          console.log(`   ⚠️  No permissions defined for role: ${user.role}`);
          continue;
        }

        // Convert permissions to JSON string
        const permissionsJson = JSON.stringify(expectedPermissions);

        console.log(`   Expected permissions: ${permissionsJson}`);

        // Update the user
        const [result] = await pool.execute(
          'UPDATE users SET permissions = ? WHERE id = ?',
          [permissionsJson, user.id]
        );

        if (result.affectedRows > 0) {
          console.log(`   ✅ Updated successfully (${result.affectedRows} rows affected)`);
          fixedCount++;
        } else {
          console.log(`   ⚠️  No rows were updated`);
          errorCount++;
        }

      } catch (error) {
        console.log(`   ❌ Error updating ${user.email}: ${error.message}`);
        errorCount++;
      }

      console.log('');
    }

    // Summary
    console.log('📋 Fix Summary:');
    console.log('================');
    console.log(`   Total users processed: ${users.length}`);
    console.log(`   Users fixed: ${fixedCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log('');

    // Verify the fixes
    console.log('🔍 Verifying fixes...');
    const [updatedUsers] = await pool.execute(`
      SELECT id, email, full_name, role, permissions
      FROM users
      ORDER BY role, id
    `);

    let verificationIssues = 0;
    updatedUsers.forEach(user => {
      const expectedPermissions = ROLE_PERMISSIONS[user.role] || [];
      let currentPermissions = [];

      if (user.permissions) {
        try {
          currentPermissions = JSON.parse(user.permissions);
        } catch (error) {
          console.log(`   ❌ ${user.email}: Error parsing permissions - ${error.message}`);
          verificationIssues++;
          return;
        }
      }

      if (currentPermissions.length === 0 && expectedPermissions.length > 0) {
        console.log(`   ❌ ${user.email}: Still has no permissions`);
        verificationIssues++;
      } else if (!currentPermissions.every(perm => expectedPermissions.includes(perm))) {
        console.log(`   ❌ ${user.email}: Has unexpected permissions`);
        console.log(`      Expected: ${expectedPermissions.join(', ')}`);
        console.log(`      Actual: ${currentPermissions.join(', ')}`);
        verificationIssues++;
      } else {
        console.log(`   ✅ ${user.email}: Permissions verified (${currentPermissions.length} permissions)`);
      }
    });

    if (verificationIssues === 0) {
      console.log('\n🎉 All permission inconsistencies have been fixed successfully!');
    } else {
      console.log(`\n⚠️  ${verificationIssues} verification issues remain`);
    }

    // Show final state
    console.log('\n📊 Final Database State:');
    console.log('========================');
    updatedUsers.forEach(user => {
      console.log(`   ${user.email} (${user.role}):`);
      console.log(`      Permissions: ${user.permissions || 'null'}`);
    });

  } catch (error) {
    console.error('❌ Error fixing permissions:', error);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Run the fix
fixPermissionsV2();