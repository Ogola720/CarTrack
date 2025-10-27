const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

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
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});