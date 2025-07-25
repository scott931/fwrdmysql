-- Forward Africa Database Schema Update Script
-- Run this script to update your existing database schema for new features and analytics compatibility
-- This version includes IF statements to check for existing columns before adding them

USE forward_africa_db;

-- 1. Add new user columns (with IF checks)
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = 'forward_africa_db'
     AND TABLE_NAME = 'users'
     AND COLUMN_NAME = 'is_active') = 0,
    'ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;',
    'SELECT "Column is_active already exists" as message;'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = 'forward_africa_db'
     AND TABLE_NAME = 'users'
     AND COLUMN_NAME = 'last_login') = 0,
    'ALTER TABLE users ADD COLUMN last_login TIMESTAMP NULL;',
    'SELECT "Column last_login already exists" as message;'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. Update user role enum (may require manual intervention if data exists outside new enum)
ALTER TABLE users MODIFY COLUMN role ENUM('user', 'content_manager', 'community_manager', 'user_support', 'super_admin') DEFAULT 'user';

-- 3. Add status columns to courses (with IF checks)
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = 'forward_africa_db'
     AND TABLE_NAME = 'courses'
     AND COLUMN_NAME = 'status') = 0,
    'ALTER TABLE courses ADD COLUMN status ENUM(\'draft\', \'published\', \'archived\') DEFAULT \'draft\';',
    'SELECT "Column status already exists in courses" as message;'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. Add status columns to lessons (with IF checks)
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = 'forward_africa_db'
     AND TABLE_NAME = 'lessons'
     AND COLUMN_NAME = 'status') = 0,
    'ALTER TABLE lessons ADD COLUMN status ENUM(\'draft\', \'published\', \'archived\') DEFAULT \'draft\';',
    'SELECT "Column status already exists in lessons" as message;'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 5. Add status columns to certificates (with IF checks)
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = 'forward_africa_db'
     AND TABLE_NAME = 'certificates'
     AND COLUMN_NAME = 'status') = 0,
    'ALTER TABLE certificates ADD COLUMN status ENUM(\'active\', \'revoked\') DEFAULT \'active\';',
    'SELECT "Column status already exists in certificates" as message;'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 6. Add status columns to achievements (with IF checks)
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = 'forward_africa_db'
     AND TABLE_NAME = 'achievements'
     AND COLUMN_NAME = 'status') = 0,
    'ALTER TABLE achievements ADD COLUMN status ENUM(\'in_progress\', \'completed\') DEFAULT \'in_progress\';',
    'SELECT "Column status already exists in achievements" as message;'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 7. Update notification types
ALTER TABLE notifications MODIFY COLUMN type ENUM('course', 'achievement', 'system', 'community', 'info', 'success', 'warning', 'error') NOT NULL;

-- 8. Add community group enhancements (with IF checks)
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = 'forward_africa_db'
     AND TABLE_NAME = 'community_groups'
     AND COLUMN_NAME = 'current_members') = 0,
    'ALTER TABLE community_groups ADD COLUMN current_members INT DEFAULT 0;',
    'SELECT "Column current_members already exists in community_groups" as message;'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = 'forward_africa_db'
     AND TABLE_NAME = 'community_groups'
     AND COLUMN_NAME = 'status') = 0,
    'ALTER TABLE community_groups ADD COLUMN status ENUM(\'active\', \'suspended\', \'archived\') DEFAULT \'active\';',
    'SELECT "Column status already exists in community_groups" as message;'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 9. Add group member status (with IF checks)
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = 'forward_africa_db'
     AND TABLE_NAME = 'group_members'
     AND COLUMN_NAME = 'status') = 0,
    'ALTER TABLE group_members ADD COLUMN status ENUM(\'active\', \'banned\', \'left\') DEFAULT \'active\';',
    'SELECT "Column status already exists in group_members" as message;'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 10. Add group message status (with IF checks)
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = 'forward_africa_db'
     AND TABLE_NAME = 'group_messages'
     AND COLUMN_NAME = 'status') = 0,
    'ALTER TABLE group_messages ADD COLUMN status ENUM(\'active\', \'deleted\', \'flagged\') DEFAULT \'active\';',
    'SELECT "Column status already exists in group_messages" as message;'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 11. Add audit log severity (with IF checks)
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = 'forward_africa_db'
     AND TABLE_NAME = 'audit_logs'
     AND COLUMN_NAME = 'severity') = 0,
    'ALTER TABLE audit_logs ADD COLUMN severity ENUM(\'low\', \'medium\', \'high\', \'critical\') DEFAULT \'low\';',
    'SELECT "Column severity already exists in audit_logs" as message;'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 12. Create user_sessions table (if not exists)
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

