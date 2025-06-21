require('dotenv').config();

const config = {
  // Server Configuration
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // MongoDB Configuration
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/foodloops',
  
  // Civic Auth Configuration
  civicClientId: process.env.CIVIC_CLIENT_ID || '584fc3e9-922e-4b13-95af-cd0a9ea42ba2',
  
  // CORS Configuration
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // JWT Configuration (if needed for additional security)
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // Security
  corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:5173', 'http://localhost:3000'],
  
  // API Configuration
  apiVersion: process.env.API_VERSION || 'v1',
  apiPrefix: process.env.API_PREFIX || '/api',
};

// Validation functions
const isProduction = () => config.nodeEnv === 'production';
const isDevelopment = () => config.nodeEnv === 'development';
const isTest = () => config.nodeEnv === 'test';

const isMongoDBConfigured = () => {
  return !!config.mongodbUri;
};

const isCivicConfigured = () => {
  return !!config.civicClientId;
};

module.exports = {
  ...config,
  isProduction,
  isDevelopment,
  isTest,
  isMongoDBConfigured,
  isCivicConfigured,
}; 