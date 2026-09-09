const express = require('express');
const publicEventController = require('./publicEvent.controller');

const router = express.Router();

/**
 * Public Marketplace Discovery Routes (No Login Required)
 */

// Browse & Search Published Events
router.get('/', publicEventController.getPublishedEvents);

// Get Event Profile by ID or Slug
router.get('/:identifier', publicEventController.getPublishedEventById);

// Get Live Real-Time Seat Map with statuses (AVAILABLE, LOCKED, BOOKED)
router.get('/:id/sessions/:sessionId/seats', publicEventController.getSessionSeatMap);

// Get Ticket Pricing Tiers
router.get('/:id/sessions/:sessionId/tickets', publicEventController.getSessionTickets);

module.exports = router;
