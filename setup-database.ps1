# Forward Africa Database Setup Script (PowerShell)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Forward Africa Database Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check MySQL Installation
Write-Host "Step 1: Checking MySQL Installation..." -ForegroundColor Yellow
Write-Host ""

$mysqlPath = $null

# Check common MySQL installation paths
$possiblePaths = @(
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
    "C:\Program Files\MySQL\MySQL Server 5.7\bin\mysql.exe",
    "C:\xampp\mysql\bin\mysql.exe",
    "C:\wamp64\bin\mysql\mysql8.0.31\bin\mysql.exe",
    "C:\wamp\bin\mysql\mysql8.0.31\bin\mysql.exe"
)

foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $mysqlPath = $path
        break
    }
}

# Check if mysql is in PATH
if (-not $mysqlPath) {
    try {
        $mysqlVersion = mysql --version 2>$null
        if ($mysqlVersion) {
            $mysqlPath = "mysql"
        }
    } catch {
        # MySQL not in PATH
    }
}

if (-not $mysqlPath) {
    Write-Host "ERROR: MySQL not found!" -ForegroundColor Red
    Write-Host "Please install MySQL from: https://dev.mysql.com/downloads/installer/" -ForegroundColor Red
    Write-Host "Or if you have XAMPP/WAMP, make sure MySQL is running." -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative: You can manually create the database using the SQL script." -ForegroundColor Yellow
    Write-Host "1. Open MySQL Workbench or phpMyAdmin" -ForegroundColor Yellow
    Write-Host "2. Run the contents of database_schema.sql" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to continue with manual setup"
} else {
    Write-Host "MySQL found at: $mysqlPath" -ForegroundColor Green
    Write-Host ""

    # Ask for MySQL credentials
    $mysqlUser = Read-Host "Enter MySQL username (default: root)"
    if (-not $mysqlUser) { $mysqlUser = "root" }

    $mysqlPassword = Read-Host "Enter MySQL password" -AsSecureString
    $mysqlPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($mysqlPassword))

    Write-Host "Creating database..." -ForegroundColor Yellow

    # Create a temporary file with the password
    $tempFile = [System.IO.Path]::GetTempFileName()
    "USE mysql;`nCREATE DATABASE IF NOT EXISTS forward_africa_db;`nUSE forward_africa_db;" | Out-File -FilePath $tempFile -Encoding ASCII

    try {
        if ($mysqlPath -eq "mysql") {
            # MySQL in PATH
            Get-Content database_schema.sql | mysql -u $mysqlUser -p$mysqlPasswordPlain
        } else {
            # Full path to MySQL
            Get-Content database_schema.sql | & $mysqlPath -u $mysqlUser -p$mysqlPasswordPlain
        }
        Write-Host "Database created successfully!" -ForegroundColor Green
    } catch {
        Write-Host "ERROR: Failed to create database" -ForegroundColor Red
        Write-Host "You can manually run the SQL script in MySQL Workbench or phpMyAdmin" -ForegroundColor Yellow
    } finally {
        # Clean up temp file
        if (Test-Path $tempFile) { Remove-Item $tempFile }
    }
}

Write-Host ""
Write-Host "Step 2: Setting up Backend Server..." -ForegroundColor Yellow
Write-Host ""

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js not found!" -ForegroundColor Red
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Red
    Read-Host "Press Enter to continue"
    exit 1
}

# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install backend dependencies" -ForegroundColor Red
    Read-Host "Press Enter to continue"
    exit 1
}
Set-Location ..

Write-Host ""
Write-Host "Step 3: Creating environment files..." -ForegroundColor Yellow
Write-Host ""

# Create backend .env file
Write-Host "Creating backend .env file..." -ForegroundColor Yellow
$backendEnvContent = @"
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=forward_africa_db

# Server Configuration
PORT=3001
NODE_ENV=development
"@

$backendEnvContent | Out-File -FilePath "backend\.env" -Encoding UTF8

# Create frontend .env file
Write-Host "Creating frontend .env file..." -ForegroundColor Yellow
$frontendEnvContent = @"
# Database Configuration
REACT_APP_DB_HOST=localhost
REACT_APP_DB_PORT=3306
REACT_APP_DB_USER=root
REACT_APP_DB_PASSWORD=your_mysql_password
REACT_APP_DB_NAME=forward_africa_db

# API Configuration
REACT_APP_API_URL=http://localhost:3001/api
"@

$frontendEnvContent | Out-File -FilePath ".env" -Encoding UTF8

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Edit the .env files with your MySQL password" -ForegroundColor White
Write-Host "2. Start the backend server: cd backend; npm run dev" -ForegroundColor White
Write-Host "3. Start the frontend: npm run dev" -ForegroundColor White
Write-Host "4. Open http://localhost:5173 in your browser" -ForegroundColor White
Write-Host "5. Look for the 'DB Test' button in the bottom-right corner" -ForegroundColor White
Write-Host ""
Write-Host "If MySQL is not installed, you can:" -ForegroundColor Yellow
Write-Host "- Install XAMPP (includes MySQL): https://www.apachefriends.org/" -ForegroundColor White
Write-Host "- Install WAMP (includes MySQL): https://www.wampserver.com/" -ForegroundColor White
Write-Host "- Install MySQL directly: https://dev.mysql.com/downloads/installer/" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to exit"