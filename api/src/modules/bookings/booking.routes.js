const express = require('express');
const authMiddleware = require('../../shared/middleware/auth.middleware');
const validate = require('../../shared/middleware/validate.middleware');
const {
  lockSeatsSchema,
  releaseSeatsSchema,
  reserveBookingSchema,
} = require('./booking.validation');
const bookingController = require('./booking.controller');

const router = express.Router();

// All customer booking operations require authentication (Customer Login Required)
router.use(authMiddleware);

// Temporarily lock seats (5-minute hold)
router.post('/lock', validate(lockSeatsSchema), bookingController.lockSeats);

// Release locked seats
router.post('/release-seats', validate(releaseSeatsSchema), bookingController.releaseSeats);

// Create PENDING booking reservation (holding seats & stock)
router.post('/reserve', validate(reserveBookingSchema), bookingController.reserveBooking);

// Get customer booking history
router.get('/my-bookings', bookingController.getMyBookings);

// Get single booking reservation with remaining countdown timer
router.get('/:id', bookingController.getBookingById);

// Customer cancels or releases reservation early
router.delete('/:id/release', bookingController.releaseBooking);

module.exports = router;
