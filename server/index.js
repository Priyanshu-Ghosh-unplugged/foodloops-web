const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const config = require('./config/config');
const productsRouter = require('./routes/products');
const storesRouter = require('./routes/stores');
const usersRouter = require('./routes/users');
const ordersRouter = require('./routes/orders');

const app = express();
const PORT = config.port;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: config.corsOrigins,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'FoodLoops API is running',
    environment: config.nodeEnv,
    civicConfigured: config.isCivicConfigured(),
    mongodbConfigured: config.isMongoDBConfigured()
  });
});

// API Routes
app.use('/api/products', productsRouter);
app.use('/api/stores', storesRouter);
app.use('/api/users', usersRouter);
app.use('/api/orders', ordersRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: config.isDevelopment() ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

app.listen(PORT, () => {
  console.log(`🚀 FoodLoops API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`🔐 Civic Auth: ${config.isCivicConfigured() ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`🗄️  MongoDB: ${config.isMongoDBConfigured() ? '✅ Connected' : '❌ Not connected'}`);
}); 