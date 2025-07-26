#!/bin/bash

# Video Content Management System Setup Script
# Forward Africa Learning Platform

set -e

echo "🚀 Setting up Video Content Management System..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Check operating system
OS="$(uname -s)"
case "${OS}" in
    Linux*)     MACHINE=Linux;;
    Darwin*)    MACHINE=Mac;;
    CYGWIN*)    MACHINE=Cygwin;;
    MINGW*)     MACHINE=MinGw;;
    *)          MACHINE="UNKNOWN:${OS}"
esac

print_status "Detected OS: $MACHINE"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install FFmpeg
install_ffmpeg() {
    print_status "Installing FFmpeg..."

    if command_exists ffmpeg; then
        print_success "FFmpeg is already installed"
        return
    fi

    case $MACHINE in
        Linux)
            if command_exists apt-get; then
                sudo apt-get update
                sudo apt-get install -y ffmpeg
            elif command_exists yum; then
                sudo yum install -y ffmpeg
            elif command_exists dnf; then
                sudo dnf install -y ffmpeg
            else
                print_error "Unsupported Linux package manager"
                exit 1
            fi
            ;;
        Mac)
            if command_exists brew; then
                brew install ffmpeg
            else
                print_error "Homebrew is required to install FFmpeg on macOS"
                print_status "Please install Homebrew first: https://brew.sh/"
                exit 1
            fi
            ;;
        *)
            print_error "FFmpeg installation not supported on this OS"
            print_status "Please install FFmpeg manually: https://ffmpeg.org/download.html"
            exit 1
            ;;
    esac

    print_success "FFmpeg installed successfully"
}

# Function to install Redis
install_redis() {
    print_status "Installing Redis..."

    if command_exists redis-server; then
        print_success "Redis is already installed"
        return
    fi

    case $MACHINE in
        Linux)
            if command_exists apt-get; then
                sudo apt-get update
                sudo apt-get install -y redis-server
                sudo systemctl enable redis-server
                sudo systemctl start redis-server
            elif command_exists yum; then
                sudo yum install -y redis
                sudo systemctl enable redis
                sudo systemctl start redis
            elif command_exists dnf; then
                sudo dnf install -y redis
                sudo systemctl enable redis
                sudo systemctl start redis
            else
                print_error "Unsupported Linux package manager"
                exit 1
            fi
            ;;
        Mac)
            if command_exists brew; then
                brew install redis
                brew services start redis
            else
                print_error "Homebrew is required to install Redis on macOS"
                exit 1
            fi
            ;;
        *)
            print_error "Redis installation not supported on this OS"
            print_status "Please install Redis manually: https://redis.io/download"
            exit 1
            ;;
    esac

    print_success "Redis installed and started successfully"
}

# Function to check Node.js
check_nodejs() {
    print_status "Checking Node.js..."

    if ! command_exists node; then
        print_error "Node.js is not installed"
        print_status "Please install Node.js 16+ from: https://nodejs.org/"
        exit 1
    fi

    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        print_error "Node.js version 16+ is required. Current version: $(node -v)"
        exit 1
    fi

    print_success "Node.js $(node -v) is installed"
}

# Function to check MySQL
check_mysql() {
    print_status "Checking MySQL..."

    if ! command_exists mysql; then
        print_error "MySQL is not installed"
        print_status "Please install MySQL first"
        exit 1
    fi

    print_success "MySQL is installed"
}

# Function to setup database
setup_database() {
    print_status "Setting up database schema..."

    if [ ! -f "video_content_management_schema.sql" ]; then
        print_error "Database schema file not found"
        exit 1
    fi

    # Read database configuration
    read -p "Enter MySQL username: " DB_USER
    read -s -p "Enter MySQL password: " DB_PASSWORD
    echo
    read -p "Enter database name (default: forward_africa_db): " DB_NAME
    DB_NAME=${DB_NAME:-forward_africa_db}

    # Test database connection
    if ! mysql -u "$DB_USER" -p"$DB_PASSWORD" -e "USE $DB_NAME;" 2>/dev/null; then
        print_error "Cannot connect to database or database does not exist"
        exit 1
    fi

    # Run schema
    mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < video_content_management_schema.sql

    print_success "Database schema setup completed"
}

# Function to install backend dependencies
install_backend_deps() {
    print_status "Installing backend dependencies..."

    if [ ! -d "backend" ]; then
        print_error "Backend directory not found"
        exit 1
    fi

    cd backend

    # Install dependencies
    npm install fluent-ffmpeg aws-sdk google-cloud-speech google-cloud-storage bull redis sharp exif-parser mediainfo node-cron formidable

    print_success "Backend dependencies installed"
    cd ..
}

