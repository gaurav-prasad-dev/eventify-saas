const { z } = require('zod');

const createPaymentOrderSchema = z.object({
  bookingId: z.string().uuid('Valid booking ID is required'),
});

const verifyPaymentSchema = z.object({
  bookingId: z.string().uuid('Valid booking ID is required'),
  razorpayOrderId: z.string().min(1, 'Razorpay order ID is required'),
  razorpayPaymentId: z.string().min(1, 'Razorpay payment ID is required'),
  razorpaySignature: z.string().min(1, 'Razorpay signature is required'),
});

module.exports = {
  createPaymentOrderSchema,
  verifyPaymentSchema,
};
