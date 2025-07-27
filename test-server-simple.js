const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3002;

// Basic CORS
app.use(cors());

// Basic middleware
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    status: 'running'
  });
});

// Test courses endpoint
app.get('/api/courses', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        title: 'Business Fundamentals',
        description: 'Learn the basics of business',
        instructor: 'John Doe',
        price: 99.99
      },
      {
        id: '2',
        title: 'Marketing Strategy',
        description: 'Advanced marketing techniques',
        instructor: 'Jane Smith',
        price: 149.99
      }
    ],
    message: 'Courses retrieved successfully'
  });
});

// Test categories endpoint
app.get('/api/categories', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: '1', name: 'Business' },
      { id: '2', name: 'Technology' },
      { id: '3', name: 'Marketing' }
    ],
    message: 'Categories retrieved successfully'
  });
});

// Test instructors endpoint
app.get('/api/instructors', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: '1', name: 'John Doe', specialty: 'Business' },
      { id: '2', name: 'Jane Smith', specialty: 'Marketing' }
    ],
    message: 'Instructors retrieved successfully'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple Test Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📚 Courses: http://localhost:${PORT}/api/courses`);
  console.log(`📂 Categories: http://localhost:${PORT}/api/categories`);
  console.log(`👨‍🏫 Instructors: http://localhost:${PORT}/api/instructors`);
});