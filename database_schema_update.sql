-- Enhanced Search and Recommendation System Database Updates
-- Add new fields and tables for advanced search functionality

USE forward_africa_db;

-- Add new fields to courses table for enhanced search
ALTER TABLE courses
ADD COLUMN difficulty ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner' AFTER description,
ADD COLUMN duration VARCHAR(20) DEFAULT '0 hours' AFTER difficulty,
ADD COLUMN language VARCHAR(50) DEFAULT 'english' AFTER duration,
ADD COLUMN rating DECIMAL(3,2) DEFAULT 0.00 AFTER language,
ADD COLUMN rating_count INT DEFAULT 0 AFTER rating,
ADD COLUMN popularity INT DEFAULT 0 AFTER rating_count,
ADD COLUMN is_free BOOLEAN DEFAULT FALSE AFTER popularity,
ADD COLUMN has_transcript BOOLEAN DEFAULT FALSE AFTER is_free,
ADD COLUMN has_subtitles BOOLEAN DEFAULT FALSE AFTER has_transcript,
ADD COLUMN tags JSON AFTER has_subtitles,
ADD COLUMN search_keywords TEXT AFTER tags,
ADD COLUMN full_text_content LONGTEXT AFTER search_keywords;

-- Add new fields to lessons table for transcript search
ALTER TABLE lessons
ADD COLUMN transcript TEXT AFTER description,
ADD COLUMN subtitles JSON AFTER transcript,
ADD COLUMN search_keywords TEXT AFTER subtitles,
ADD COLUMN full_text_content LONGTEXT AFTER search_keywords;

