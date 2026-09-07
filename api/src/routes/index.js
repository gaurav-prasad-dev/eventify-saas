const express = require('express');
const env = require('../config/env');
const { sendSuccess } = require('../shared/utils/apiResponse');

const router = express.Router();

/**
 * GET /api/v1/health
 * Public healthcheck endpoint
 */
router.get('/health', (req, res) => {
  sendSuccess(res, 200, 'Eventify API is healthy', {
    status: 'UP',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// Module Routes
const authRoutes = require('../modules/auth/auth.routes');
const userRoutes = require('../modules/users/user.routes');

router.use('/auth', authRoutes);
router.use('/profile', userRoutes);

module.exports = router;
