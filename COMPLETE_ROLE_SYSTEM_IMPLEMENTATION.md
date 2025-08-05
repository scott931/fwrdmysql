# Complete Role System Implementation

## Overview

This document outlines the complete implementation of a role-based access control (RBAC) system for the Forward Africa Learning Platform. The system defines 5 distinct roles with specific permissions and responsibilities.

## Role Definitions

### 1. **User** (Basic Role)
**Purpose**: Standard platform user
**Permissions**:
- ✅ View all courses
- ✅ Take courses and track progress
- ✅ Update own profile
- ✅ View own certificates and achievements
- ❌ No administrative access

### 2. **Content Manager**
**Purpose**: Manages course content and instructors
**Permissions**:
- ✅ View all courses
- ✅ Take courses
- ✅ View analytics (content-focused)
- ✅ Create and edit courses
- ✅ Delete courses
- ✅ Manage instructors (add, edit, remove)
- ✅ Upload and manage course media
- ✅ Review and approve content
- ❌ Cannot manage users
- ❌ Cannot access system settings

### 3. **Community Manager**
**Purpose**: Manages users and community interactions
**Permissions**:
- ✅ View all courses
- ✅ Take courses
- ✅ View analytics (user-focused)
- ✅ Manage users (suspend, activate, change roles)
- ✅ Moderate community discussions
- ✅ Handle user support tickets
- ✅ Ban/unban users
- ✅ View user activity logs
- ❌ Cannot edit course content
- ❌ Cannot manage instructors

### 4. **User Support**
**Purpose**: Provides user support and basic community management
**Permissions**:
- ✅ View all courses
- ✅ Take courses
- ✅ View analytics (support-focused)
- ✅ Handle user support tickets
- ✅ Respond to user inquiries
- ✅ Basic community moderation
- ✅ View user profiles (read-only)
- ❌ Cannot manage users
- ❌ Cannot edit content

### 5. **Super Admin**
**Purpose**: Full system administration
**Permissions**:
- ✅ All permissions from other roles
- ✅ View audit logs
- ✅ Manage system settings
- ✅ Create and manage all user types
- ✅ Manage super admins
- ✅ System backup and maintenance
- ✅ Security configuration
- ✅ Database management

## Implementation Files

### 1. Database Schema (`database_schema.sql`)
```sql
role ENUM('user', 'content_manager', 'community_manager', 'user_support', 'super_admin') DEFAULT 'user'
```

### 2. Role Permissions Configuration (`backend/lib/rolePermissions.js`)
- Defines permissions for each role
- Provides utility functions for permission checking
- Includes role hierarchy management

### 3. Enhanced Permissions System (`backend/lib/permissions.js`)
- Integrates with role-based permissions
- Handles permission parsing and validation
- Provides user-specific permission functions

### 4. Migration Scripts
- `fix_admin_role_migration.sql`: Updates database schema
- `update_user_permissions.js`: Updates existing users with correct permissions

## Feature Access Matrix

| Feature | User | Content Manager | Community Manager | User Support | Super Admin |
|---------|------|----------------|------------------|--------------|-------------|
| **View Courses** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Take Courses** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **View Analytics** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Edit Courses** | ❌ | ✅ | ❌ | ❌ | ✅ |
| **Delete Courses** | ❌ | ✅ | ❌ | ❌ | ✅ |
| **Manage Instructors** | ❌ | ✅ | ❌ | ❌ | ✅ |
| **Manage Users** | ❌ | ❌ | ✅ | ❌ | ✅ |
| **View Audit Logs** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Manage Settings** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Create Admin Users** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Manage Super Admins** | ❌ | ❌ | ❌ | ❌ | ✅ |

## API Endpoint Access Control

### Course Management
- **GET /api/courses** - All roles
- **POST /api/courses** - Content Manager, Super Admin
- **PUT /api/courses/:id** - Content Manager, Super Admin
- **DELETE /api/courses/:id** - Content Manager, Super Admin

### User Management
- **GET /api/users** - Community Manager, Super Admin
- **PUT /api/users/:id** - Community Manager, Super Admin
- **POST /api/users** - Super Admin only

### Analytics
- **GET /api/analytics/platform/admin** - Super Admin only
- **GET /api/analytics/content** - Content Manager, Super Admin
- **GET /api/analytics/users** - Community Manager, Super Admin
- **GET /api/analytics/support** - User Support, Super Admin

### System Administration
- **GET /api/system/config** - Super Admin only
- **PUT /api/system/config** - Super Admin only
- **GET /api/audit-logs** - Super Admin only
- **POST /api/system/backup** - Super Admin only

## Permission Implementation

### Database Structure
Each user has a `permissions` JSON field containing an array of specific permissions:

```json
{
  "permissions": [
    "courses:view",
    "courses:take",
    "analytics:view",
    "content:edit",
    "content:delete",
    "instructors:manage",
    "users:manage",
    "audit:view",
    "system:configure",
    "admins:create",
    "super_admins:manage"
  ]
}
```

### Role-Based Permission Sets

