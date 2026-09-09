const prisma = require('../../database/prisma');
const seatLockService = require('./seatLock.service');
const { broadcastToSession } = require('../../config/socket');
const AppError = require('../../shared/errors/AppError');

class BookingService {
  /**
   * Lock one or multiple visual seats (5-minute hold)
   */
  async lockSeats(userId, sessionId, seatIds, ttlSeconds = 300) {
    const session = await prisma.eventSession.findUnique({
      where: { id: sessionId },
      include: { event: true },
    });

    if (!session) {
      throw AppError.notFound('Event session not found');
    }

    if (session.status !== 'SCHEDULED' && session.status !== 'RUNNING') {
      throw AppError.badRequest('Cannot lock seats for a session that is not currently active');
    }

    return await seatLockService.acquireLocks(sessionId, seatIds, userId, ttlSeconds);
  }

  /**
   * Release seat locks early
   */
  async releaseSeats(userId, sessionId, seatIds) {
    return await seatLockService.releaseLocks(sessionId, seatIds, userId);
  }

  /**
   * Create a PENDING Booking reservation holding seats/inventory for 5 minutes
   */
  async reserveBooking(userId, data) {
    const { eventId, sessionId, reservedSeats = [], standingTickets = [] } = data;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organization: true,
        venue: true,
      },
    });

    if (!event || event.status !== 'PUBLISHED') {
      throw AppError.badRequest('Event is not published or no longer available for booking');
    }

    const session = await prisma.eventSession.findFirst({
      where: { id: sessionId, eventId },
    });

    if (!session) {
      throw AppError.notFound('Event session not found for this event');
    }

    // Collect all ticket tiers involved
    const tierIds = new Set();
    reservedSeats.forEach((rs) => tierIds.add(rs.ticketTierId));
    standingTickets.forEach((st) => tierIds.add(st.ticketTierId));

    const tiers = await prisma.eventTicketTier.findMany({
      where: { id: { in: Array.from(tierIds) }, eventId },
    });
    const tierMap = new Map(tiers.map((t) => [t.id, t]));

    // Validate tier existence
    for (const tierId of tierIds) {
      if (!tierMap.has(tierId)) {
        throw AppError.badRequest(`Ticket tier ${tierId} is invalid or not available for this event`);
      }
    }

    // Validate and fetch reserved seats info
    let seatEntities = [];
    if (reservedSeats.length > 0) {
      const seatIds = reservedSeats.map((rs) => rs.venueSeatId);
      seatEntities = await prisma.venueSeat.findMany({
        where: { id: { in: seatIds } },
      });

      if (seatEntities.length !== seatIds.length) {
        throw AppError.badRequest('One or more selected seats do not exist in venue');
      }

      // Check if user has active lock on these seats
      // (Either in Redis or In-Memory)
      // If user hasn't locked yet, attempt to acquire lock right now
      await seatLockService.acquireLocks(sessionId, seatIds, userId, 300);
    }

    const seatMap = new Map(seatEntities.map((s) => [s.id, s]));

    // Calculate itemized pricing
    let subtotal = 0;
    const bookingItemsData = [];
    const bookingSeatsData = [];

    // Process reserved seats
    for (const rs of reservedSeats) {
      const tier = tierMap.get(rs.ticketTierId);
      const seat = seatMap.get(rs.venueSeatId);
      const unitPrice = Number(tier.price);
      subtotal += unitPrice;

      bookingItemsData.push({
        ticketTierId: tier.id,
        quantity: 1,
        unitPrice,
        subtotal: unitPrice,
      });

      bookingSeatsData.push({
        sessionId,
        venueSeatId: seat.id,
        ticketTierId: tier.id,
        seatNumber: seat.seatNumber,
        rowNumber: seat.rowNumber,
        section: seat.section,
        status: 'LOCKED',
      });
    }

    // Process standing tickets
    for (const st of standingTickets) {
      const tier = tierMap.get(st.ticketTierId);
      if (tier.availableQuantity < st.quantity) {
        throw AppError.badRequest(`Not enough tickets available in tier "${tier.name}". Remaining: ${tier.availableQuantity}`);
      }

      const unitPrice = Number(tier.price);
      const lineTotal = unitPrice * st.quantity;
      subtotal += lineTotal;

      bookingItemsData.push({
        ticketTierId: tier.id,
        quantity: st.quantity,
        unitPrice,
        subtotal: lineTotal,
      });
    }

    // Compute taxes (18% GST) and final total
    const taxAmount = Number((subtotal * 0.18).toFixed(2));
    const finalAmount = Number((subtotal + taxAmount).toFixed(2));

    const bookingNumber = `BK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 300 * 1000); // 5 minutes TTL

    // Execute atomic reservation in PostgreSQL transaction
    const booking = await prisma.$transaction(async (tx) => {
      // Decrement standing tickets inventory atomically
      for (const st of standingTickets) {
        await tx.eventTicketTier.update({
          where: { id: st.ticketTierId },
          data: {
            availableQuantity: { decrement: st.quantity },
          },
        });
      }

      // Create Booking record
      const createdBooking = await tx.booking.create({
        data: {
          bookingNumber,
          userId,
          eventId,
          sessionId,
          organizationId: event.organizationId,
          totalAmount: subtotal,
          taxAmount,
          finalAmount,
          currency: 'INR',
          status: 'PENDING',
          paymentStatus: 'PENDING',
          expiresAt,
          items: {
            create: bookingItemsData,
          },
          seats: {
            create: bookingSeatsData,
          },
        },
        include: {
          items: {
            include: { ticketTier: true },
          },
          seats: true,
          event: {
            select: { id: true, title: true, slug: true, bannerUrl: true },
          },
          session: {
            select: { id: true, title: true, startTime: true, endTime: true },
          },
        },
      });

      return createdBooking;
    });

    return {
      ...booking,
      expiresAt,
      ttlSeconds: 300,
      countdownRemainingSeconds: 300,
    };
  }

  /**
   * Get single booking details with remaining countdown timer
   */
  async getBookingById(userId, bookingId) {
    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, userId },
      include: {
        items: {
          include: { ticketTier: true },
        },
        seats: true,
        event: {
          include: {
            venue: {
              select: { id: true, name: true, city: true, address: true },
            },
          },
        },
        session: true,
      },
    });

    if (!booking) {
      throw AppError.notFound('Booking not found');
    }

    const now = Date.now();
    const remainingSeconds = Math.max(0, Math.floor((new Date(booking.expiresAt).getTime() - now) / 1000));

    // If expired and still pending, auto-mark expired
    if (booking.status === 'PENDING' && remainingSeconds <= 0) {
      await this.expireBooking(booking.id);
      booking.status = 'EXPIRED';
    }

    return {
      ...booking,
      remainingSeconds,
    };
  }

  /**
   * Customer cancels or releases reservation early
   */
  async releaseBooking(userId, bookingId) {
    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, userId },
      include: {
        items: true,
        seats: true,
      },
    });

    if (!booking) {
      throw AppError.notFound('Booking not found');
    }

    if (booking.status !== 'PENDING') {
      throw AppError.badRequest(`Cannot release booking with status ${booking.status}`);
    }

    // Release seat locks via SeatLockService
    const seatIds = booking.seats.map((s) => s.venueSeatId);
    if (seatIds.length > 0) {
      await seatLockService.releaseLocks(booking.sessionId, seatIds, userId);
    }

    // Rollback standing inventory and update booking status
    await prisma.$transaction(async (tx) => {
      // Restore standing tickets inventory
      for (const item of booking.items) {
        // If it was standing (not associated with a specific seat)
        const isReservedItem = booking.seats.some((s) => s.ticketTierId === item.ticketTierId);
        if (!isReservedItem) {
          await tx.eventTicketTier.update({
            where: { id: item.ticketTierId },
            data: {
              availableQuantity: { increment: item.quantity },
            },
          });
        }
      }

      // Mark booking as CANCELLED
      await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancellationReason: 'Cancelled by customer before payment',
        },
      });

      // Mark booking seats as RELEASED
      await tx.bookingSeat.updateMany({
        where: { bookingId: booking.id },
        data: { status: 'RELEASED' },
      });
    });

    // Broadcast unlocked seats to Socket.IO room
    broadcastToSession(booking.sessionId, 'seat:unlocked', {
      seatIds,
      sessionId: booking.sessionId,
      reason: 'CANCELLED_BY_USER',
    });

    return { success: true, message: 'Reservation cancelled and seats released' };
  }

  /**
   * Internal helper to expire a stale booking
   */
  async expireBooking(bookingId) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { items: true, seats: true },
    });

    if (!booking || booking.status !== 'PENDING') return;

    const seatIds = booking.seats.map((s) => s.venueSeatId);
    if (seatIds.length > 0) {
      await seatLockService.releaseLocks(booking.sessionId, seatIds, booking.userId);
    }

    await prisma.$transaction(async (tx) => {
      // Restore standing tickets
      for (const item of booking.items) {
        const isReserved = booking.seats.some((s) => s.ticketTierId === item.ticketTierId);
        if (!isReserved) {
          await tx.eventTicketTier.update({
            where: { id: item.ticketTierId },
            data: { availableQuantity: { increment: item.quantity } },
          });
        }
      }

      await tx.booking.update({
        where: { id: booking.id },
        data: { status: 'EXPIRED' },
      });

      await tx.bookingSeat.updateMany({
        where: { bookingId: booking.id },
        data: { status: 'RELEASED' },
      });
    });

    broadcastToSession(booking.sessionId, 'seat:unlocked', {
      seatIds,
      sessionId: booking.sessionId,
      reason: 'LOCK_EXPIRED',
    });
  }

  /**
   * Get customer's booking history
   */
  async getMyBookings(userId, query = {}) {
    const { page = 1, limit = 20, status } = query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where = { userId };
    if (status) {
      where.status = status.toUpperCase();
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: { ticketTier: true },
          },
          seats: true,
          event: {
            select: { id: true, title: true, slug: true, bannerUrl: true },
          },
          session: {
            select: { id: true, title: true, startTime: true },
          },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      bookings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }
}

module.exports = new BookingService();
