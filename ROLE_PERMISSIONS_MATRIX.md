# Role-Based Permissions Matrix

## Complete Feature Access Matrix

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

## Detailed Role Descriptions

### 1. **User** (Basic Role)
- **Purpose**: Standard platform user
- **Permissions**:
  - ✅ View all courses
  - ✅ Take courses and track progress
  - ✅ Update own profile
  - ✅ View own certificates and achievements
  - ❌ No administrative access

### 2. **Content Manager**
- **Purpose**: Manages course content and instructors
- **Permissions**:
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
- **Purpose**: Manages users and community interactions
- **Permissions**:
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
- **Purpose**: Provides user support and basic community management
- **Permissions**:
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
- **Purpose**: Full system administration
- **Permissions**:
  - ✅ All permissions from other roles
  - ✅ View audit logs
  - ✅ Manage system settings
  - ✅ Create and manage all user types
  - ✅ Manage super admins
  - ✅ System backup and maintenance
  - ✅ Security configuration
  - ✅ Database management

## Permission Implementation Details

### Database Permissions Field
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
  "profile:edit"
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
  "instructors:manage",
  "media:upload",
  "content:review"
]
```

#### Community Manager Permissions:
```json
[
  "courses:view",
  "courses:take",
  "analytics:view",
  "users:manage",
  "community:moderate",
  "support:handle",
  "users:ban",
  "users:view_activity"
]
```

#### User Support Permissions:
```json
[
  "courses:view",
  "courses:take",
  "analytics:view",
  "support:handle",
  "community:moderate_basic",
  "users:view_profile"
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
  "instructors:manage",
  "users:manage",
  "audit:view",
  "system:configure",
  "admins:create",
  "super_admins:manage",
  "system:backup",
  "security:configure",
  "database:manage"
]
```

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

## Frontend Component Access

### Navigation Menu Items
- **Courses** - All roles
- **Analytics** - Content Manager, Community Manager, User Support, Super Admin
- **Content Management** - Content Manager, Super Admin
- **User Management** - Community Manager, Super Admin
- **System Settings** - Super Admin only
- **Audit Logs** - Super Admin only

### Dashboard Widgets
- **Course Progress** - All roles
- **Content Analytics** - Content Manager, Super Admin
- **User Analytics** - Community Manager, Super Admin
- **Support Tickets** - User Support, Super Admin
- **System Health** - Super Admin only

## Security Considerations

1. **Role Hierarchy**: Super Admin > Content Manager/Community Manager > User Support > User
2. **Permission Inheritance**: Higher roles inherit permissions from lower roles
3. **Audit Logging**: All administrative actions are logged
4. **Session Management**: Role changes require re-authentication
5. **API Rate Limiting**: Different limits for different roles

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