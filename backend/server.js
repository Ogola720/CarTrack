const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

console.log('Starting Japan-Africa Car Arbitrage System...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', PORT);
console.log('Use Mock Data:', process.env.USE_MOCK_DATA);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Database connection
let useFileStorage = false;
if (process.env.USE_MOCK_DATA === 'true') {
  console.log('Using file storage for API');
  useFileStorage = true;
  const FileStorage = require('./models/FileStorage');
  FileStorage.initialize();
} else {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/car-arbitrage')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
      console.log('MongoDB not available, using file storage');
      useFileStorage = true;
      const FileStorage = require('./models/FileStorage');
      FileStorage.initialize();
    });
}

// Routes
app.use('/api/cars', require('./routes/cars'));
app.use('/api/scraping', require('./routes/scraping'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    port: PORT,
    uptime: process.uptime()
  });
});

// Simple root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Japan-Africa Car Arbitrage System API',
    status: 'running',
    endpoints: {
      health: '/health',
      cars: '/api/cars',
      admin: '/api/admin',
      scraping: '/api/scraping'
    }
  });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  
  // Serve static files from frontend build
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Handle 404
app.use('*', (req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(404).json({ error: 'API endpoint not found' });
  } else {
    // For non-API routes, serve the React app
    if (process.env.NODE_ENV === 'production') {
      const path = require('path');
      res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  }
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server successfully started on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});