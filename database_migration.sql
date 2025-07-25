-- Forward Africa Database Migration Script
-- Execute this script to update your existing database schema
-- Version: 2.0 Migration

USE forward_africa_db;

-- Step 1: Add new user columns (run each statement separately)
ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN last_login TIMESTAMP NULL;

-- Step 2: Update role enum to include new roles
ALTER TABLE users
MODIFY COLUMN role ENUM('user', 'content_manager', 'community_manager', 'user_support', 'super_admin') DEFAULT 'user';

-- Step 3: Add status columns to courses
ALTER TABLE courses
ADD COLUMN IF NOT EXISTS status ENUM('draft', 'published', 'archived') DEFAULT 'draft';

-- Step 4: Add status columns to lessons
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS status ENUM('draft', 'published', 'archived') DEFAULT 'draft';

-- Step 5: Add status columns to certificates
ALTER TABLE certificates
ADD COLUMN IF NOT EXISTS status ENUM('active', 'revoked') DEFAULT 'active';

-- Step 6: Add status columns to achievements
ALTER TABLE achievements
ADD COLUMN IF NOT EXISTS status ENUM('in_progress', 'completed') DEFAULT 'in_progress';

-- Step 7: Update notification types
ALTER TABLE notifications
MODIFY COLUMN type ENUM('course', 'achievement', 'system', 'community', 'info', 'success', 'warning', 'error') NOT NULL;

-- Step 8: Add community group enhancements
ALTER TABLE community_groups
ADD COLUMN IF NOT EXISTS current_members INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS status ENUM('active', 'suspended', 'archived') DEFAULT 'active';

-- Step 9: Add group member status
ALTER TABLE group_members
ADD COLUMN IF NOT EXISTS status ENUM('active', 'banned', 'left') DEFAULT 'active';

-- Step 10: Add group message status
ALTER TABLE group_messages
ADD COLUMN IF NOT EXISTS status ENUM('active', 'deleted', 'flagged') DEFAULT 'active';

-- Step 11: Add audit log severity
ALTER TABLE audit_logs
ADD COLUMN IF NOT EXISTS severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'low';

-- Step 12: Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
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

-- Step 13: Create new indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_lessons_status ON lessons(status);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_community_groups_status ON community_groups(status);
CREATE INDEX IF NOT EXISTS idx_group_members_status ON group_members(status);
CREATE INDEX IF NOT EXISTS idx_group_messages_status ON group_messages(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);

-- Step 14: Update existing data with status fields
UPDATE courses SET status = 'published' WHERE status IS NULL;
UPDATE lessons SET status = 'published' WHERE status IS NULL;
UPDATE certificates SET status = 'active' WHERE status IS NULL;
UPDATE achievements SET status = 'completed' WHERE status IS NULL;
UPDATE community_groups SET status = 'active' WHERE status IS NULL;
UPDATE group_members SET status = 'active' WHERE status IS NULL;
UPDATE group_messages SET status = 'active' WHERE status IS NULL;

-- Step 15: Add new user support role if not exists
INSERT IGNORE INTO users (id, email, full_name, role, is_active, onboarding_completed) VALUES
('u6', 'support@forwardafrica.com', 'User Support Agent', 'user_support', TRUE, TRUE);

-- Step 16: Update community group member counts
UPDATE community_groups cg
SET current_members = (
    SELECT COUNT(*)
    FROM group_members gm
    WHERE gm.group_id = cg.id AND gm.status = 'active'
);

-- Verification queries
SELECT 'Migration completed successfully!' as status;

-- Show updated statistics
SELECT 'User Roles:' as info;
SELECT role, COUNT(*) as count FROM users GROUP BY role ORDER BY count DESC;

SELECT 'Course Status:' as info;
SELECT status, COUNT(*) as count FROM courses GROUP BY status;

SELECT 'Active Sessions:' as info;
SELECT COUNT(*) as active_sessions FROM user_sessions WHERE is_active = TRUE;

SELECT 'Notification Types:' as info;
SELECT type, COUNT(*) as count FROM notifications GROUP BY type ORDER BY count DESC;

SELECT 'Audit Log Severity:' as info;
SELECT severity, COUNT(*) as count FROM audit_logs GROUP BY severity ORDER BY count DESC;