const prisma = require('../../database/prisma');
const seatLockService = require('../bookings/seatLock.service');
const { sendSuccess } = require('../../shared/utils/apiResponse');
const AppError = require('../../shared/errors/AppError');

class PublicEventController {
  /**
   * GET /api/v1/public/events
   * Search, filter, and discover published events (Guest unauthenticated)
   */
  async getPublishedEvents(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        category,
        city,
        startDate,
        endDate,
      } = req.query;

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
      const skip = (pageNum - 1) * limitNum;

      const where = {
        status: 'PUBLISHED',
      };

      if (category) {
        where.category = category.toUpperCase();
      }

      if (city) {
        where.venue = {
          city: {
            contains: city,
            mode: 'insensitive',
          },
        };
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { performers: { contains: search, mode: 'insensitive' } },
          { venue: { name: { contains: search, mode: 'insensitive' } } },
        ];
      }

      if (startDate || endDate) {
        where.startDate = {};
        if (startDate) where.startDate.gte = new Date(startDate);
        if (endDate) where.startDate.lte = new Date(endDate);
      }

      const [events, total] = await Promise.all([
        prisma.event.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { startDate: 'asc' },
          select: {
            id: true,
            title: true,
            slug: true,
            shortDescription: true,
            category: true,
            tags: true,
            performers: true,
            bannerUrl: true,
            thumbnailUrl: true,
            startDate: true,
            endDate: true,
            totalCapacity: true,
            venue: {
              select: {
                id: true,
                name: true,
                city: true,
                address: true,
              },
            },
            ticketTiers: {
              where: { status: 'ACTIVE' },
              select: {
                id: true,
                name: true,
                price: true,
                currency: true,
                seatType: true,
                availableQuantity: true,
              },
              orderBy: { price: 'asc' },
            },
          },
        }),
        prisma.event.count({ where }),
      ]);

      // Calculate starting price for each event
      const formattedEvents = events.map((ev) => {
        const lowestPrice = ev.ticketTiers.length > 0 ? ev.ticketTiers[0].price : null;
        return {
          ...ev,
          startingPrice: lowestPrice,
          currency: ev.ticketTiers[0]?.currency || 'INR',
        };
      });

      return sendSuccess(res, 200, 'Published events retrieved successfully', {
        events: formattedEvents,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/public/events/:identifier
   * View single published event details by slug or ID
   */
  async getPublishedEventById(req, res, next) {
    try {
      const { identifier } = req.params;

      const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(identifier);

      const where = isUuid
        ? { id: identifier, status: 'PUBLISHED' }
        : { slug: identifier, status: 'PUBLISHED' };

      const event = await prisma.event.findFirst({
        where,
        include: {
          venue: {
            select: {
              id: true,
              name: true,
              description: true,
              address: true,
              city: true,
              state: true,
              country: true,
              postalCode: true,
              facilities: true,
              images: true,
            },
          },
          sessions: {
            where: { status: { in: ['SCHEDULED', 'RUNNING'] } },
            orderBy: { startTime: 'asc' },
          },
          ticketTiers: {
            where: { status: 'ACTIVE' },
            orderBy: { price: 'asc' },
          },
        },
      });

      if (!event) {
        throw AppError.notFound('Event not found or is no longer published');
      }

      return sendSuccess(res, 200, 'Event profile retrieved successfully', event);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/public/events/:id/sessions/:sessionId/seats
   * Real-time seat layout availability for a specific showtime session
   */
  async getSessionSeatMap(req, res, next) {
    try {
      const { id: eventId, sessionId } = req.params;

      // Verify session exists and belongs to event
      const session = await prisma.eventSession.findFirst({
        where: { id: sessionId, eventId },
        include: {
          event: {
            include: {
              seatingLayout: {
                include: {
                  seats: {
                    where: { status: 'ACTIVE' },
                    orderBy: [{ rowNumber: 'asc' }, { seatNumber: 'asc' }],
                  },
                },
              },
            },
          },
        },
      });

      if (!session) {
        throw AppError.notFound('Event session not found');
      }

      const seats = session.event.seatingLayout?.seats || [];

      // Query permanently booked seat IDs from DB
      const bookedSeats = await prisma.bookingSeat.findMany({
        where: {
          sessionId,
          status: 'BOOKED',
        },
        select: { venueSeatId: true },
      });
      const bookedSet = new Set(bookedSeats.map((s) => s.venueSeatId));

      // Query currently locked seat IDs from Redis / In-Memory
      const lockedSet = await seatLockService.getLockedSeatIds(sessionId);

      // Merge real-time statuses
      const liveSeats = seats.map((seat) => {
        let availability = 'AVAILABLE';
        if (bookedSet.has(seat.id)) {
          availability = 'BOOKED';
        } else if (lockedSet.has(seat.id)) {
          availability = 'LOCKED';
        }

        return {
          id: seat.id,
          seatNumber: seat.seatNumber,
          rowNumber: seat.rowNumber,
          section: seat.section,
          seatType: seat.seatType,
          xPosition: seat.xPosition,
          yPosition: seat.yPosition,
          status: availability,
        };
      });

      return sendSuccess(res, 200, 'Live session seat map retrieved', {
        sessionId,
        sessionTitle: session.title,
        startTime: session.startTime,
        layoutName: session.event.seatingLayout?.name || 'Default Layout',
        totalSeats: liveSeats.length,
        seats: liveSeats,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/public/events/:id/sessions/:sessionId/tickets
   * Available ticket pricing tiers for the session
   */
  async getSessionTickets(req, res, next) {
    try {
      const { id: eventId } = req.params;

      const tiers = await prisma.eventTicketTier.findMany({
        where: { eventId, status: 'ACTIVE' },
        orderBy: { price: 'asc' },
      });

      return sendSuccess(res, 200, 'Available ticket tiers retrieved', tiers);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PublicEventController();
