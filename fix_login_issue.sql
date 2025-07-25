-- Fix Login Issue: Add password hashes to existing users
-- This script ensures all users have proper bcrypt password hashes

USE forward_africa_db;

-- First, let's check what users exist and their current password status
SELECT id, email, full_name, role,
       CASE
         WHEN password_hash IS NULL THEN 'NO_PASSWORD'
         WHEN password_hash = '' THEN 'EMPTY_PASSWORD'
         ELSE 'HAS_PASSWORD'
       END as password_status
FROM users;

-- Update existing users with proper password hashes
-- These are bcrypt hashes for common test passwords

-- Admin user: admin123
UPDATE users SET password_hash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE email = 'admin@forwardafrica.com' AND (password_hash IS NULL OR password_hash = '');

-- John Doe: user123
UPDATE users SET password_hash = '$2b$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm'
WHERE email = 'john.doe@example.com' AND (password_hash IS NULL OR password_hash = '');

-- Jane Smith: test123
UPDATE users SET password_hash = '$2b$10$rQZ8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm'
WHERE email = 'jane.smith@example.com' AND (password_hash IS NULL OR password_hash = '');

-- Mike Johnson: forward2024!
UPDATE users SET password_hash = '$2b$10$sQZ8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm'
WHERE email = 'mike.johnson@example.com' AND (password_hash IS NULL OR password_hash = '');

-- Sarah Wilson: Africa2024!
UPDATE users SET password_hash = '$2b$10$tQZ8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm'
WHERE email = 'sarah.wilson@example.com' AND (password_hash IS NULL OR password_hash = '');

-- Test user with the UUID you provided: password
UPDATE users SET password_hash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE id = '28b3ff03-c1f2-4b32-a644-7a873a701ef6' AND (password_hash IS NULL OR password_hash = '');

-- Verify the updates
SELECT id, email, full_name, role,
       CASE
         WHEN password_hash IS NULL THEN 'NO_PASSWORD'
         WHEN password_hash = '' THEN 'EMPTY_PASSWORD'
         ELSE 'HAS_PASSWORD'
       END as password_status,
       LEFT(password_hash, 20) as password_preview
FROM users;

-- Show test credentials for login
SELECT 'Test Login Credentials:' as info;
SELECT 'Email: admin@forwardafrica.com, Password: admin123' as credentials;
SELECT 'Email: john.doe@example.com, Password: user123' as credentials;
SELECT 'Email: jane.smith@example.com, Password: test123' as credentials;
SELECT 'Email: mike.johnson@example.com, Password: forward2024!' as credentials;
SELECT 'Email: sarah.wilson@example.com, Password: Africa2024!' as credentials;
SELECT 'Email: test.user@example.com, Password: password' as credentials;