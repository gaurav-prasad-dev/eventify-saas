const express = require('express');
const authMiddleware = require('../../shared/middleware/auth.middleware');
const validate = require('../../shared/middleware/validate.middleware');
const {
  createPaymentOrderSchema,
  verifyPaymentSchema,
} = require('./payment.validation');
const paymentController = require('./payment.controller');

const router = express.Router();

// Customer authentication required for all payment operations
router.use(authMiddleware);

// 1. Create Razorpay Checkout Order
router.post('/create-order', validate(createPaymentOrderSchema), paymentController.createOrder);

// 2. Verify Client-side Checkout Signature & Confirm Booking
router.post('/verify', validate(verifyPaymentSchema), paymentController.verifyPayment);

// 3. Get Payment Status for Booking
router.get('/:bookingId', paymentController.getPaymentStatus);

module.exports = router;
