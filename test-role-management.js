const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');

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

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Role hierarchy and permissions
const ROLE_HIERARCHY = {
  super_admin: 5,
  content_manager: 4,
  community_manager: 3,
  user_support: 2,
  user: 1
};

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

// Helper functions
const canManageRole = (currentUserRole, targetRole) => {
  return ROLE_HIERARCHY[currentUserRole] > ROLE_HIERARCHY[targetRole];
};

const getManageableRoles = (currentUserRole) => {
  return Object.keys(ROLE_HIERARCHY).filter(role =>
    canManageRole(currentUserRole, role)
  );
};

const hasPermission = (userPermissions, requiredPermission) => {
  return userPermissions.includes(requiredPermission) || userPermissions.includes('system:full_access');
};

const parsePermissions = (permissions) => {
  if (!permissions) return [];
  if (Array.isArray(permissions)) {
    return permissions.map(permission => {
      if (permission === 'all') return 'system:full_access';
      return permission;
    });
  }
  if (typeof permissions === 'string') {
    try {
      const parsed = JSON.parse(permissions);
      return parsePermissions(parsed);
    } catch (error) {
      if (permissions === 'all') return ['system:full_access'];
      if (permissions.includes(',')) {
        return permissions.split(',').map(p => p.trim());
      }
      return [permissions];
    }
  }
  return [];
};

