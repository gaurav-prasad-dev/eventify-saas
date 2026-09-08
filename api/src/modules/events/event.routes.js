const express = require('express');
const authMiddleware = require('../../shared/middleware/auth.middleware');
const tenantMiddleware = require('../../shared/middleware/tenant.middleware');
const authorize = require('../../shared/middleware/authorize.middleware');
const validate = require('../../shared/middleware/validate.middleware');
const { uploadEventMedia } = require('../../shared/middleware/upload.middleware');
const { ROLES } = require('../../shared/constants/roles');

const {
  createEventSchema,
  updateEventSchema,
  createSessionSchema,
  updateSessionSchema,
  createTierSchema,
  updateTierSchema,
} = require('./event.validation');

const eventController = require('./event.controller');

const router = express.Router();

// All event routes require valid authentication & organization context (multi-tenant)
router.use(authMiddleware);
router.use(tenantMiddleware);

const WRITE_ROLES = [ROLES.SUPER_ADMIN, ROLES.ORGANIZER_OWNER, ROLES.ORGANIZER_ADMIN];
const READ_ROLES = [...WRITE_ROLES, ROLES.EVENT_MANAGER];

// =========================================================================
// 1. EVENT MASTER LIFECYCLE ENDPOINTS
// =========================================================================

router.post(
  '/',
  authorize(...WRITE_ROLES),
  validate(createEventSchema),
  eventController.createEvent
);

router.get(
  '/',
  authorize(...READ_ROLES),
  eventController.getEvents
);

router.get(
  '/:id',
  authorize(...READ_ROLES),
  eventController.getEventById
);

router.patch(
  '/:id',
  authorize(...WRITE_ROLES),
  validate(updateEventSchema),
  eventController.updateEvent
);

router.delete(
  '/:id',
  authorize(...WRITE_ROLES),
  eventController.deleteEvent
);

router.patch(
  '/:id/publish',
  authorize(...WRITE_ROLES),
  eventController.publishEvent
);

router.patch(
  '/:id/cancel',
  authorize(...WRITE_ROLES),
  eventController.cancelEvent
);

// =========================================================================
// 2. CLOUDINARY MEDIA UPLOAD ENDPOINT
// =========================================================================

router.post(
  '/:id/images',
  authorize(...WRITE_ROLES),
  uploadEventMedia,
  eventController.uploadMedia
);

// =========================================================================
// 3. EVENT SESSIONS / SHOWTIMES
// =========================================================================

router.post(
  '/:id/sessions',
  authorize(...WRITE_ROLES),
  validate(createSessionSchema),
  eventController.addSession
);

router.get(
  '/:id/sessions',
  authorize(...READ_ROLES),
  eventController.getSessions
);

router.patch(
  '/:id/sessions/:sessionId',
  authorize(...WRITE_ROLES),
  validate(updateSessionSchema),
  eventController.updateSession
);

router.delete(
  '/:id/sessions/:sessionId',
  authorize(...WRITE_ROLES),
  eventController.deleteSession
);

// =========================================================================
// 4. SEAT & TICKET PRICING TIERS
// =========================================================================

router.post(
  '/:id/tiers',
  authorize(...WRITE_ROLES),
  validate(createTierSchema),
  eventController.addTier
);

router.get(
  '/:id/tiers',
  authorize(...READ_ROLES),
  eventController.getTiers
);

router.patch(
  '/:id/tiers/:tierId',
  authorize(...WRITE_ROLES),
  validate(updateTierSchema),
  eventController.updateTier
);

router.delete(
  '/:id/tiers/:tierId',
  authorize(...WRITE_ROLES),
  eventController.deleteTier
);

module.exports = router;
