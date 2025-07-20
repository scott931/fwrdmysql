@echo off
echo ========================================
echo Forward Africa Database Setup Script
echo ========================================
echo.

echo Step 1: Setting up MySQL Database...
echo Please make sure MySQL is installed and running.
echo.

REM Check if MySQL is available
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: MySQL is not installed or not in PATH
    echo Please install MySQL first: https://dev.mysql.com/downloads/installer/
    pause
    exit /b 1
)

echo MySQL found! Creating database...
mysql -u root -p < database_schema.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to create database
    echo Please check your MySQL credentials and try again
    pause
    exit /b 1
)

echo.
echo Step 2: Setting up Backend Server...
echo.

REM Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed
    echo Please install Node.js first: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found! Installing backend dependencies...
cd backend
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo Step 3: Creating environment files...
echo.

REM Create backend .env file
echo Creating backend .env file...
(
echo # Database Configuration
echo DB_HOST=localhost
echo DB_PORT=3306
echo DB_USER=root
echo DB_PASSWORD=your_mysql_password
echo DB_NAME=forward_africa_db
echo.
echo # Server Configuration
echo PORT=3001
echo NODE_ENV=development
) > backend\.env

REM Create frontend .env file
echo Creating frontend .env file...
(
echo # Database Configuration
echo REACT_APP_DB_HOST=localhost
echo REACT_APP_DB_PORT=3306
echo REACT_APP_DB_USER=root
echo REACT_APP_DB_PASSWORD=your_mysql_password
echo REACT_APP_DB_NAME=forward_africa_db
echo.
echo # API Configuration
echo REACT_APP_API_URL=http://localhost:3001/api
) > .env

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Edit the .env files with your MySQL password
echo 2. Start the backend server: cd backend ^& npm run dev
echo 3. Start the frontend: npm run dev
echo 4. Open http://localhost:5173 in your browser
echo 5. Look for the "DB Test" button in the bottom-right corner
echo.
echo Press any key to exit...
pause >nul