# Forward Africa Learning Platform - Database Setup Guide

This guide will help you set up the MySQL database and connect it to your React application.

## 📋 Prerequisites

- MySQL Server (version 8.0 or higher)
- Node.js (version 16 or higher)
- npm or yarn package manager

## 🗄️ Database Setup

### 1. Install MySQL

**Windows:**
- Download MySQL Installer from [mysql.com](https://dev.mysql.com/downloads/installer/)
- Run the installer and follow the setup wizard
- Remember your root password

**macOS:**
```bash
brew install mysql
brew services start mysql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

### 2. Create Database and Tables

1. **Open MySQL Command Line Client** or use a GUI tool like MySQL Workbench

2. **Run the SQL Script:**
```bash
mysql -u root -p < database_schema.sql
```

Or copy and paste the contents of `database_schema.sql` into your MySQL client.

3. **Verify the setup:**
```sql
USE forward_africa_db;
SHOW TABLES;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_courses FROM courses;
```

## 🚀 Backend Server Setup

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create Environment File
Create a `.env` file in the backend directory:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=forward_africa_db

# Server Configuration
PORT=3001
NODE_ENV=development
```

### 4. Start the Backend Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3001`

### 5. Test the API
```bash
# Health check
curl http://localhost:3001/api/health

# Get all courses
curl http://localhost:3001/api/courses

# Get featured courses
curl http://localhost:3001/api/courses/featured
```

## 🔗 Frontend Integration

### 1. Update Environment Variables
Create a `.env` file in your React project root:
```env
# Database Configuration
REACT_APP_DB_HOST=localhost
REACT_APP_DB_PORT=3306
REACT_APP_DB_USER=root
REACT_APP_DB_PASSWORD=your_mysql_password
REACT_APP_DB_NAME=forward_africa_db

# API Configuration
REACT_APP_API_URL=http://localhost:3001/api
```

### 2. Update Database Configuration
Edit `src/lib/mysql.ts` to match your MySQL credentials:
```typescript
export const dbConfig: DatabaseConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root', // Your MySQL username
  password: 'your_mysql_password', // Your MySQL password
  database: 'forward_africa_db'
};
```

### 3. Test the Connection
The API service is already configured in `src/lib/api.ts`. You can test it by:

```typescript
import { api } from '../lib/api';

// Test API calls
const testAPI = async () => {
  try {
    const courses = await api.course.getAllCourses();
    console.log('Courses:', courses);

    const featured = await api.course.getFeaturedCourses();
    console.log('Featured courses:', featured);
  } catch (error) {
    console.error('API Error:', error);
  }
};
```

## 📊 Database Schema Overview

### Tables Created:

1. **users** - User accounts and profiles
2. **categories** - Course categories
3. **instructors** - Course instructors
4. **courses** - Course information
5. **lessons** - Individual course lessons
6. **user_progress** - User learning progress
7. **certificates** - Course completion certificates
8. **achievements** - User achievements and badges

### Sample Data Included:
- 5 users with different roles
- 5 course categories
- 5 instructors (including Ray Dalio, Elon Musk, etc.)
- 5 courses with lessons
- Sample user progress and certificates
- Sample achievements

## 🔧 API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/email/:email` - Get user by email
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/featured` - Get featured courses
- `GET /api/courses/:id` - Get course by ID
- `GET /api/courses/category/:categoryId` - Get courses by category
- `POST /api/courses` - Create new course

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID

### Instructors
- `GET /api/instructors` - Get all instructors
- `GET /api/instructors/:id` - Get instructor by ID

### User Progress
- `GET /api/progress/:userId/:courseId` - Get user progress for course
- `GET /api/progress/:userId` - Get all user progress
- `POST /api/progress` - Create progress record
- `PUT /api/progress/:userId/:courseId` - Update progress

### Certificates
- `GET /api/certificates/:userId` - Get user certificates
- `GET /api/certificates/verify/:code` - Verify certificate

### Achievements
- `GET /api/achievements/:userId` - Get user achievements

### Analytics
- `GET /api/analytics/platform` - Get platform statistics

## 🛠️ Troubleshooting

### Common Issues:

1. **Database Connection Failed**
   - Verify MySQL is running
   - Check credentials in `.env` file
   - Ensure database exists

2. **CORS Errors**
   - Backend CORS is configured for development
   - Check if frontend and backend ports match

3. **API Endpoints Not Found**
   - Ensure backend server is running
   - Check API_BASE_URL in frontend configuration

4. **Permission Denied**
   - Check MySQL user permissions
   - Ensure user has access to the database

### Useful Commands:

```bash
# Check MySQL status
sudo systemctl status mysql

# Connect to MySQL
mysql -u root -p

# Show databases
SHOW DATABASES;

# Use database
USE forward_africa_db;

# Show tables
SHOW TABLES;

# Check table structure
DESCRIBE users;
DESCRIBE courses;
```

## 🚀 Production Deployment

For production deployment:

1. **Use Environment Variables** for all sensitive data
2. **Set up a production MySQL instance**
3. **Configure proper CORS settings**
4. **Add authentication and authorization**
5. **Set up SSL/TLS certificates**
6. **Configure proper logging and monitoring**

## 📝 Next Steps

1. **Test all API endpoints** using Postman or curl
2. **Integrate API calls** into your React components
3. **Add error handling** for API failures
4. **Implement user authentication**
5. **Add data validation** on both frontend and backend
6. **Set up automated backups** for the database

## 🆘 Support

If you encounter any issues:
1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure MySQL server is running
4. Check network connectivity between frontend and backend

The database is now ready to power your Forward Africa Learning Platform! 🎉