-- 13. Create new indexes for better performance (with IF checks)
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = 'forward_africa_db'
     AND TABLE_NAME = 'users'
     AND INDEX_NAME = 'idx_users_active') = 0,
    'CREATE INDEX idx_users_active ON users(is_active);',
    'SELECT "Index idx_users_active already exists" as message;'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = 'forward_africa_db'
     AND TABLE_NAME = 'user_sessions'
     AND INDEX_NAME = 'idx_user_sessions_user') = 0,
    'CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);',
    'SELECT "Index idx_user_sessions_user already exists" as message;'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = 'forward_africa_db'
     AND TABLE_NAME = 'user_sessions'
     AND INDEX_NAME = 'idx_user_sessions_token') = 0,
    'CREATE INDEX idx_user_sessions_token ON user_sessions(token);',
    'SELECT "Index idx_user_sessions_token already exists" as message;'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = 'forward_africa_db'
     AND TABLE_NAME = 'user_sessions'
     AND INDEX_NAME = 'idx_user_sessions_active') = 0,
    'CREATE INDEX idx_user_sessions_active ON user_sessions(is_active);',
    'SELECT "Index idx_user_sessions_active already exists" as message;'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = 'forward_africa_db'
     AND TABLE_NAME = 'courses'
     AND INDEX_NAME = 'idx_courses_status') = 0,
    'CREATE INDEX idx_courses_status ON courses(status);',
    'SELECT "Index idx_courses_status already exists" as message;'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = 'forward_africa_db'
     AND TABLE_NAME = 'lessons'
     AND INDEX_NAME = 'idx_lessons_status') = 0,
    'CREATE INDEX idx_lessons_status ON lessons(status);',
    'SELECT "Index idx_lessons_status already exists" as message;'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = 'forward_africa_db'
     AND TABLE_NAME = 'notifications'
     AND INDEX_NAME = 'idx_notifications_type') = 0,
    'CREATE INDEX idx_notifications_type ON notifications(type);',
    'SELECT "Index idx_notifications_type already exists" as message;'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = 'forward_africa_db'
     AND TABLE_NAME = 'community_groups'
     AND INDEX_NAME = 'idx_community_groups_status') = 0,
    'CREATE INDEX idx_community_groups_status ON community_groups(status);',
    'SELECT "Index idx_community_groups_status already exists" as message;'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = 'forward_africa_db'
     AND TABLE_NAME = 'group_members'
     AND INDEX_NAME = 'idx_group_members_status') = 0,
    'CREATE INDEX idx_group_members_status ON group_members(status);',
    'SELECT "Index idx_group_members_status already exists" as message;'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = 'forward_africa_db'
     AND TABLE_NAME = 'group_messages'
     AND INDEX_NAME = 'idx_group_messages_status') = 0,
    'CREATE INDEX idx_group_messages_status ON group_messages(status);',
    'SELECT "Index idx_group_messages_status already exists" as message;'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = 'forward_africa_db'
     AND TABLE_NAME = 'audit_logs'
     AND INDEX_NAME = 'idx_audit_logs_severity') = 0,
    'CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);',
    'SELECT "Index idx_audit_logs_severity already exists" as message;'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 14. Update existing data with status fields (optional, safe to skip if not needed)
UPDATE courses SET status = 'published' WHERE status IS NULL;
UPDATE lessons SET status = 'published' WHERE status IS NULL;
UPDATE certificates SET status = 'active' WHERE status IS NULL;
UPDATE achievements SET status = 'completed' WHERE status IS NULL;
UPDATE community_groups SET status = 'active' WHERE status IS NULL;
UPDATE group_members SET status = 'active' WHERE status IS NULL;
UPDATE group_messages SET status = 'active' WHERE status IS NULL;

-- 15. Add new user support role if not exists (optional, safe to skip if already present)
INSERT IGNORE INTO users (id, email, full_name, role, is_active, onboarding_completed) VALUES
('u6', 'support@forwardafrica.com', 'User Support Agent', 'user_support', TRUE, TRUE);

-- 16. Update community group member counts
UPDATE community_groups cg
SET current_members = (
    SELECT COUNT(*)
    FROM group_members gm
    WHERE gm.group_id = cg.id AND gm.status = 'active'
);

-- Verification queries
SELECT 'Migration completed successfully!' as status;
SELECT role, COUNT(*) as count FROM users GROUP BY role ORDER BY count DESC;
SELECT status, COUNT(*) as count FROM courses GROUP BY status;
SELECT COUNT(*) as active_sessions FROM user_sessions WHERE is_active = TRUE;
SELECT type, COUNT(*) as count FROM notifications GROUP BY type ORDER BY count DESC;
SELECT severity, COUNT(*) as count FROM audit_logs GROUP BY severity ORDER BY count DESC;