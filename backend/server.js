require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { setConnected } = require('./models/dbAdapter');

const app = express();
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/farmDirect';

// Middleware
app.use(cors());
app.use(express.json());

// Attempt MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB.');
    setConnected(true);
  })
  .catch((err) => {
    console.warn('MongoDB connection failed. Starting database in local JSON fallback mode.');
    console.warn(`Connection error detail: ${err.message}`);
    setConnected(false);
  });

// API Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/auth', require('./routes/auth'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const { getConnected } = require('./models/dbAdapter');
  res.json({
    status: 'online',
    databaseMode: getConnected() ? 'MongoDB' : 'JSON Fallback Local Storage',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend assets if built (for production delivery)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

// Start Server
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
