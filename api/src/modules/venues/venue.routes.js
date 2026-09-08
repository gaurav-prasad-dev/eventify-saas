const express = require('express');
const authMiddleware = require('../../shared/middleware/auth.middleware');
const tenantMiddleware = require('../../shared/middleware/tenant.middleware');
const authorize = require('../../shared/middleware/authorize.middleware');
const validate = require('../../shared/middleware/validate.middleware');
const { ROLES } = require('../../shared/constants/roles');

const {
  createVenueSchema,
  updateVenueSchema,
  toggleVenueStatusSchema,
  createContractSchema,
  updateContractSchema,
  recordPaymentSchema,
  createLayoutSchema,
  batchSeatsSchema,
} = require('./venue.validation');

const venueController = require('./venue.controller');

const router = express.Router();

// All venue routes require valid authentication & organization context (multi-tenant)
router.use(authMiddleware);
router.use(tenantMiddleware);

const WRITE_ROLES = [ROLES.SUPER_ADMIN, ROLES.ORGANIZER_OWNER, ROLES.ORGANIZER_ADMIN];
const READ_ROLES = [...WRITE_ROLES, ROLES.EVENT_MANAGER];

// =========================================================================
// 1. VENUE MASTER PROFILE ENDPOINTS
// =========================================================================

router.post(
  '/',
  authorize(...WRITE_ROLES),
  validate(createVenueSchema),
  venueController.createVenue
);

router.get(
  '/',
  authorize(...READ_ROLES),
  venueController.getVenues
);

router.get(
  '/:id',
  authorize(...READ_ROLES),
  venueController.getVenueById
);

router.patch(
  '/:id',
  authorize(...WRITE_ROLES),
  validate(updateVenueSchema),
  venueController.updateVenue
);

router.patch(
  '/:id/status',
  authorize(...WRITE_ROLES),
  validate(toggleVenueStatusSchema),
  venueController.setVenueStatus
);

router.delete(
  '/:id',
  authorize(...WRITE_ROLES),
  venueController.deleteVenue
);

// =========================================================================
// 2. PER-EVENT COMMERCIAL DEALS / CONTRACTS
// =========================================================================

router.post(
  '/:id/contracts',
  authorize(...WRITE_ROLES),
  validate(createContractSchema),
  venueController.createContract
);

router.get(
  '/:id/contracts',
  authorize(...READ_ROLES),
  venueController.getContracts
);

router.get(
  '/:id/contracts/:contractId',
  authorize(...READ_ROLES),
  venueController.getContractById
);

router.patch(
  '/:id/contracts/:contractId',
  authorize(...WRITE_ROLES),
  validate(updateContractSchema),
  venueController.updateContract
);

router.patch(
  '/:id/contracts/:contractId/payment',
  authorize(...WRITE_ROLES),
  validate(recordPaymentSchema),
  venueController.recordPayment
);

// =========================================================================
// 3. SEATING LAYOUT & VISUAL SEAT ENGINE
// =========================================================================

router.post(
  '/:id/layouts',
  authorize(...WRITE_ROLES),
  validate(createLayoutSchema),
  venueController.createLayout
);

router.get(
  '/:id/layouts',
  authorize(...READ_ROLES),
  venueController.getLayouts
);

router.post(
  '/:id/layouts/:layoutId/seats/batch',
  authorize(...WRITE_ROLES),
  validate(batchSeatsSchema),
  venueController.batchCreateSeats
);

router.get(
  '/:id/layouts/:layoutId/seats',
  authorize(...READ_ROLES),
  venueController.getLayoutSeats
);

module.exports = router;
