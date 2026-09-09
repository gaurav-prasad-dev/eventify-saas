const prisma = require('../../database/prisma');
const env = require('../../config/env');
const { razorpayClient, verifyPaymentSignature, verifyWebhookSignature } = require('../../config/razorpay');
const seatLockService = require('../bookings/seatLock.service');
const { broadcastToSession } = require('../../config/socket');
const AppError = require('../../shared/errors/AppError');

class PaymentService {
  /**
   * Create Razorpay Checkout Order for a pending booking
   * @param {string} bookingId 
   * @param {string} userId 
   */
  async createOrder(bookingId, userId) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        event: { select: { id: true, title: true } },
        payment: true,
      },
    });

    if (!booking) {
      throw AppError.notFound('Booking reservation not found');
    }

    if (booking.userId !== userId) {
      throw AppError.forbidden('You are not authorized to pay for this booking');
    }

    if (booking.status === 'CONFIRMED') {
      throw AppError.badRequest('Booking has already been confirmed and paid');
    }

    if (booking.status === 'CANCELLED') {
      throw AppError.badRequest('Booking has been cancelled');
    }

    // Check if 5-minute seat reservation has expired
    if (new Date() > new Date(booking.expiresAt)) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'EXPIRED' },
      });
      throw AppError.badRequest('Your seat reservation has expired. Please select seats and reserve again.');
    }

    // Amount in paise (Razorpay standard: ₹100 = 10000 paise)
    const amountInPaise = Math.round(Number(booking.finalAmount) * 100);

    let razorpayOrderId;

    if (razorpayClient) {
      try {
        const order = await razorpayClient.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: booking.bookingNumber,
          notes: {
            bookingId: booking.id,
            bookingNumber: booking.bookingNumber,
            userId: booking.userId,
            eventTitle: booking.event.title,
          },
        });
        razorpayOrderId = order.id;
      } catch (err) {
        console.error('❌ Razorpay Orders API Error:', err);
        throw AppError.internal('Failed to initiate order with Razorpay gateway: ' + (err.error?.description || err.message));
      }
    } else {
      // Local development simulation fallback when keys are not configured
      razorpayOrderId = `order_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    }

    // Create or update Payment record
    const payment = await prisma.payment.upsert({
      where: { bookingId: booking.id },
      create: {
        bookingId: booking.id,
        razorpayOrderId,
        amount: booking.finalAmount,
        currency: 'INR',
        status: 'PENDING',
      },
      update: {
        razorpayOrderId,
        amount: booking.finalAmount,
        status: 'PENDING',
        failureReason: null,
      },
    });

    return {
      orderId: razorpayOrderId,
      amount: amountInPaise,
      currency: 'INR',
      bookingId: booking.id,
      bookingNumber: booking.bookingNumber,
      keyId: env.RAZORPAY_KEY_ID || 'rzp_test_simulation',
      eventTitle: booking.event.title,
      expiresAt: booking.expiresAt,
    };
  }

  /**
   * Verify client-side checkout signature and confirm booking atomically
   * @param {string} bookingId 
   * @param {string} userId 
   * @param {string} razorpayOrderId 
   * @param {string} razorpayPaymentId 
   * @param {string} razorpaySignature 
   */
  async verifyPayment(bookingId, userId, razorpayOrderId, razorpayPaymentId, razorpaySignature) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        seats: true,
        items: { include: { ticketTier: true } },
        payment: true,
      },
    });

    if (!booking) {
      throw AppError.notFound('Booking reservation not found');
    }

    if (booking.userId !== userId) {
      throw AppError.forbidden('You are not authorized to verify this booking');
    }

    // Idempotency: If already confirmed, return success immediately
    if (booking.status === 'CONFIRMED') {
      return {
        booking,
        alreadyConfirmed: true,
        message: 'Payment already confirmed and tickets booked',
      };
    }

    // Verify cryptographic signature
    const isSignatureValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (!isSignatureValid) {
      // Record failed payment attempt
      await prisma.payment.updateMany({
        where: { bookingId: booking.id },
        data: {
          status: 'FAILED',
          failureReason: 'Invalid cryptographic payment signature',
          razorpayPaymentId,
          razorpaySignature,
        },
      });
      throw AppError.badRequest('Payment signature verification failed. Possible payload tampering detected.');
    }

    // Execute Idempotent Atomic Confirmation Transaction
    const confirmedBooking = await this._confirmBookingTransaction(
      booking,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    return {
      booking: confirmedBooking,
      alreadyConfirmed: false,
      message: 'Payment verified successfully and booking confirmed',
    };
  }

  /**
   * Process incoming Razorpay Server-to-Server Webhook
   * @param {Buffer|string} rawBody 
   * @param {string} signatureHeader 
   */
  async processWebhook(rawBody, signatureHeader) {
    if (!signatureHeader) {
      throw AppError.badRequest('Missing x-razorpay-signature header');
    }

    const isValid = verifyWebhookSignature(rawBody, signatureHeader);
    if (!isValid) {
      throw AppError.badRequest('Invalid webhook signature verification failed');
    }

    const payload = JSON.parse(rawBody.toString());
    const event = payload.event;

    console.log(`📥 [Razorpay Webhook] Received event: ${event}`);

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;

      const payment = await prisma.payment.findFirst({
        where: { razorpayOrderId: orderId },
        include: {
          booking: {
            include: {
              seats: true,
              items: { include: { ticketTier: true } },
            },
          },
        },
      });

      if (!payment || !payment.booking) {
        console.warn(`⚠️ [Razorpay Webhook] No matching booking found for order ID: ${orderId}`);
        return { status: 'IGNORED', reason: 'Booking not found' };
      }

      // Idempotent: If already confirmed, acknowledge 200 OK
      if (payment.booking.status === 'CONFIRMED') {
        return { status: 'ALREADY_CONFIRMED', bookingNumber: payment.booking.bookingNumber };
      }

      // Confirm booking atomically
      await this._confirmBookingTransaction(
        payment.booking,
        orderId,
        paymentId,
        'WEBHOOK_VERIFIED',
        paymentEntity.method
      );

      return { status: 'CONFIRMED', bookingNumber: payment.booking.bookingNumber };
    }

    if (event === 'payment.failed') {
      const paymentEntity = payload.payload.payment.entity;
      const orderId = paymentEntity.order_id;

      await prisma.payment.updateMany({
        where: { razorpayOrderId: orderId },
        data: {
          status: 'FAILED',
          failureReason: paymentEntity.error_description || 'Payment failed at bank',
        },
      });

      return { status: 'FAILED_RECORDED' };
    }

    return { status: 'IGNORED', event };
  }

  /**
   * Internal Atomic Confirmation Transaction & Real-Time Sync
   * @private
   */
  async _confirmBookingTransaction(booking, razorpayOrderId, razorpayPaymentId, signature, method = null) {
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update Payment status to SUCCESS
      await tx.payment.upsert({
        where: { bookingId: booking.id },
        create: {
          bookingId: booking.id,
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature: signature,
          amount: booking.finalAmount,
          currency: 'INR',
          status: 'SUCCESS',
          method: method || 'online',
        },
        update: {
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature: signature,
          status: 'SUCCESS',
          method: method || 'online',
        },
      });

      // 2. Update Booking status to CONFIRMED and paymentStatus to PAID
      const confirmed = await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
          confirmedAt: new Date(),
        },
        include: {
          seats: true,
          items: { include: { ticketTier: true } },
          event: { select: { id: true, title: true } },
          session: { select: { id: true, title: true, startTime: true } },
        },
      });

      // 3. Mark all reserved seats as permanently BOOKED
      await tx.bookingSeat.updateMany({
        where: { bookingId: booking.id },
        data: { status: 'BOOKED' },
      });

      // 4. Automatically mint digital tickets with verifiable QR codes
      const ticketService = require('../tickets/ticket.service');
      await ticketService.generateTicketsForBooking(tx, confirmed);

      return confirmed;
    });

    // 4. Release temporary locks in Redis / In-Memory
    if (booking.seats && booking.seats.length > 0) {
      const seatIds = booking.seats.map((s) => s.venueSeatId);
      await seatLockService.releaseLocks(booking.sessionId, seatIds, booking.userId);

      // 5. Broadcast real-time 'seat:booked' event over Socket.IO room
      try {
        broadcastToSession(booking.sessionId, 'seat:booked', {
          sessionId: booking.sessionId,
          seatIds,
          bookingId: booking.id,
        });
      } catch (socketErr) {
        console.warn('⚠️ [PaymentService] Socket broadcast failed:', socketErr.message);
      }
    }

    return updated;
  }

  /**
   * Get payment details for a specific booking
   */
  async getPaymentByBookingId(bookingId, userId) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true },
    });

    if (!booking) {
      throw AppError.notFound('Booking not found');
    }

    if (booking.userId !== userId) {
      throw AppError.forbidden('Unauthorized access to booking payment');
    }

    return booking.payment;
  }
}

module.exports = new PaymentService();
