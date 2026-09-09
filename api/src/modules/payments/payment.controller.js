const paymentService = require('./payment.service');
const { sendSuccess } = require('../../shared/utils/apiResponse');

class PaymentController {
  /**
   * POST /api/v1/payments/create-order
   * Create Razorpay Checkout order for pending booking
   */
  async createOrder(req, res, next) {
    try {
      const { bookingId } = req.body;
      const orderData = await paymentService.createOrder(bookingId, req.user.id);
      return sendSuccess(res, 201, 'Razorpay order created successfully', orderData);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/payments/verify
   * Verify client-side checkout signature and confirm booking
   */
  async verifyPayment(req, res, next) {
    try {
      const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
      const result = await paymentService.verifyPayment(
        bookingId,
        req.user.id,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      );
      return sendSuccess(res, 200, result.message, result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/payments/:bookingId
   * Get payment status and details for a booking
   */
  async getPaymentStatus(req, res, next) {
    try {
      const { bookingId } = req.params;
      const payment = await paymentService.getPaymentByBookingId(bookingId, req.user.id);
      return sendSuccess(res, 200, 'Payment details retrieved', payment);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/webhooks/razorpay
   * Razorpay Server-to-Server Webhook handler
   */
  async handleWebhook(req, res, next) {
    try {
      const signature = req.headers['x-razorpay-signature'];
      const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));
      const result = await paymentService.processWebhook(rawBody, signature);
      return res.status(200).json({ status: 'ok', data: result });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PaymentController();
