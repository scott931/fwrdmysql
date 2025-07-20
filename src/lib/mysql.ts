// MySQL Database Configuration
// Note: In a production React app, you would typically use a backend API
// This is for demonstration purposes - you'll need a backend server

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export const dbConfig: DatabaseConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root', // Change this to your MySQL username
  password: '', // Change this to your MySQL password
  database: 'forward_africa_db'
};

// API Base URL for backend communication
export const API_BASE_URL = 'http://localhost:3002/api'; // Your backend server URL

// Database connection string (for reference)
export const getConnectionString = () => {
  return `mysql://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`;
};

// Environment variables (create a .env file in your project root)
// REACT_APP_DB_HOST=localhost
// REACT_APP_DB_PORT=3306
// REACT_APP_DB_USER=root
// REACT_APP_DB_PASSWORD=your_password
// REACT_APP_DB_NAME=forward_africa_db
// REACT_APP_API_URL=http://localhost:3001/api

export const getEnvConfig = () => {
  return {
    host: process.env.REACT_APP_DB_HOST || 'localhost',
    port: parseInt(process.env.REACT_APP_DB_PORT || '3306'),
    user: process.env.REACT_APP_DB_USER || 'root',
    password: process.env.REACT_APP_DB_PASSWORD || '',
    database: process.env.REACT_APP_DB_NAME || 'forward_africa_db',
    apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001/api'
  };
};