-- Create transcripts table for detailed transcript storage
CREATE TABLE transcripts (
    id VARCHAR(36) PRIMARY KEY,
    lesson_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    language VARCHAR(10) DEFAULT 'en',
    confidence DECIMAL(5,4) DEFAULT 1.0000,
    word_timestamps JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

-- Create search_analytics table for tracking search behavior
CREATE TABLE search_analytics (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    query TEXT NOT NULL,
    results_count INT DEFAULT 0,
    clicked_result_id VARCHAR(36),
    clicked_result_type ENUM('course', 'instructor', 'lesson', 'transcript'),
    search_filters JSON,
    search_duration_ms INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create user_recommendations table for collaborative filtering
CREATE TABLE user_recommendations (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    course_id VARCHAR(36) NOT NULL,
    recommendation_type ENUM('collaborative', 'content', 'popular', 'trending') NOT NULL,
    score DECIMAL(5,4) NOT NULL,
    reason TEXT,
    is_viewed BOOLEAN DEFAULT FALSE,
    is_clicked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_course_recommendation (user_id, course_id, recommendation_type)
);

-- Create course_ratings table for rating system
CREATE TABLE course_ratings (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    course_id VARCHAR(36) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    helpful_votes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_course_rating (user_id, course_id)
);

-- Create search_suggestions table for autocomplete
CREATE TABLE search_suggestions (
    id VARCHAR(36) PRIMARY KEY,
    query VARCHAR(255) NOT NULL,
    suggestion_type ENUM('course', 'instructor', 'category', 'tag') NOT NULL,
    suggestion_text VARCHAR(255) NOT NULL,
    relevance_score DECIMAL(5,4) DEFAULT 1.0000,
    usage_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_suggestion (query, suggestion_type, suggestion_text)
);

-- Create popular_searches table for trending searches
CREATE TABLE popular_searches (
    id VARCHAR(36) PRIMARY KEY,
    query VARCHAR(255) NOT NULL,
    search_count INT DEFAULT 0,
    unique_users INT DEFAULT 0,
    avg_results_count DECIMAL(8,2) DEFAULT 0.00,
    last_searched TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_query (query)
);

-- Add indexes for better search performance
CREATE INDEX idx_courses_search ON courses(title, description, search_keywords);
CREATE INDEX idx_courses_difficulty ON courses(difficulty);
CREATE INDEX idx_courses_duration ON courses(duration);
CREATE INDEX idx_courses_language ON courses(language);
CREATE INDEX idx_courses_rating ON courses(rating);
CREATE INDEX idx_courses_popularity ON courses(popularity);
CREATE INDEX idx_courses_tags ON courses((CAST(tags AS CHAR(1000))));
CREATE INDEX idx_courses_fulltext ON courses(title, description, search_keywords, full_text_content);

CREATE INDEX idx_lessons_search ON lessons(title, description, search_keywords);
CREATE INDEX idx_lessons_transcript ON lessons(transcript(1000));
CREATE INDEX idx_lessons_fulltext ON lessons(title, description, search_keywords, full_text_content);

CREATE INDEX idx_transcripts_content ON transcripts(content(1000));
CREATE INDEX idx_transcripts_lesson ON transcripts(lesson_id);

CREATE INDEX idx_search_analytics_query ON search_analytics(query(100));
CREATE INDEX idx_search_analytics_user ON search_analytics(user_id);
CREATE INDEX idx_search_analytics_created ON search_analytics(created_at);

CREATE INDEX idx_user_recommendations_user ON user_recommendations(user_id);
CREATE INDEX idx_user_recommendations_score ON user_recommendations(score);
CREATE INDEX idx_user_recommendations_type ON user_recommendations(recommendation_type);

CREATE INDEX idx_course_ratings_course ON course_ratings(course_id);
CREATE INDEX idx_course_ratings_rating ON course_ratings(rating);
CREATE INDEX idx_course_ratings_user ON course_ratings(user_id);

CREATE INDEX idx_search_suggestions_query ON search_suggestions(query);
CREATE INDEX idx_search_suggestions_relevance ON search_suggestions(relevance_score);
CREATE INDEX idx_search_suggestions_usage ON search_suggestions(usage_count);

CREATE INDEX idx_popular_searches_count ON popular_searches(search_count);
CREATE INDEX idx_popular_searches_last_searched ON popular_searches(last_searched);

-- Add full-text search indexes
ALTER TABLE courses ADD FULLTEXT(title, description, search_keywords, full_text_content);
ALTER TABLE lessons ADD FULLTEXT(title, description, search_keywords, full_text_content);
ALTER TABLE transcripts ADD FULLTEXT(content);

-- Insert sample data for testing
INSERT INTO search_suggestions (id, query, suggestion_type, suggestion_text, relevance_score, usage_count) VALUES
('sugg1', 'business', 'course', 'Business Fundamentals', 0.95, 150),
('sugg2', 'business', 'course', 'Business Strategy', 0.92, 120),
('sugg3', 'business', 'instructor', 'Ray Dalio', 0.88, 80),
('sugg4', 'business', 'category', 'Business', 0.90, 200),
('sugg5', 'entrepreneur', 'course', 'Entrepreneurship Mastery', 0.94, 95),
('sugg6', 'entrepreneur', 'instructor', 'Sara Blakely', 0.89, 75),
('sugg7', 'marketing', 'course', 'Digital Marketing Strategy', 0.93, 110),
('sugg8', 'marketing', 'tag', 'marketing', 0.85, 180);

INSERT INTO popular_searches (id, query, search_count, unique_users, avg_results_count) VALUES
('pop1', 'business fundamentals', 1247, 890, 15.5),
('pop2', 'entrepreneurship', 892, 654, 12.3),
('pop3', 'marketing strategy', 756, 543, 18.7),
('pop4', 'financial management', 634, 456, 9.8),
('pop5', 'leadership skills', 521, 398, 14.2);

-- Update existing courses with sample data
UPDATE courses SET
    difficulty = CASE
        WHEN id IN ('course1', 'course2') THEN 'beginner'
        WHEN id IN ('course3', 'course4') THEN 'intermediate'
        ELSE 'advanced'
    END,
    duration = CASE
        WHEN id IN ('course1', 'course2') THEN '6 hours'
        WHEN id IN ('course3', 'course4') THEN '8 hours'
        ELSE '10 hours'
    END,
    language = 'english',
    rating = 4.0 + (RAND() * 1.0),
    rating_count = FLOOR(RAND() * 100) + 10,
    popularity = FLOOR(RAND() * 1000) + 100,
    is_free = FALSE,
    has_transcript = TRUE,
    has_subtitles = TRUE,
    tags = JSON_ARRAY('business', 'leadership', 'strategy'),
    search_keywords = 'business fundamentals management strategy leadership',
    full_text_content = CONCAT(description, ' This comprehensive course covers all aspects of business fundamentals including strategy, operations, and leadership principles.')
WHERE id IN ('course1', 'course2', 'course3', 'course4', 'course5');

-- Insert sample course ratings
INSERT INTO course_ratings (id, user_id, course_id, rating, review) VALUES
('rating1', 'u1', 'course1', 5, 'Excellent course on business fundamentals!'),
('rating2', 'u2', 'course1', 4, 'Very informative and well-structured'),
('rating3', 'u3', 'course2', 5, 'Great insights on entrepreneurship'),
('rating4', 'u4', 'course2', 4, 'Practical and actionable advice'),
('rating5', 'u5', 'course3', 5, 'Outstanding financial management course');

-- Insert sample transcripts
INSERT INTO transcripts (id, lesson_id, content, language, confidence) VALUES
('trans1', 'lesson1', 'Welcome to this comprehensive course on business fundamentals. Today we will be covering the essential principles that every entrepreneur needs to understand. Let us start with the basics of market analysis and customer segmentation.', 'en', 0.95),
('trans2', 'lesson2', 'In this lesson, we will dive deep into financial management strategies. We will cover budgeting, cash flow management, and investment planning. These skills are fundamental for sustainable business growth.', 'en', 0.92),
('trans3', 'lesson3', 'Marketing and branding are essential components of business success. We will explore digital marketing strategies, social media presence, and building a strong brand identity.', 'en', 0.94);

-- Update lessons with transcript data
UPDATE lessons SET
    transcript = (SELECT content FROM transcripts WHERE lesson_id = lessons.id LIMIT 1),
    search_keywords = CONCAT(title, ' ', description),
    full_text_content = CONCAT(title, ' ', description, ' ', COALESCE(transcript, ''))
WHERE id IN ('lesson1', 'lesson2', 'lesson3');

-- Insert sample user recommendations
INSERT INTO user_recommendations (id, user_id, course_id, recommendation_type, score, reason) VALUES
('rec1', 'u1', 'course2', 'collaborative', 0.85, 'Liked by users similar to you'),
('rec2', 'u1', 'course3', 'content', 0.92, 'Matches your interests in business'),
('rec3', 'u1', 'course4', 'popular', 0.78, 'Popular among all students'),
('rec4', 'u2', 'course1', 'collaborative', 0.88, 'Based on your learning history'),
('rec5', 'u2', 'course5', 'trending', 0.82, 'Trending this week');

-- Create triggers to update course ratings and popularity
DELIMITER //

CREATE TRIGGER update_course_rating_after_insert
AFTER INSERT ON course_ratings
FOR EACH ROW
BEGIN
    UPDATE courses
    SET rating = (
        SELECT AVG(rating)
        FROM course_ratings
        WHERE course_id = NEW.course_id
    ),
    rating_count = (
        SELECT COUNT(*)
        FROM course_ratings
        WHERE course_id = NEW.course_id
    )
    WHERE id = NEW.course_id;
END//

CREATE TRIGGER update_course_rating_after_update
AFTER UPDATE ON course_ratings
FOR EACH ROW
BEGIN
    UPDATE courses
    SET rating = (
        SELECT AVG(rating)
        FROM course_ratings
        WHERE course_id = NEW.course_id
    )
    WHERE id = NEW.course_id;
END//

CREATE TRIGGER update_course_rating_after_delete
AFTER DELETE ON course_ratings
FOR EACH ROW
BEGIN
    UPDATE courses
    SET rating = (
        SELECT COALESCE(AVG(rating), 0)
        FROM course_ratings
        WHERE course_id = OLD.course_id
    ),
    rating_count = (
        SELECT COUNT(*)
        FROM course_ratings
        WHERE course_id = OLD.course_id
    )
    WHERE id = OLD.course_id;
END//

DELIMITER ;

-- Create stored procedure for search suggestions
DELIMITER //

CREATE PROCEDURE GetSearchSuggestions(IN searchQuery VARCHAR(255), IN suggestionLimit INT)
BEGIN
    SELECT
        suggestion_text,
        suggestion_type,
        relevance_score,
        usage_count
    FROM search_suggestions
    WHERE query LIKE CONCAT('%', searchQuery, '%')
    ORDER BY relevance_score DESC, usage_count DESC
    LIMIT suggestionLimit;
END//

-- Create stored procedure for collaborative filtering recommendations
CREATE PROCEDURE GetCollaborativeRecommendations(IN userId VARCHAR(36), IN limitCount INT)
BEGIN
    SELECT
        c.id,
        c.title,
        c.description,
        c.thumbnail,
        c.rating,
        c.popularity,
        'collaborative' as recommendation_type,
        AVG(ur.score) as recommendation_score,
        'Based on similar users' as reason
    FROM courses c
    JOIN user_recommendations ur ON c.id = ur.course_id
    WHERE ur.user_id IN (
        SELECT DISTINCT up1.user_id
        FROM user_progress up1
        JOIN user_progress up2 ON up1.course_id = up2.course_id
        WHERE up2.user_id = userId AND up1.user_id != userId
    )
    AND c.id NOT IN (
        SELECT course_id FROM user_progress WHERE user_id = userId
    )
    GROUP BY c.id
    ORDER BY recommendation_score DESC
    LIMIT limitCount;
END//

DELIMITER ;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON forward_africa_db.* TO 'forward_africa_user'@'localhost';
GRANT EXECUTE ON PROCEDURE forward_africa_db.GetSearchSuggestions TO 'forward_africa_user'@'localhost';
GRANT EXECUTE ON PROCEDURE forward_africa_db.GetCollaborativeRecommendations TO 'forward_africa_user'@'localhost';

-- Update existing data with new fields
UPDATE courses SET
    difficulty = 'beginner',
    duration = '6 hours',
    language = 'english',
    rating = 4.5,
    rating_count = 25,
    popularity = 150,
    is_free = FALSE,
    has_transcript = TRUE,
    has_subtitles = TRUE,
    tags = JSON_ARRAY('business', 'leadership'),
    search_keywords = 'business fundamentals management',
    full_text_content = CONCAT(description, ' This course provides comprehensive coverage of business fundamentals including strategy, operations, and leadership principles.')
WHERE id = 'course1';

UPDATE courses SET
    difficulty = 'intermediate',
    duration = '8 hours',
    language = 'english',
    rating = 4.8,
    rating_count = 42,
    popularity = 280,
    is_free = FALSE,
    has_transcript = TRUE,
    has_subtitles = TRUE,
    tags = JSON_ARRAY('entrepreneurship', 'startup'),
    search_keywords = 'entrepreneurship startup business',
    full_text_content = CONCAT(description, ' Advanced course covering entrepreneurial skills, startup strategies, and business scaling techniques.')
WHERE id = 'course2';

-- Commit all changes
COMMIT;

-- Display summary of changes
SELECT 'Enhanced Search System Database Updates Completed' as status;
SELECT COUNT(*) as total_courses_updated FROM courses WHERE difficulty IS NOT NULL;
SELECT COUNT(*) as total_transcripts_created FROM transcripts;
SELECT COUNT(*) as total_search_suggestions FROM search_suggestions;
SELECT COUNT(*) as total_popular_searches FROM popular_searches;