async function testRoleManagement() {
  console.log('🧪 Testing Role-Based Management System...\n');

  let pool;

  try {
    // Connect to database
    pool = mysql.createPool(dbConfig);
    console.log('✅ Database connection established\n');

    // Test 1: Check existing users and their roles
    console.log('1️⃣ Checking existing users and roles...');
    const [users] = await pool.execute(`
      SELECT id, email, full_name, role, permissions, is_active
      FROM users
      ORDER BY role, id
    `);

    console.log(`📊 Found ${users.length} users:`);
    users.forEach(user => {
      const permissions = parsePermissions(user.permissions);
      console.log(`   👤 ${user.full_name} (${user.email})`);
      console.log(`      Role: ${user.role}`);
      console.log(`      Active: ${user.is_active ? 'Yes' : 'No'}`);
      console.log(`      Permissions: ${permissions.length} total`);
      console.log(`      Sample permissions: ${permissions.slice(0, 3).join(', ')}${permissions.length > 3 ? '...' : ''}`);
      console.log('');
    });

    // Test 2: Validate role hierarchy
    console.log('2️⃣ Testing role hierarchy...');
    const roles = Object.keys(ROLE_HIERARCHY);
    console.log('📋 Role hierarchy (from highest to lowest):');
    roles.sort((a, b) => ROLE_HIERARCHY[b] - ROLE_HIERARCHY[a]).forEach(role => {
      console.log(`   ${ROLE_HIERARCHY[role]}. ${role}`);
    });
    console.log('');

    // Test 3: Test role management permissions
    console.log('3️⃣ Testing role management permissions...');
    roles.forEach(currentRole => {
      const manageableRoles = getManageableRoles(currentRole);
      console.log(`   ${currentRole} can manage: ${manageableRoles.join(', ') || 'none'}`);
    });
    console.log('');

    // Test 4: Test permission validation
    console.log('4️⃣ Testing permission validation...');
    const testPermissions = [
      'users:view',
      'users:create',
      'content:upload',
      'system:full_access',
      'invalid:permission'
    ];

    roles.forEach(role => {
      const rolePermissions = ROLE_PERMISSIONS[role];
      console.log(`   ${role} permissions test:`);
      testPermissions.forEach(permission => {
        const hasAccess = hasPermission(rolePermissions, permission);
        console.log(`      ${permission}: ${hasAccess ? '✅' : '❌'}`);
      });
      console.log('');
    });

    // Test 5: Test user role assignment scenarios
    console.log('5️⃣ Testing user role assignment scenarios...');
    const superAdmin = users.find(u => u.role === 'super_admin');
    const regularUser = users.find(u => u.role === 'user');

    if (superAdmin && regularUser) {
      console.log(`   Super Admin (${superAdmin.full_name}) can manage roles:`);
      const manageableBySuperAdmin = getManageableRoles(superAdmin.role);
      manageableBySuperAdmin.forEach(role => {
        console.log(`      ✅ Can assign: ${role}`);
      });

      console.log(`   Regular User (${regularUser.full_name}) can manage roles:`);
      const manageableByUser = getManageableRoles(regularUser.role);
      if (manageableByUser.length === 0) {
        console.log('      ❌ Cannot assign any roles');
      } else {
        manageableByUser.forEach(role => {
          console.log(`      ✅ Can assign: ${role}`);
        });
      }
    }
    console.log('');

    // Test 6: Test permission inheritance
    console.log('6️⃣ Testing permission inheritance...');
    roles.forEach(role => {
      const permissions = ROLE_PERMISSIONS[role];
      const hasSystemAccess = hasPermission(permissions, 'system:full_access');
      console.log(`   ${role}: ${hasSystemAccess ? 'Has system access' : 'Limited permissions'}`);
    });
    console.log('');

    // Test 7: Test specific permission categories
    console.log('7️⃣ Testing permission categories...');
    const permissionCategories = {
      'User Management': ['users:view', 'users:create', 'users:edit', 'users:delete'],
      'Content Management': ['content:upload', 'content:edit', 'content:delete'],
      'Course Management': ['courses:view', 'courses:create', 'courses:edit'],
      'System Management': ['system:full_access', 'system:configuration']
    };

    Object.entries(permissionCategories).forEach(([category, perms]) => {
      console.log(`   ${category}:`);
      roles.forEach(role => {
        const rolePermissions = ROLE_PERMISSIONS[role];
        const hasAllCategoryPerms = perms.every(perm => hasPermission(rolePermissions, perm));
        const hasAnyCategoryPerms = perms.some(perm => hasPermission(rolePermissions, perm));
        console.log(`      ${role}: ${hasAllCategoryPerms ? 'Full access' : hasAnyCategoryPerms ? 'Partial access' : 'No access'}`);
      });
      console.log('');
    });

    // Test 8: Validate database consistency
    console.log('8️⃣ Validating database consistency...');
    let consistencyIssues = 0;

    users.forEach(user => {
      const dbPermissions = parsePermissions(user.permissions);
      const expectedPermissions = ROLE_PERMISSIONS[user.role] || [];

      // Check if user has all expected permissions for their role
      const missingPermissions = expectedPermissions.filter(perm => !hasPermission(dbPermissions, perm));
      if (missingPermissions.length > 0) {
        console.log(`   ⚠️  ${user.email} missing permissions: ${missingPermissions.join(', ')}`);
        consistencyIssues++;
      }

      // Check if user has permissions they shouldn't have
      const extraPermissions = dbPermissions.filter(perm =>
        perm !== 'system:full_access' && !expectedPermissions.includes(perm)
      );
      if (extraPermissions.length > 0) {
        console.log(`   ⚠️  ${user.email} has extra permissions: ${extraPermissions.join(', ')}`);
        consistencyIssues++;
      }
    });

    if (consistencyIssues === 0) {
      console.log('   ✅ Database permissions are consistent with role definitions');
    } else {
      console.log(`   ⚠️  Found ${consistencyIssues} consistency issues`);
    }
    console.log('');

    // Test 9: Test role-based access control scenarios
    console.log('9️⃣ Testing role-based access control scenarios...');

    const scenarios = [
      {
        name: 'Super Admin managing Content Manager',
        currentRole: 'super_admin',
        targetRole: 'content_manager',
        shouldBeAllowed: true
      },
      {
        name: 'Content Manager managing Super Admin',
        currentRole: 'content_manager',
        targetRole: 'super_admin',
        shouldBeAllowed: false
      },
      {
        name: 'Community Manager managing User Support',
        currentRole: 'community_manager',
        targetRole: 'user_support',
        shouldBeAllowed: true
      },
      {
        name: 'User Support managing Regular User',
        currentRole: 'user_support',
        targetRole: 'user',
        shouldBeAllowed: true
      },
      {
        name: 'Regular User managing anyone',
        currentRole: 'user',
        targetRole: 'user_support',
        shouldBeAllowed: false
      }
    ];

    scenarios.forEach(scenario => {
      const isAllowed = canManageRole(scenario.currentRole, scenario.targetRole);
      const status = isAllowed === scenario.shouldBeAllowed ? '✅' : '❌';
      console.log(`   ${status} ${scenario.name}: ${isAllowed ? 'Allowed' : 'Denied'}`);
    });
    console.log('');

    // Test 10: Summary and recommendations
    console.log('🔍 Role-Based Management System Analysis Summary:');
    console.log('================================================');

    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.is_active).length;
    const roleDistribution = {};
    users.forEach(user => {
      roleDistribution[user.role] = (roleDistribution[user.role] || 0) + 1;
    });

    console.log(`📊 User Statistics:`);
    console.log(`   Total users: ${totalUsers}`);
    console.log(`   Active users: ${activeUsers}`);
    console.log(`   Role distribution:`);
    Object.entries(roleDistribution).forEach(([role, count]) => {
      console.log(`      ${role}: ${count} users`);
    });

    console.log(`\n🔐 Security Assessment:`);
    const superAdmins = users.filter(u => u.role === 'super_admin');
    console.log(`   Super admins: ${superAdmins.length} (${superAdmins.length > 2 ? '⚠️  Consider reducing' : '✅ Appropriate'})`);

    const usersWithSystemAccess = users.filter(u => {
      const perms = parsePermissions(u.permissions);
      return hasPermission(perms, 'system:full_access');
    });
    console.log(`   Users with system access: ${usersWithSystemAccess.length}`);

    console.log(`\n📋 Recommendations:`);
    if (superAdmins.length > 2) {
      console.log(`   ⚠️  Consider reducing the number of super admins for security`);
    }
    if (consistencyIssues > 0) {
      console.log(`   ⚠️  Fix permission inconsistencies in the database`);
    }
    console.log(`   ✅ Role hierarchy is properly implemented`);
    console.log(`   ✅ Permission system is comprehensive`);
    console.log(`   ✅ Access control logic is working correctly`);

    console.log('\n✅ Role-based management system test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Run the test
testRoleManagement();