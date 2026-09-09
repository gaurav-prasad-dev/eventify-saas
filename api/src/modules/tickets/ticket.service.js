const prisma = require('../../database/prisma');
const AppError = require('../../shared/errors/AppError');
const {
  generateTicketNumber,
  generateSignedQrPayload,
  verifyQrPayload,
  generateQrCodeImage,
} = require('./ticket.utils');

class TicketService {
  /**
   * Automatically generate digital tickets with signed QR codes for a confirmed booking
   * @param {object} tx Prisma transaction client
   * @param {object} booking Confirmed booking entity
   */
  async generateTicketsForBooking(tx, booking) {
    const client = tx || prisma;

    // Load booking with full seat and item relations if not already populated
    const fullBooking = await client.booking.findUnique({
      where: { id: booking.id },
      include: {
        seats: { include: { ticketTier: true } },
        items: { include: { ticketTier: true } },
        event: { select: { id: true, title: true } },
        session: { select: { id: true, title: true, startTime: true } },
      },
    });

    if (!fullBooking) {
      throw AppError.notFound('Booking not found for ticket generation');
    }

    const createdTickets = [];
    let ticketCounter = 1;

    // Case 1: Reserved Seated Tickets
    if (fullBooking.seats && fullBooking.seats.length > 0) {
      for (const seat of fullBooking.seats) {
        const ticketNumber = generateTicketNumber(fullBooking.bookingNumber, ticketCounter++);
        const qrPayload = generateSignedQrPayload({
          ticketNumber,
          eventId: fullBooking.eventId,
          sessionId: fullBooking.sessionId,
          seatNumber: seat.seatNumber,
          section: seat.section,
          tierName: seat.ticketTier?.name,
        });

        const qrCodeImage = await generateQrCodeImage(qrPayload);

        const ticket = await client.ticket.create({
          data: {
            ticketNumber,
            bookingId: fullBooking.id,
            userId: fullBooking.userId,
            eventId: fullBooking.eventId,
            sessionId: fullBooking.sessionId,
            ticketTierId: seat.ticketTierId,
            bookingSeatId: seat.id,
            seatNumber: seat.seatNumber,
            rowNumber: seat.rowNumber,
            section: seat.section,
            qrCodeData: qrPayload,
            qrCodeImage,
            status: 'ISSUED',
          },
        });
        createdTickets.push(ticket);
      }
    } else if (fullBooking.items && fullBooking.items.length > 0) {
      // Case 2: General Admission / Standing Tickets
      for (const item of fullBooking.items) {
        const quantity = item.quantity || 1;
        for (let i = 0; i < quantity; i++) {
          const ticketNumber = generateTicketNumber(fullBooking.bookingNumber, ticketCounter++);
          const qrPayload = generateSignedQrPayload({
            ticketNumber,
            eventId: fullBooking.eventId,
            sessionId: fullBooking.sessionId,
            seatNumber: 'GENERAL_ADMISSION',
            section: 'General Admission',
            tierName: item.ticketTier?.name,
          });

          const qrCodeImage = await generateQrCodeImage(qrPayload);

          const ticket = await client.ticket.create({
            data: {
              ticketNumber,
              bookingId: fullBooking.id,
              userId: fullBooking.userId,
              eventId: fullBooking.eventId,
              sessionId: fullBooking.sessionId,
              ticketTierId: item.ticketTierId,
              bookingSeatId: null,
              seatNumber: 'GA',
              rowNumber: null,
              section: 'General Admission',
              qrCodeData: qrPayload,
              qrCodeImage,
              status: 'ISSUED',
            },
          });
          createdTickets.push(ticket);
        }
      }
    }

    return createdTickets;
  }

