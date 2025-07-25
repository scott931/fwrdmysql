-- Fix for existing databases: Add permissions column and update role enum
-- Run this on existing databases to fix profile fetch issues

USE forward_africa_db;

-- Add permissions column (without default value as MySQL doesn't allow it for JSON)
ALTER TABLE users ADD COLUMN permissions JSON;

-- Update existing users to have empty permissions array
UPDATE users SET permissions = '[]' WHERE permissions IS NULL;

-- Update role enum to match frontend expectations
-- First, update any existing 'admin' roles to 'super_admin' to avoid conflicts
UPDATE users SET role = 'super_admin' WHERE role = 'admin';

-- Then modify the enum (this requires recreating the table in MySQL)
-- For now, we'll handle this in the application layer
-- The backend should map 'admin' to 'super_admin' when needed

-- Update sample data to include permissions
UPDATE users SET permissions = '["courses:view", "profile:edit"]' WHERE role = 'user';
UPDATE users SET permissions = '["courses:view", "profile:edit", "content:manage"]' WHERE role = 'content_manager';
UPDATE users SET permissions = '["courses:view", "profile:edit", "community:manage"]' WHERE role = 'community_manager';
UPDATE users SET permissions = '["courses:view", "profile:edit", "support:manage"]' WHERE role = 'user_support';
UPDATE users SET permissions = '["system:full_access"]' WHERE role = 'super_admin';

-- Verify the changes
SELECT id, email, role, permissions FROM users LIMIT 5;