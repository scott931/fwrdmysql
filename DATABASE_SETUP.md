# Database Setup Guide

## Overview
This document provides instructions for setting up the Forward Africa Learning Platform database with all the new user registration fields.

## Database Schema Updates

### Users Table - New Fields Added

The `users` table has been enhanced with the following new fields for comprehensive user profiles:

#### Professional Information
- `industry` VARCHAR(255) - User's industry sector
- `experience_level` VARCHAR(100) - Professional experience level
- `business_stage` VARCHAR(100) - Current business development stage

#### Geographic Location
- `country` VARCHAR(100) - User's country
- `state_province` VARCHAR(100) - State or province
- `city` VARCHAR(100) - City

#### Enhanced Profile Data
- `education_level` ENUM - Educational background
- `job_title` VARCHAR(255) - Professional title
- `topics_of_interest` JSON - Array of learning interests

### Complete Users Table Schema

```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(191) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    avatar_url TEXT,
    education_level ENUM('high-school', 'associate', 'bachelor', 'master', 'phd', 'professional', 'other'),
    job_title VARCHAR(255),
    topics_of_interest JSON,
    industry VARCHAR(255),
    experience_level VARCHAR(100),
    business_stage VARCHAR(100),
    country VARCHAR(100),
    state_province VARCHAR(100),
    city VARCHAR(100),
    onboarding_completed BOOLEAN DEFAULT FALSE,
    role ENUM('user', 'content_manager', 'admin', 'super_admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Setup Instructions

### 1. Database Creation
```bash
# Run the complete database schema
mysql -u root -p < database_schema.sql
```

### 2. Backend Server Setup
```bash
cd backend
npm install
npm start
```

### 3. Database Initialization
The backend server includes an automatic database initialization endpoint:
```bash
curl -X POST http://localhost:3002/api/init-db
```

## Sample Data

The database includes sample users with all new fields populated:

```sql
INSERT INTO users (id, email, full_name, avatar_url, education_level, job_title, topics_of_interest, industry, experience_level, business_stage, country, state_province, city, onboarding_completed, role) VALUES
('u1', 'john.doe@example.com', 'John Doe', 'avatar_url', 'bachelor', 'Software Developer', '["technology", "programming", "business"]', 'Technology', 'Mid-level', 'Growth', 'Nigeria', 'Lagos', 'Lagos', TRUE, 'user'),
('u2', 'jane.smith@example.com', 'Jane Smith', 'avatar_url', 'master', 'Product Manager', '["business", "leadership", "innovation"]', 'Finance', 'Senior', 'Established', 'Kenya', 'Nairobi', 'Nairobi', TRUE, 'admin');
```

## API Endpoints

### User Registration
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "education_level": "bachelor",
  "job_title": "Software Developer",
  "topics_of_interest": ["technology", "programming"],
  "industry": "Technology",
  "experience_level": "Mid-level",
  "business_stage": "Growth",
  "country": "Nigeria",
  "state_province": "Lagos",
  "city": "Lagos"
}
```

### User Profile Update
```http
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "user@example.com",
  "full_name": "John Doe",
  "education_level": "bachelor",
  "job_title": "Software Developer",
  "topics_of_interest": ["technology", "programming"],
  "industry": "Technology",
  "experience_level": "Mid-level",
  "business_stage": "Growth",
  "country": "Nigeria",
  "state_province": "Lagos",
  "city": "Lagos"
}
```

## Frontend Integration

The frontend registration form now includes all new fields:

- **Basic Information**: Full Name, Email
- **Password**: Password, Confirm Password
- **Professional Info**: Education Level, Job Title
- **Business Info**: Industry, Experience Level, Business Stage
- **Geographic Location**: Country, State/Province, City
- **Topics of Interest**: Multi-select learning interests

## Validation Rules

### Required Fields
- Email (unique)
- Full Name
- Password
- Topics of Interest (at least one)

### Optional Fields
- Education Level
- Job Title
- Industry
- Experience Level
- Business Stage
- Country
- State/Province
- City

## Data Types

- **Industry**: Predefined African market sectors
- **Experience Level**: Entry-level, Mid-level, Senior, Expert
- **Business Stage**: Startup, Growth, Scale-up, Established
- **Topics of Interest**: JSON array of selected topics
- **Geographic Data**: String fields for location information

## Migration Notes

If upgrading from a previous version:

1. **Backup existing data** before running schema updates
2. **Run the new schema** to add missing columns
3. **Update existing records** with default values if needed
4. **Test registration flow** with new fields
5. **Verify profile updates** work correctly

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure MySQL is running and credentials are correct
2. **Port Conflicts**: Check that port 3002 is available for the backend
3. **CORS Issues**: Verify frontend and backend URLs are properly configured
4. **Field Validation**: Ensure all required fields are provided during registration

### Error Messages

- `User already exists`: Email is already registered
- `Failed to register user`: Database connection or validation error
- `Invalid credentials`: Login authentication failed
- `Failed to update profile`: Profile update permission or validation error

## Security Considerations

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Role-based access control
- Input validation on all fields
- SQL injection prevention with parameterized queries