const ticketService = require('./ticket.service');
const { sendSuccess } = require('../../shared/utils/apiResponse');

class TicketController {
  /**
   * GET /api/v1/tickets/my-tickets
   * Retrieve logged-in customer's digital passbook (upcoming & past passes)
   */
  async getMyTickets(req, res, next) {
    try {
      const tickets = await ticketService.getMyTickets(req.user.id, req.query);
      return sendSuccess(res, 200, 'Digital tickets retrieved successfully', tickets);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/tickets/booking/:bookingId
   * Retrieve all digital tickets for a confirmed booking
   */
  async getTicketsByBooking(req, res, next) {
    try {
      const tickets = await ticketService.getTicketsByBookingId(req.params.bookingId, req.user.id);
      return sendSuccess(res, 200, 'Booking digital passes retrieved successfully', tickets);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/tickets/:id
   * Retrieve single ticket pass with full QR code and event metadata
   */
  async getTicketById(req, res, next) {
    try {
      const ticket = await ticketService.getTicketById(req.params.id, req.user.id);
      return sendSuccess(res, 200, 'Ticket details retrieved successfully', ticket);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/tickets/validate
   * Venue Gate Staff Check-In: Scan QR code and admit attendee
   */
  async validateTicket(req, res, next) {
    try {
      const { qrData, sessionId } = req.body;
      const result = await ticketService.validateAndCheckIn(qrData, req.user, sessionId);
      return sendSuccess(res, 200, result.message, result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new TicketController();
