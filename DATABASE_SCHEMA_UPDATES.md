# Forward Africa Database Schema Updates

## Overview
This document outlines the comprehensive updates needed for the Forward Africa Learning Platform database schema to align with the current project requirements and recent changes.

## Key Updates Required

### 1. Enhanced User Management

#### New User Roles
- Added `community_manager` role
- Added `user_support` role
- Updated role enum to include all new roles

#### New User Fields
- `is_active` (BOOLEAN) - Track user account status
- `last_login` (TIMESTAMP) - Track user login activity
- Enhanced `role` enum with new roles

### 2. Session Management

#### New Table: `user_sessions`
```sql
CREATE TABLE user_sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    token VARCHAR(500) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 3. Enhanced Course Management

#### New Course Fields
- `status` (ENUM) - 'draft', 'published', 'archived'
- Enhanced tracking for course lifecycle

#### New Lesson Fields
- `status` (ENUM) - 'draft', 'published', 'archived'
- Better lesson management

### 4. Enhanced Progress Tracking

#### User Progress Improvements
- Better progress percentage tracking
- Enhanced completed lessons tracking
- Improved XP earning system

### 5. Enhanced Certificate System

#### New Certificate Fields
- `status` (ENUM) - 'active', 'revoked'
- Better certificate verification system

### 6. Enhanced Achievement System

#### New Achievement Fields
- `status` (ENUM) - 'in_progress', 'completed'
- Better achievement progress tracking

### 7. Enhanced Notification System

#### New Notification Types
- Added 'info', 'success', 'warning', 'error' types
- Better notification categorization

### 8. Enhanced Community Features

#### Community Groups Improvements
- `current_members` (INT) - Track member count
- `status` (ENUM) - 'active', 'suspended', 'archived'
- Better group management

#### Group Members Improvements
- `status` (ENUM) - 'active', 'banned', 'left'
- Better member management

#### Group Messages Improvements
- `status` (ENUM) - 'active', 'deleted', 'flagged'
- Better message moderation

### 9. Enhanced Audit System

#### New Audit Fields
- `severity` (ENUM) - 'low', 'medium', 'high', 'critical'
- Better security tracking
- Enhanced audit log categorization

### 10. Performance Optimizations

#### New Indexes
- User session indexes
- Course status indexes
- Notification type indexes
- Audit severity indexes
- Community group status indexes

## Sample Data Updates

### New Sample Users
- Added `user_support` role user
- Enhanced user data with authentication hashes
- Better role distribution

### Enhanced Sample Data
- All sample data now includes status fields
- Better data consistency
- More realistic test scenarios

## Migration Script

### Step 1: Add New Tables
```sql
-- Add user_sessions table
CREATE TABLE user_sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    token VARCHAR(500) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Step 2: Add New Columns
```sql
-- Add new user columns
ALTER TABLE users
ADD COLUMN is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN last_login TIMESTAMP NULL;

-- Update role enum
ALTER TABLE users
MODIFY COLUMN role ENUM('user', 'content_manager', 'community_manager', 'user_support', 'super_admin') DEFAULT 'user';

-- Add status columns to courses
ALTER TABLE courses
ADD COLUMN status ENUM('draft', 'published', 'archived') DEFAULT 'draft';

-- Add status columns to lessons
ALTER TABLE lessons
ADD COLUMN status ENUM('draft', 'published', 'archived') DEFAULT 'draft';

-- Add status columns to certificates
ALTER TABLE certificates
ADD COLUMN status ENUM('active', 'revoked') DEFAULT 'active';

-- Add status columns to achievements
ALTER TABLE achievements
ADD COLUMN status ENUM('in_progress', 'completed') DEFAULT 'in_progress';

-- Update notification types
ALTER TABLE notifications
MODIFY COLUMN type ENUM('course', 'achievement', 'system', 'community', 'info', 'success', 'warning', 'error') NOT NULL;

-- Add community group enhancements
ALTER TABLE community_groups
ADD COLUMN current_members INT DEFAULT 0,
ADD COLUMN status ENUM('active', 'suspended', 'archived') DEFAULT 'active';

-- Add group member status
ALTER TABLE group_members
ADD COLUMN status ENUM('active', 'banned', 'left') DEFAULT 'active';

-- Add group message status
ALTER TABLE group_messages
ADD COLUMN status ENUM('active', 'deleted', 'flagged') DEFAULT 'active';

-- Add audit log severity
ALTER TABLE audit_logs
ADD COLUMN severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'low';
```

### Step 3: Create New Indexes
```sql
-- User session indexes
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(token);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active);

-- Course and lesson status indexes
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_lessons_status ON lessons(status);

-- Notification type index
CREATE INDEX idx_notifications_type ON notifications(type);

-- Community indexes
CREATE INDEX idx_community_groups_status ON community_groups(status);
CREATE INDEX idx_group_members_status ON group_members(status);
CREATE INDEX idx_group_messages_status ON group_messages(status);

-- Audit severity index
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);
```

### Step 4: Update Sample Data
```sql
-- Add new user roles
INSERT INTO users (id, email, full_name, role, is_active) VALUES
('u6', 'support@forwardafrica.com', 'User Support Agent', 'user_support', TRUE);

-- Update existing data with status fields
UPDATE courses SET status = 'published' WHERE status IS NULL;
UPDATE lessons SET status = 'published' WHERE status IS NULL;
UPDATE certificates SET status = 'active' WHERE status IS NULL;
UPDATE achievements SET status = 'completed' WHERE status IS NULL;
UPDATE community_groups SET status = 'active' WHERE status IS NULL;
UPDATE group_members SET status = 'active' WHERE status IS NULL;
UPDATE group_messages SET status = 'active' WHERE status IS NULL;
```

## Benefits of These Updates

### 1. Better Security
- Session management prevents unauthorized access
- Enhanced audit logging for security monitoring
- User account status tracking

### 2. Improved User Experience
- Better notification system
- Enhanced community features
- Improved progress tracking

### 3. Better Administration
- Enhanced role-based access control
- Better content management
- Improved analytics capabilities

### 4. Scalability
- Optimized database indexes
- Better data structure
- Enhanced performance

### 5. Compliance
- Comprehensive audit logging
- Better data tracking
- Enhanced security features

## Implementation Notes

1. **Backup First**: Always backup the existing database before applying changes
2. **Test Environment**: Test all changes in a development environment first
3. **Gradual Migration**: Consider migrating data in phases to minimize downtime
4. **Monitor Performance**: Watch for any performance impacts after applying changes
5. **Update Application Code**: Ensure the frontend and backend code is updated to work with new schema

## Verification Queries

After implementing the changes, run these queries to verify the setup:

```sql
-- Check user roles
SELECT role, COUNT(*) as count FROM users GROUP BY role ORDER BY count DESC;

-- Check course status
SELECT status, COUNT(*) as count FROM courses GROUP BY status;

-- Check active sessions
SELECT COUNT(*) as active_sessions FROM user_sessions WHERE is_active = TRUE;

-- Check notification types
SELECT type, COUNT(*) as count FROM notifications GROUP BY type ORDER BY count DESC;

-- Check audit log severity
SELECT severity, COUNT(*) as count FROM audit_logs GROUP BY severity ORDER BY count DESC;
```

This updated schema provides a solid foundation for the Forward Africa Learning Platform with enhanced security, better user experience, and improved administrative capabilities.