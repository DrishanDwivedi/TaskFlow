const express = require('express');
const router = express.Router();
const { pool, getEngine } = require('../config/db');

router.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({
      status: 'OK',
      service: 'taskflow-backend',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: 'connected',
      engine: getEngine()
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      service: 'taskflow-backend',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

module.exports = router;
