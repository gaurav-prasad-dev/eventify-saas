const express = require('express');
const authMiddleware = require('../../shared/middleware/auth.middleware');
const authorize = require('../../shared/middleware/authorize.middleware');
const validate = require('../../shared/middleware/validate.middleware');
const { ROLES } = require('../../shared/constants/roles');
const { validateTicketSchema } = require('./ticket.validation');
const ticketController = require('./ticket.controller');

const router = express.Router();

// Authentication required for all ticket operations
router.use(authMiddleware);

// 1. Customer Digital Passbook: View all personal event tickets
router.get('/my-tickets', ticketController.getMyTickets);

// 2. Order Confirmation: View all passes generated for a specific booking
router.get('/booking/:bookingId', ticketController.getTicketsByBooking);

// 3. Single Ticket Pass View (Event info, seat info, high-res QR code)
router.get('/:id', ticketController.getTicketById);

// 4. Gate Scanner: Organizer Staff scans QR code at the venue door
router.post(
  '/validate',
  authorize(ROLES.ORGANIZER_STAFF, ROLES.ORGANIZER_ADMIN, ROLES.ORGANIZER_OWNER, ROLES.SUPER_ADMIN),
  validate(validateTicketSchema),
  ticketController.validateTicket
);

module.exports = router;
