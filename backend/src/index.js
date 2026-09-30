require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDb } = require('./config/db');

const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Mount Health check endpoint
app.use('/', healthRoutes);

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Global 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize DB and start server
const startServer = async () => {
  try {
    // Attempt database initialization
    await initDb();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`TaskFlow Backend running on port ${PORT}`);
      console.log(`Health check available at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server due to DB connection issue:', error.message);
    // Still start Express server so health check endpoint can report db status
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`TaskFlow Backend running in degraded mode on port ${PORT} (Database pending)`);
    });
  }
};

startServer();
