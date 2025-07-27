-- Fix audit_logs table structure
-- Add missing columns that the API expects

USE forward_africa_db;

-- Add missing columns to audit_logs table
ALTER TABLE audit_logs
ADD COLUMN resource_type VARCHAR(255) NULL AFTER action,
ADD COLUMN resource_id VARCHAR(255) NULL AFTER resource_type,
ADD COLUMN details TEXT NULL AFTER resource_id;

-- Update existing records to have default values for new columns
UPDATE audit_logs SET
resource_type = 'system' WHERE resource_type IS NULL,
resource_id = NULL WHERE resource_id IS NULL,
details = '{}' WHERE details IS NULL;

-- Show the updated table structure
DESCRIBE audit_logs;

-- Show sample data
SELECT id, user_id, action, resource_type, resource_id, details, ip_address, created_at
FROM audit_logs
ORDER BY created_at DESC
LIMIT 5;