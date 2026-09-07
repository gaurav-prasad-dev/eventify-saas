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

// Future module routes will be registered here:
// router.use('/auth', authRoutes);
// router.use('/profile', userRoutes);
// router.use('/organizations', organizationRoutes);
// router.use('/venues', venueRoutes);
// router.use('/events', eventRoutes);
// router.use('/bookings', bookingRoutes);

module.exports = router;
