const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3003;

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3003', 'http://localhost:3004', 'http://localhost:3005'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept']
}));

// Handle preflight requests
app.options('*', cors());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Test server is running' });
});

// Mock analytics endpoint
app.get('/api/analytics/platform', (req, res) => {
  res.json({
    totalUsers: 1250,
    totalCourses: 45,
    totalLessons: 320,
    activeUsers: 89,
    completionRate: 78.5,
    averageRating: 4.6,
    totalRevenue: 12500,
    monthlyGrowth: 12.5
  });
});

// Mock featured courses endpoint
app.get('/api/courses/featured', (req, res) => {
  res.json([
    {
      id: '1',
      title: 'Business Fundamentals for Entrepreneurs',
      description: 'Learn the essential principles of business management and entrepreneurship.',
      thumbnail: '/images/placeholder-course.jpg',
      instructor: {
        name: 'Dr. Sarah Johnson',
        title: 'Business Professor'
      },
      rating: 4.8,
      students: 1250,
      duration: '8 hours',
      featured: true
    }
  ]);
});

// Mock all courses endpoint
app.get('/api/courses', (req, res) => {
  res.json([
    {
      id: '1',
      title: 'Business Fundamentals for Entrepreneurs',
      description: 'Learn the essential principles of business management and entrepreneurship.',
      thumbnail: '/images/placeholder-course.jpg',
      instructor: {
        name: 'Dr. Sarah Johnson',
        title: 'Business Professor'
      },
      rating: 4.8,
      students: 1250,
      duration: '8 hours',
      featured: true,
      category: 'Business'
    }
  ]);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
  console.log(`🏥 Health check at http://localhost:${PORT}/api/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});