#### User Permissions:
```json
[
  "courses:view",
  "courses:take",
  "profile:edit",
  "certificates:view",
  "achievements:view",
  "progress:view"
]
```

#### Content Manager Permissions:
```json
[
  "courses:view",
  "courses:take",
  "analytics:view",
  "content:edit",
  "content:delete",
  "content:create",
  "instructors:manage",
  "media:upload",
  "content:review",
  "content:publish",
  "content:workflow",
  "profile:edit",
  "certificates:view",
  "achievements:view",
  "progress:view"
]
```

#### Community Manager Permissions:
```json
[
  "courses:view",
  "courses:take",
  "analytics:view",
  "users:manage",
  "users:view",
  "users:suspend",
  "users:activate",
  "users:ban",
  "users:unban",
  "community:moderate",
  "support:handle",
  "support:view_tickets",
  "support:respond_tickets",
  "users:view_activity",
  "profile:edit",
  "certificates:view",
  "achievements:view",
  "progress:view"
]
```

#### User Support Permissions:
```json
[
  "courses:view",
  "courses:take",
  "analytics:view",
  "support:handle",
  "support:view_tickets",
  "support:respond_tickets",
  "support:close_tickets",
  "community:moderate_basic",
  "users:view_profile",
  "users:view_activity",
  "profile:edit",
  "certificates:view",
  "achievements:view",
  "progress:view"
]
```

#### Super Admin Permissions:
```json
[
  "courses:view",
  "courses:take",
  "analytics:view",
  "content:edit",
  "content:delete",
  "content:create",
  "instructors:manage",
  "media:upload",
  "content:review",
  "content:publish",
  "content:workflow",
  "users:manage",
  "users:view",
  "users:suspend",
  "users:activate",
  "users:ban",
  "users:unban",
  "community:moderate",
  "support:handle",
  "support:view_tickets",
  "support:respond_tickets",
  "support:close_tickets",
  "users:view_activity",
  "audit:view",
  "audit:export",
  "system:configure",
  "system:backup",
  "system:maintenance",
  "admins:create",
  "super_admins:manage",
  "security:configure",
  "database:manage",
  "profile:edit",
  "certificates:view",
  "achievements:view",
  "progress:view"
]
```

## Role Hierarchy

```
Super Admin
├── Content Manager
├── Community Manager
├── User Support
└── User
```

### Management Permissions
- **Super Admin**: Can manage all roles
- **Community Manager**: Can manage User and User Support
- **Content Manager**: Can manage User only
- **User Support**: Can manage User only
- **User**: Cannot manage any roles

## Security Considerations

1. **Role Hierarchy**: Super Admin > Content Manager/Community Manager > User Support > User
2. **Permission Inheritance**: Higher roles inherit permissions from lower roles
3. **Audit Logging**: All administrative actions are logged
4. **Session Management**: Role changes require re-authentication
5. **API Rate Limiting**: Different limits for different roles

## Deployment Steps

### 1. Database Migration
```bash
# Run the role migration script
mysql -u root -p forward_africa_db < fix_admin_role_migration.sql
```

### 2. Update User Permissions
```bash
# Run the permissions update script
node update_user_permissions.js
```

### 3. Verify Implementation
- Test each role with appropriate permissions
- Verify API endpoint access control
- Check frontend component visibility
- Validate audit logging

## Testing Scenarios

### Content Manager Testing
- ✅ Can create and edit courses
- ✅ Can manage instructors
- ✅ Cannot access user management
- ✅ Cannot view audit logs

### Community Manager Testing
- ✅ Can manage users
- ✅ Can moderate community
- ✅ Cannot edit course content
- ✅ Cannot access system settings

### User Support Testing
- ✅ Can handle support tickets
- ✅ Can view user profiles
- ✅ Cannot manage users
- ✅ Cannot edit content

### Super Admin Testing
- ✅ Can access all features
- ✅ Can manage all user types
- ✅ Can configure system settings
- ✅ Can view audit logs

## Monitoring and Maintenance

### Regular Tasks
1. **Permission Audits**: Monthly review of user permissions
2. **Role Assignment**: Verify new users have correct roles
3. **Security Reviews**: Quarterly security assessment
4. **Performance Monitoring**: Track permission check performance

### Troubleshooting
1. **Permission Denied Errors**: Check user role and permissions
2. **API Access Issues**: Verify endpoint authorization
3. **Frontend Display Problems**: Check component permission checks
4. **Database Inconsistencies**: Run permission update script

## Future Enhancements

1. **Dynamic Permissions**: Allow custom permission assignments
2. **Role Templates**: Predefined permission sets for common roles
3. **Permission Groups**: Group related permissions for easier management
4. **Time-based Permissions**: Temporary permission grants
5. **Permission Analytics**: Track permission usage and effectiveness

## Conclusion

This role system provides a comprehensive, secure, and scalable approach to access control for the Forward Africa Learning Platform. Each role has clearly defined responsibilities and permissions, ensuring proper separation of concerns while maintaining system security.