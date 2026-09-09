const bookingService = require('./booking.service');
const { sendSuccess } = require('../../shared/utils/apiResponse');

class BookingController {
  /**
   * POST /api/v1/bookings/lock
   * Temporarily lock seats for 5 minutes (Customer Login Required)
   */
  async lockSeats(req, res, next) {
    try {
      const { sessionId, seatIds } = req.body;
      const result = await bookingService.lockSeats(req.user.id, sessionId, seatIds, 300);
      return sendSuccess(res, 200, 'Seats temporarily locked for 5 minutes', result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/bookings/release-seats
   * Release locked seats manually
   */
  async releaseSeats(req, res, next) {
    try {
      const { sessionId, seatIds } = req.body;
      const result = await bookingService.releaseSeats(req.user.id, sessionId, seatIds);
      return sendSuccess(res, 200, 'Seats unlocked successfully', result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/bookings/reserve
   * Create PENDING reservation holding seats and inventory
   */
  async reserveBooking(req, res, next) {
    try {
      const booking = await bookingService.reserveBooking(req.user.id, req.body);
      return sendSuccess(res, 201, 'Booking reservation created. Please complete payment within 5 minutes.', booking);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/bookings/:id
   * Get booking reservation details with remaining countdown timer
   */
  async getBookingById(req, res, next) {
    try {
      const booking = await bookingService.getBookingById(req.user.id, req.params.id);
      return sendSuccess(res, 200, 'Booking retrieved successfully', booking);
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/v1/bookings/:id/release
   * Customer cancels or releases reservation early
   */
  async releaseBooking(req, res, next) {
    try {
      const result = await bookingService.releaseBooking(req.user.id, req.params.id);
      return sendSuccess(res, 200, 'Reservation cancelled and seats released', result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/bookings/my-bookings
   * Customer's booking history
   */
  async getMyBookings(req, res, next) {
    try {
      const result = await bookingService.getMyBookings(req.user.id, req.query);
      return sendSuccess(res, 200, 'My bookings retrieved successfully', result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new BookingController();
