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

async function fixPermissions() {
  console.log('🔧 Fixing Permission Inconsistencies...\n');
  
  let pool;
  
  try {
    // Connect to database
    pool = mysql.createPool(dbConfig);
    console.log('✅ Database connection established\n');

    // Get all users
    const [users] = await pool.execute(`
      SELECT id, email, full_name, role, permissions 
      FROM users 
      ORDER BY role, id
    `);

    console.log(`📊 Found ${users.length} users to process\n`);

    let fixedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      console.log(`🔍 Processing: ${user.full_name} (${user.email})`);
      console.log(`   Current role: ${user.role}`);
      console.log(`   Current permissions: ${user.permissions || 'null'}`);

      // Get expected permissions for the user's role
      const expectedPermissions = ROLE_PERMISSIONS[user.role] || [];
      
      if (expectedPermissions.length === 0) {
        console.log(`   ⚠️  No permissions defined for role: ${user.role}`);
        skippedCount++;
        continue;
      }

      // Parse current permissions
      let currentPermissions = [];
      if (user.permissions) {
        try {
          if (typeof user.permissions === 'string') {
            currentPermissions = JSON.parse(user.permissions);
          } else if (Array.isArray(user.permissions)) {
            currentPermissions = user.permissions;
          }
        } catch (error) {
          console.log(`   ⚠️  Error parsing permissions: ${error.message}`);
          currentPermissions = [];
        }
      }

      // Check if permissions need to be fixed
      const needsFix = !Array.isArray(currentPermissions) || 
                      currentPermissions.length === 0 ||
                      !currentPermissions.every(perm => expectedPermissions.includes(perm)) ||
                      currentPermissions.some(perm => perm === 'read_courses' || perm === 'watch_videos');

      if (needsFix) {
        console.log(`   🔧 Fixing permissions...`);
        console.log(`   Expected: ${expectedPermissions.join(', ')}`);
        
        // Update user permissions
        await pool.execute(
          'UPDATE users SET permissions = ? WHERE id = ?',
          [JSON.stringify(expectedPermissions), user.id]
        );
        
        console.log(`   ✅ Permissions updated successfully`);
        fixedCount++;
      } else {
        console.log(`   ✅ Permissions are already correct`);
        skippedCount++;
      }
      
      console.log('');
    }

    // Summary
    console.log('📋 Fix Summary:');
    console.log('================');
    console.log(`   Total users processed: ${users.length}`);
    console.log(`   Users fixed: ${fixedCount}`);
    console.log(`   Users skipped (already correct): ${skippedCount}`);
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
          currentPermissions = [];
        }
      }

      if (currentPermissions.length === 0 && expectedPermissions.length > 0) {
        console.log(`   ❌ ${user.email}: Still has no permissions`);
        verificationIssues++;
      } else if (!currentPermissions.every(perm => expectedPermissions.includes(perm))) {
        console.log(`   ❌ ${user.email}: Has unexpected permissions`);
        verificationIssues++;
      } else {
        console.log(`   ✅ ${user.email}: Permissions verified`);
      }
    });

    if (verificationIssues === 0) {
      console.log('\n🎉 All permission inconsistencies have been fixed successfully!');
    } else {
      console.log(`\n⚠️  ${verificationIssues} verification issues remain`);
    }

  } catch (error) {
    console.error('❌ Error fixing permissions:', error);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Run the fix
fixPermissions(); 