# Function to create environment file
create_env_file() {
    print_status "Creating environment configuration..."

    if [ -f ".env" ]; then
        print_warning ".env file already exists. Backing up..."
        cp .env .env.backup
    fi

    cat > .env << EOF
# Database Configuration
DB_HOST=localhost
DB_USER=forward_africa_user
DB_PASSWORD=your_password_here
DB_NAME=forward_africa_db
DB_PORT=3306

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production

# Server Configuration
PORT=3002
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Google Cloud Configuration (for speech-to-text)
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json

# AWS Configuration (optional, for cloud storage)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1

# Video Processing Configuration
MAX_VIDEO_SIZE=500MB
SUPPORTED_VIDEO_FORMATS=mp4,mov,avi,mkv
FFMPEG_PATH=/usr/bin/ffmpeg
FFPROBE_PATH=/usr/bin/ffprobe
EOF

    print_success "Environment file created (.env)"
    print_warning "Please update the .env file with your actual configuration"
}

# Function to create upload directories
create_upload_dirs() {
    print_status "Creating upload directories..."

    mkdir -p backend/uploads/videos
    mkdir -p backend/uploads/transcoded
    mkdir -p backend/uploads/subtitles
    mkdir -p backend/uploads/thumbnails
    mkdir -p backend/uploads/avatars
    mkdir -p backend/uploads/course-media
    mkdir -p backend/uploads/certificates

    print_success "Upload directories created"
}

# Function to test installation
test_installation() {
    print_status "Testing installation..."

    # Test FFmpeg
    if ffmpeg -version >/dev/null 2>&1; then
        print_success "FFmpeg is working"
    else
        print_error "FFmpeg test failed"
    fi

    # Test Redis
    if redis-cli ping >/dev/null 2>&1; then
        print_success "Redis is working"
    else
        print_error "Redis test failed"
    fi

    # Test Node.js
    if node --version >/dev/null 2>&1; then
        print_success "Node.js is working"
    else
        print_error "Node.js test failed"
    fi

    # Test MySQL
    if mysql --version >/dev/null 2>&1; then
        print_success "MySQL is working"
    else
        print_error "MySQL test failed"
    fi
}

# Function to create startup script
create_startup_script() {
    print_status "Creating startup script..."

    cat > start-video-system.sh << 'EOF'
#!/bin/bash

# Video Content Management System Startup Script

echo "Starting Video Content Management System..."

# Check if Redis is running
if ! redis-cli ping >/dev/null 2>&1; then
    echo "Starting Redis..."
    if command -v systemctl >/dev/null 2>&1; then
        sudo systemctl start redis-server
    elif command -v brew >/dev/null 2>&1; then
        brew services start redis
    fi
fi

# Start backend server
cd backend
npm start
EOF

    chmod +x start-video-system.sh
    print_success "Startup script created (start-video-system.sh)"
}

# Function to display next steps
display_next_steps() {
    echo
    echo "🎉 Video Content Management System Setup Complete!"
    echo "================================================"
    echo
    echo "Next steps:"
    echo "1. Update the .env file with your actual configuration"
    echo "2. Set up Google Cloud credentials for speech-to-text (optional)"
    echo "3. Configure AWS credentials for cloud storage (optional)"
    echo "4. Start the system: ./start-video-system.sh"
    echo
    echo "API Documentation:"
    echo "- Video upload: POST /api/video-content/upload/:lessonId"
    echo "- Status check: GET /api/video-content/status/:videoAssetId"
    echo "- Workflow management: GET /api/video-content/workflow/:contentType/:contentId"
    echo
    echo "Frontend Components:"
    echo "- VideoUpload: src/components/VideoUpload.tsx"
    echo "- VideoProcessingStatus: src/components/VideoProcessingStatus.tsx"
    echo
    echo "For more information, see: VIDEO_CONTENT_MANAGEMENT_IMPLEMENTATION.md"
    echo
}

# Main installation process
main() {
    print_status "Starting installation process..."

    # Install system dependencies
    install_ffmpeg
    install_redis

    # Check prerequisites
    check_nodejs
    check_mysql

    # Setup application
    setup_database
    install_backend_deps
    create_env_file
    create_upload_dirs
    create_startup_script

    # Test installation
    test_installation

    # Display next steps
    display_next_steps
}

# Run main function
main "$@"