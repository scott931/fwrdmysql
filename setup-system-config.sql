-- Setup System Configuration Table
-- Run this script to add the system_configuration table to your database

USE forward_africa_db;

-- Create System Configuration table
CREATE TABLE IF NOT EXISTS system_configuration (
    id INT PRIMARY KEY DEFAULT 1,
    site_name VARCHAR(255) NOT NULL DEFAULT 'Forward Africa',
    site_description TEXT,
    maintenance_mode BOOLEAN DEFAULT FALSE,
    debug_mode BOOLEAN DEFAULT FALSE,
    max_upload_size INT DEFAULT 50,
    session_timeout INT DEFAULT 30,
    email_notifications BOOLEAN DEFAULT TRUE,
    auto_backup BOOLEAN DEFAULT TRUE,
    backup_frequency ENUM('hourly', 'daily', 'weekly', 'monthly') DEFAULT 'daily',
    security_level ENUM('low', 'medium', 'high', 'maximum') DEFAULT 'high',
    rate_limiting BOOLEAN DEFAULT TRUE,
    max_requests_per_minute INT DEFAULT 100,
    database_connection_pool INT DEFAULT 10,
    cache_enabled BOOLEAN DEFAULT TRUE,
    cache_ttl INT DEFAULT 3600,
    cdn_enabled BOOLEAN DEFAULT FALSE,
    ssl_enabled BOOLEAN DEFAULT TRUE,
    cors_enabled BOOLEAN DEFAULT TRUE,
    allowed_origins JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default configuration if table is empty
INSERT IGNORE INTO system_configuration (id, site_name, site_description, allowed_origins) VALUES (
    1,
    'Forward Africa',
    'Empowering African professionals through expert-led courses',
    JSON_ARRAY('https://forwardafrica.com', 'https://www.forwardafrica.com')
);

-- Verify the table was created
SELECT * FROM system_configuration;