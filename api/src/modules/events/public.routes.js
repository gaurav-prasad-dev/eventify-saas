const express = require('express');
const eventController = require('./event.controller');

const router = express.Router();

// =========================================================================
// PUBLIC MARKETPLACE EVENT DISCOVERY (No Auth or Tenant Context Required)
// =========================================================================

/**
 * GET /api/v1/public/events
 * Query params: search, category, city, isFeatured, page, limit
 */
router.get('/', eventController.getPublicEvents);

/**
 * GET /api/v1/public/events/:idOrSlug
 * Public event profile with venue details, showtimes, and ticket tiers
 */
router.get('/:idOrSlug', eventController.getPublicEventDetails);

module.exports = router;