  /**
   * Get all digital tickets for a specific booking
   */
  async getTicketsByBookingId(bookingId, userId) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw AppError.notFound('Booking not found');
    }

    if (booking.userId !== userId) {
      throw AppError.forbidden('You are not authorized to view tickets for this booking');
    }

    const tickets = await prisma.ticket.findMany({
      where: { bookingId },
      include: {
        event: { select: { id: true, title: true, bannerUrl: true, thumbnailUrl: true } },
        session: { select: { id: true, title: true, startTime: true, endTime: true } },
        ticketTier: { select: { id: true, name: true, seatType: true, price: true } },
      },
      orderBy: { ticketNumber: 'asc' },
    });

    return tickets;
  }

  /**
   * Get customer digital passbook (upcoming and past tickets)
   */
  async getMyTickets(userId, query = {}) {
    const where = { userId };

    if (query.status) {
      where.status = query.status;
    }

    const now = new Date();
    if (query.type === 'upcoming') {
      where.session = { startTime: { gte: now } };
    } else if (query.type === 'past') {
      where.session = { startTime: { lt: now } };
    }

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            bannerUrl: true,
            thumbnailUrl: true,
            venue: { select: { name: true, city: true, address: true } },
          },
        },
        session: { select: { id: true, title: true, startTime: true, endTime: true } },
        ticketTier: { select: { id: true, name: true, seatType: true } },
      },
      orderBy: { session: { startTime: 'asc' } },
    });

    return tickets;
  }

  /**
   * Get individual ticket pass by ID
   */
  async getTicketById(ticketId, userId) {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            bannerUrl: true,
            thumbnailUrl: true,
            venue: { select: { name: true, city: true, address: true } },
          },
        },
        session: { select: { id: true, title: true, startTime: true, endTime: true } },
        ticketTier: { select: { id: true, name: true, seatType: true, price: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!ticket) {
      throw AppError.notFound('Ticket not found');
    }

    if (ticket.userId !== userId) {
      throw AppError.forbidden('You are not authorized to view this ticket');
    }

    return ticket;
  }

  /**
   * Venue Gate Scanner: Validate QR Code & Check In Attendee (Single Entry Rule)
   * @param {string} qrData Scanned QR payload
   * @param {object} staffUser Authenticated gate staff member
   * @param {string} [requestedSessionId] Optional session filter
   */
  async validateAndCheckIn(qrData, staffUser, requestedSessionId = null) {
    // 1. Verify Cryptographic HMAC SHA256 Signature
    const verification = verifyQrPayload(qrData);
    if (!verification.valid) {
      throw AppError.badRequest('QR verification failed: ' + verification.error);
    }

    const { ticketNumber, eventId, sessionId } = verification.data;

    if (requestedSessionId && sessionId !== requestedSessionId) {
      throw AppError.badRequest('Ticket is for a different session or time slot');
    }

    // 2. Fetch ticket from database
    const ticket = await prisma.ticket.findUnique({
      where: { ticketNumber },
      include: {
        user: { select: { id: true, name: true, email: true } },
        event: { select: { id: true, title: true, organizationId: true } },
        session: { select: { id: true, title: true, startTime: true, endTime: true } },
        ticketTier: { select: { id: true, name: true, price: true } },
      },
    });

    if (!ticket) {
      throw AppError.notFound('Ticket not found in event registry');
    }

    // 3. Status checks
    if (ticket.status === 'CANCELLED') {
      throw AppError.badRequest('Entry Denied: This ticket has been cancelled or refunded');
    }

    // 4. Anti-Passback / Single Entry Enforcement
    if (ticket.status === 'CHECKED_IN') {
      const formattedTime = new Date(ticket.checkedInAt).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      throw AppError.conflict(
        `Entry Denied: Ticket ${ticket.ticketNumber} was already scanned and checked in at ${formattedTime}! Duplicate entry is forbidden.`
      );
    }

    // 5. Admit attendee & record timestamp
    const checkedInTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        status: 'CHECKED_IN',
        checkedInAt: new Date(),
        checkedInBy: staffUser.id,
      },
    });

    return {
      admitted: true,
      status: 'CHECKED_IN',
      message: `Welcome, ${ticket.user.name}! Entry authorized.`,
      ticketNumber: ticket.ticketNumber,
      attendeeName: ticket.user.name,
      seatNumber: ticket.seatNumber || 'General Admission',
      section: ticket.section || 'General',
      tierName: ticket.ticketTier.name,
      eventTitle: ticket.event.title,
      sessionTitle: ticket.session.title,
      checkedInAt: checkedInTicket.checkedInAt,
    };
  }
}

module.exports = new TicketService();
