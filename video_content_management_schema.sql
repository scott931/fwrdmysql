-- Video Content Management System Database Schema
-- Automated video transcoding, subtitle generation, workflow management, and advanced metadata

USE forward_africa_db;

-- Create video_assets table for managing video files and their transcoded versions
CREATE TABLE video_assets (
    id VARCHAR(36) PRIMARY KEY,
    lesson_id VARCHAR(36) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    original_path VARCHAR(500) NOT NULL,
    original_size BIGINT NOT NULL,
    original_duration INT NOT NULL, -- in seconds
    original_format VARCHAR(20) NOT NULL,
    original_resolution VARCHAR(20) NOT NULL, -- e.g., "1920x1080"
    original_bitrate INT NOT NULL, -- in kbps
    upload_status ENUM('uploading', 'uploaded', 'processing', 'completed', 'failed') DEFAULT 'uploading',
    processing_status ENUM('pending', 'transcoding', 'subtitle_generation', 'completed', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

-- Create video_transcodings table for different resolution versions
CREATE TABLE video_transcodings (
    id VARCHAR(36) PRIMARY KEY,
    video_asset_id VARCHAR(36) NOT NULL,
    resolution VARCHAR(20) NOT NULL, -- e.g., "1920x1080", "1280x720", "854x480"
    quality ENUM('high', 'medium', 'low') NOT NULL,
    format VARCHAR(20) NOT NULL, -- e.g., "mp4", "webm"
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    bitrate INT NOT NULL, -- in kbps
    duration INT NOT NULL, -- in seconds
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    processing_started_at TIMESTAMP NULL,
    processing_completed_at TIMESTAMP NULL,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (video_asset_id) REFERENCES video_assets(id) ON DELETE CASCADE,
    UNIQUE KEY unique_video_resolution (video_asset_id, resolution, quality)
);

-- Create subtitles table for automatic subtitle generation
CREATE TABLE subtitles (
    id VARCHAR(36) PRIMARY KEY,
    video_asset_id VARCHAR(36) NOT NULL,
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    format ENUM('srt', 'vtt', 'json') NOT NULL DEFAULT 'srt',
    file_path VARCHAR(500) NOT NULL,
    confidence_score DECIMAL(5,4) DEFAULT 0.0000,
    word_count INT DEFAULT 0,
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    processing_started_at TIMESTAMP NULL,
    processing_completed_at TIMESTAMP NULL,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (video_asset_id) REFERENCES video_assets(id) ON DELETE CASCADE,
    UNIQUE KEY unique_video_language_format (video_asset_id, language, format)
);

-- Create subtitle_segments table for detailed subtitle data
CREATE TABLE subtitle_segments (
    id VARCHAR(36) PRIMARY KEY,
    subtitle_id VARCHAR(36) NOT NULL,
    start_time DECIMAL(10,3) NOT NULL, -- in seconds
    end_time DECIMAL(10,3) NOT NULL, -- in seconds
    text TEXT NOT NULL,
    confidence DECIMAL(5,4) DEFAULT 1.0000,
    segment_order INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subtitle_id) REFERENCES subtitles(id) ON DELETE CASCADE
);

-- Create content_workflow table for managing content states
CREATE TABLE content_workflow (
    id VARCHAR(36) PRIMARY KEY,
    content_id VARCHAR(36) NOT NULL,
    content_type ENUM('course', 'lesson', 'video') NOT NULL,
    status ENUM('draft', 'review', 'approved', 'published', 'archived') DEFAULT 'draft',
    current_reviewer_id VARCHAR(36),
    review_notes TEXT,
    review_deadline TIMESTAMP NULL,
    published_at TIMESTAMP NULL,
    archived_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (current_reviewer_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create workflow_history table for tracking workflow changes
CREATE TABLE workflow_history (
    id VARCHAR(36) PRIMARY KEY,
    workflow_id VARCHAR(36) NOT NULL,
    from_status ENUM('draft', 'review', 'approved', 'published', 'archived'),
    to_status ENUM('draft', 'review', 'approved', 'published', 'archived') NOT NULL,
    changed_by VARCHAR(36) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workflow_id) REFERENCES content_workflow(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Create content_metadata table for advanced metadata management
CREATE TABLE content_metadata (
    id VARCHAR(36) PRIMARY KEY,
    content_id VARCHAR(36) NOT NULL,
    content_type ENUM('course', 'lesson', 'video') NOT NULL,
    metadata_key VARCHAR(100) NOT NULL,
    metadata_value TEXT,
    metadata_type ENUM('string', 'number', 'boolean', 'json', 'date') DEFAULT 'string',
    is_public BOOLEAN DEFAULT TRUE,
    is_searchable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (content_id) REFERENCES content_workflow(content_id) ON DELETE CASCADE,
    UNIQUE KEY unique_content_metadata (content_id, metadata_key)
);

-- Create content_tags table for advanced tagging system
CREATE TABLE content_tags (
    id VARCHAR(36) PRIMARY KEY,
    content_id VARCHAR(36) NOT NULL,
    content_type ENUM('course', 'lesson', 'video') NOT NULL,
    tag_name VARCHAR(100) NOT NULL,
    tag_category VARCHAR(50) DEFAULT 'general',
    tag_weight DECIMAL(3,2) DEFAULT 1.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (content_id) REFERENCES content_workflow(content_id) ON DELETE CASCADE,
    UNIQUE KEY unique_content_tag (content_id, tag_name)
);

-- Create processing_jobs table for managing background processing tasks
CREATE TABLE processing_jobs (
    id VARCHAR(36) PRIMARY KEY,
    job_type ENUM('video_transcoding', 'subtitle_generation', 'metadata_extraction', 'thumbnail_generation') NOT NULL,
    content_id VARCHAR(36) NOT NULL,
    priority INT DEFAULT 5, -- 1=highest, 10=lowest
    status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    progress INT DEFAULT 0, -- 0-100
    parameters JSON,
    result_data JSON,
    error_message TEXT,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    retry_count INT DEFAULT 0,
    max_retries INT DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create video_analytics table for tracking video performance
CREATE TABLE video_analytics (
    id VARCHAR(36) PRIMARY KEY,
    video_asset_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36),
    session_id VARCHAR(100),
    event_type ENUM('play', 'pause', 'seek', 'complete', 'quality_change', 'error') NOT NULL,
    timestamp DECIMAL(10,3) NOT NULL, -- video timestamp in seconds
    session_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    quality_level VARCHAR(20),
    playback_speed DECIMAL(3,2) DEFAULT 1.00,
    user_agent TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (video_asset_id) REFERENCES video_assets(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Add indexes for better performance
CREATE INDEX idx_video_assets_lesson ON video_assets(lesson_id);
CREATE INDEX idx_video_assets_status ON video_assets(upload_status, processing_status);
CREATE INDEX idx_video_transcodings_asset ON video_transcodings(video_asset_id);
CREATE INDEX idx_video_transcodings_status ON video_transcodings(status);
CREATE INDEX idx_subtitles_asset ON subtitles(video_asset_id);
CREATE INDEX idx_subtitles_status ON subtitles(status);
CREATE INDEX idx_subtitle_segments_subtitle ON subtitle_segments(subtitle_id);
CREATE INDEX idx_content_workflow_content ON content_workflow(content_id, content_type);
CREATE INDEX idx_content_workflow_status ON content_workflow(status);
CREATE INDEX idx_workflow_history_workflow ON workflow_history(workflow_id);
CREATE INDEX idx_content_metadata_content ON content_metadata(content_id, content_type);
CREATE INDEX idx_content_metadata_searchable ON content_metadata(is_searchable, metadata_key);
CREATE INDEX idx_content_tags_content ON content_tags(content_id, content_type);
CREATE INDEX idx_content_tags_category ON content_tags(tag_category);
CREATE INDEX idx_processing_jobs_status ON processing_jobs(status, priority);
CREATE INDEX idx_processing_jobs_type ON processing_jobs(job_type);
CREATE INDEX idx_video_analytics_asset ON video_analytics(video_asset_id);
CREATE INDEX idx_video_analytics_user ON video_analytics(user_id);
CREATE INDEX idx_video_analytics_event ON video_analytics(event_type);

-- Create triggers for workflow history tracking
DELIMITER //

CREATE TRIGGER workflow_status_change_trigger
AFTER UPDATE ON content_workflow
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO workflow_history (id, workflow_id, from_status, to_status, changed_by, notes)
        VALUES (UUID(), NEW.id, OLD.status, NEW.status, NEW.current_reviewer_id, NEW.review_notes);
    END IF;
END//

-- Create trigger to update lesson video references
CREATE TRIGGER update_lesson_video_reference
AFTER INSERT ON video_assets
FOR EACH ROW
BEGIN
    UPDATE lessons
    SET video_url = NEW.original_path,
        video_duration = NEW.original_duration,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.lesson_id;
END//

DELIMITER ;

-- Create stored procedures for video processing
DELIMITER //

-- Procedure to get next processing job
CREATE PROCEDURE GetNextProcessingJob(IN jobType VARCHAR(50))
BEGIN
    SELECT
        id, job_type, content_id, priority, parameters
    FROM processing_jobs
    WHERE job_type = jobType
    AND status = 'pending'
    ORDER BY priority ASC, created_at ASC
    LIMIT 1;
END//

-- Procedure to update job status
CREATE PROCEDURE UpdateJobStatus(
    IN jobId VARCHAR(36),
    IN newStatus VARCHAR(20),
    IN progress INT,
    IN resultData JSON,
    IN errorMsg TEXT
)
BEGIN
    UPDATE processing_jobs
    SET status = newStatus,
        progress = progress,
        result_data = resultData,
        error_message = errorMsg,
        started_at = CASE WHEN newStatus = 'processing' THEN CURRENT_TIMESTAMP ELSE started_at END,
        completed_at = CASE WHEN newStatus IN ('completed', 'failed') THEN CURRENT_TIMESTAMP ELSE completed_at END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = jobId;
END//

-- Procedure to get video analytics summary
CREATE PROCEDURE GetVideoAnalyticsSummary(IN videoAssetId VARCHAR(36))
BEGIN
    SELECT
        COUNT(*) as total_views,
        COUNT(DISTINCT user_id) as unique_viewers,
        COUNT(CASE WHEN event_type = 'complete' THEN 1 END) as completions,
        AVG(CASE WHEN event_type = 'play' THEN timestamp END) as avg_watch_time,
        COUNT(CASE WHEN event_type = 'error' THEN 1 END) as errors
    FROM video_analytics
    WHERE video_asset_id = videoAssetId;
END//

DELIMITER ;

-- Insert sample data for testing
INSERT INTO content_workflow (id, content_id, content_type, status, current_reviewer_id) VALUES
('wf1', 'course1', 'course', 'published', 'admin1'),
('wf2', 'lesson1', 'lesson', 'review', 'admin1'),
('wf3', 'lesson2', 'lesson', 'draft', NULL);

INSERT INTO content_metadata (id, content_id, content_type, metadata_key, metadata_value, metadata_type) VALUES
('meta1', 'course1', 'course', 'target_audience', 'beginner', 'string'),
('meta2', 'course1', 'course', 'prerequisites', 'none', 'string'),
('meta3', 'course1', 'course', 'learning_objectives', '["Understand business fundamentals", "Learn strategic planning"]', 'json'),
('meta4', 'lesson1', 'lesson', 'difficulty_level', 'beginner', 'string'),
('meta5', 'lesson1', 'lesson', 'estimated_duration', '15', 'number');

INSERT INTO content_tags (id, content_id, content_type, tag_name, tag_category, tag_weight) VALUES
('tag1', 'course1', 'course', 'business', 'category', 1.00),
('tag2', 'course1', 'course', 'fundamentals', 'skill', 0.90),
('tag3', 'course1', 'course', 'strategy', 'topic', 0.85),
('tag4', 'lesson1', 'lesson', 'introduction', 'type', 1.00),
('tag5', 'lesson1', 'lesson', 'overview', 'type', 0.80);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON forward_africa_db.* TO 'forward_africa_user'@'localhost';
GRANT EXECUTE ON PROCEDURE forward_africa_db.GetNextProcessingJob TO 'forward_africa_user'@'localhost';
GRANT EXECUTE ON PROCEDURE forward_africa_db.UpdateJobStatus TO 'forward_africa_user'@'localhost';
GRANT EXECUTE ON PROCEDURE forward_africa_db.GetVideoAnalyticsSummary TO 'forward_africa_user'@'localhost';

COMMIT;

-- Display summary of changes
SELECT 'Video Content Management System Database Schema Created' as status;
SELECT COUNT(*) as total_tables_created FROM information_schema.tables
WHERE table_schema = 'forward_africa_db'
AND table_name IN ('video_assets', 'video_transcodings', 'subtitles', 'subtitle_segments', 'content_workflow', 'workflow_history', 'content_metadata', 'content_tags', 'processing_jobs', 'video_analytics');