# Environment Configuration Guide

## Overview
This guide addresses the API configuration issues found in the Forward Africa platform and provides solutions for proper environment variable management.

## Issues Found

### 🔴 Critical Issues

1. **Missing Frontend Environment Variables**
   - No `.env.local` file in root directory
   - Frontend using hardcoded API URLs
   - Inconsistent environment variable prefixes

2. **Incomplete Backend Environment File**
   - `backend/.env` file is truncated
   - Missing critical configuration variables
   - No production environment setup

3. **Hardcoded Configuration**
   - API URLs hardcoded in frontend code
   - CORS origins not configurable
   - File upload limits hardcoded

## Solutions

### 1. Frontend Environment Setup

Create a `.env.local` file in the project root:

```bash
# Frontend Environment Variables (Next.js)
NEXT_PUBLIC_API_URL=http://localhost:3002/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DB_HOST=localhost
NEXT_PUBLIC_DB_PORT=3306
NEXT_PUBLIC_DB_NAME=forward_africa_db
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_DEBUG_MODE=true
```

### 2. Backend Environment Setup

Update `backend/.env` with complete configuration:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=forward_africa_db

# Server Configuration
PORT=3002
NODE_ENV=development

# JWT Configuration
JWT_SECRET=f8e9d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:3003,http://localhost:3004,http://localhost:3005

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Redis Configuration
REDIS_ENABLED=false
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Security Configuration
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret-key
COOKIE_SECRET=your-cookie-secret-key

# Feature Flags
ENABLE_VIDEO_PROCESSING=true
ENABLE_EMAIL_NOTIFICATIONS=false
ENABLE_AUDIT_LOGGING=true
ENABLE_RATE_LIMITING=true
```

### 3. Production Environment Setup

Create `.env.production` files for production deployment:

**Frontend (.env.production):**
```bash
NEXT_PUBLIC_API_URL=https://api.forwardafrica.com/api
NEXT_PUBLIC_APP_URL=https://forwardafrica.com
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_DEBUG_MODE=false
```

**Backend (.env.production):**
```bash
NODE_ENV=production
PORT=3002
DB_HOST=your-production-db-host
DB_USER=your-production-db-user
DB_PASSWORD=your-production-db-password
DB_NAME=forward_africa_db_prod
JWT_SECRET=your-production-jwt-secret
CORS_ORIGIN=https://forwardafrica.com,https://www.forwardafrica.com
REDIS_ENABLED=true
REDIS_HOST=your-redis-host
REDIS_PASSWORD=your-redis-password
```

## Configuration Files Created

1. **`frontend.env.example`** - Frontend environment template
2. **`backend/env.complete.example`** - Complete backend environment template
3. **Updated `src/lib/mysql.ts`** - Fixed environment variable usage
4. **Updated `src/lib/api.ts`** - Removed hardcoded URLs
5. **Updated `backend/server.js`** - Added environment variable support

## Implementation Steps

### Step 1: Create Environment Files
```bash
# Copy example files
cp frontend.env.example .env.local
cp backend/env.complete.example backend/.env

# Edit files with your actual values
nano .env.local
nano backend/.env
```

### Step 2: Update Configuration
The following files have been updated to use environment variables:

- ✅ `src/lib/mysql.ts` - Fixed API URL configuration
- ✅ `src/lib/api.ts` - Removed hardcoded URLs
- ✅ `backend/server.js` - Added CORS and file upload configuration

### Step 3: Test Configuration
```bash
# Test frontend
npm run dev

# Test backend
cd backend
npm run dev
```

## Security Considerations

1. **Never commit `.env` files to version control**
2. **Use strong, unique secrets for production**
3. **Rotate JWT secrets regularly**
4. **Use environment-specific configurations**
5. **Validate all environment variables on startup**

## Environment Variable Validation

Add this validation to your backend startup:

```javascript
// Validate required environment variables
const requiredEnvVars = [
  'JWT_SECRET',
  'DB_HOST',
  'DB_USER',
  'DB_NAME'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`❌ Missing required environment variable: ${varName}`);
    process.exit(1);
  }
});
```

## Troubleshooting

### Common Issues

1. **API calls failing**
   - Check `NEXT_PUBLIC_API_URL` in frontend
   - Verify backend server is running
   - Check CORS configuration

2. **Database connection errors**
   - Verify database credentials
   - Check database server is running
   - Validate connection string

3. **File upload issues**
   - Check `MAX_FILE_SIZE` configuration
   - Verify upload directory permissions
   - Check file type restrictions

### Debug Commands

```bash
# Check environment variables
node -e "console.log(process.env)"

# Test database connection
node backend/test-db-connection.js

# Test API endpoints
curl http://localhost:3002/api/health
```

## Next Steps

1. ✅ Create environment files
2. ✅ Update configuration code
3. 🔄 Test all functionality
4. 🔄 Deploy to staging environment
5. 🔄 Deploy to production environment

## Files Modified

- `src/lib/mysql.ts` - Fixed environment variable usage
- `src/lib/api.ts` - Removed hardcoded URLs
- `backend/server.js` - Added environment variable support
- `frontend.env.example` - Created frontend template
- `backend/env.complete.example` - Created backend template

## Status

- ✅ **Environment templates created**
- ✅ **Code updated to use environment variables**
- ✅ **Hardcoded URLs removed**
- 🔄 **Ready for testing and deployment**