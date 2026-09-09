const prisma = require('../../database/prisma');
const AppError = require('../../shared/errors/AppError');
const { uploadToCloudinary } = require('../../shared/utils/cloudinary');

class EventService {
  /**
   * Helper to generate a URL-friendly slug
   */
  generateSlug(title) {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // =========================================================================
  // 1. EVENT MASTER LIFECYCLE
  // =========================================================================

  /**
   * Create new event in DRAFT state
   */
  async createEvent(organizationId, userId, data) {
    // 1. Verify venue belongs to this organization and is active
    const venue = await prisma.venue.findFirst({
      where: { id: data.venueId, organizationId, status: { not: 'ARCHIVED' } },
    });

    if (!venue) {
      throw AppError.notFound('Selected venue not found or has been archived');
    }

    // 2. If venue contract ID provided, verify it exists and belongs to this venue
    if (data.venueContractId) {
      const contract = await prisma.venueContract.findFirst({
        where: { id: data.venueContractId, venueId: data.venueId, organizationId },
      });
      if (!contract) {
        throw AppError.badRequest('Selected venue contract does not belong to this venue or organization');
      }
    }

    // 3. Generate unique slug for this organization
    const baseSlug = this.generateSlug(data.title);
    let uniqueSlug = baseSlug;
    const existing = await prisma.event.findFirst({
      where: { organizationId, slug: uniqueSlug },
    });
    if (existing) {
      uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    }

    // 4. Create event draft
    const event = await prisma.event.create({
      data: {
        organizationId,
        createdBy: userId,
        venueId: data.venueId,
        venueContractId: data.venueContractId || null,
        seatingLayoutId: data.seatingLayoutId || null,
        title: data.title,
        slug: uniqueSlug,
        description: data.description,
        shortDescription: data.shortDescription,
        category: data.category,
        tags: data.tags || [],
        performers: data.performers,
        ageRestriction: data.ageRestriction || 'ALL_AGES',
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        bannerUrl: data.bannerUrl,
        thumbnailUrl: data.thumbnailUrl,
        isFeatured: data.isFeatured || false,
        status: 'DRAFT',
      },
    });

    // 5. If venue contract was provided, backlink eventId onto the contract
    if (data.venueContractId) {
      await prisma.venueContract.update({
        where: { id: data.venueContractId },
        data: { eventId: event.id },
      });
    }

    return event;
  }

  /**
   * List organization events with search, filters and pagination
   */
  async getEvents(organizationId, query = {}) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const where = {
      organizationId,
      status: query.status ? query.status : { not: 'ARCHIVED' },
    };

    if (query.category) {
      where.category = query.category;
    }

    if (query.venueId) {
      where.venueId = query.venueId;
    }

    if (query.isFeatured !== undefined) {
      where.isFeatured = query.isFeatured === 'true' || query.isFeatured === true;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { performers: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, events] = await Promise.all([
      prisma.event.count({ where }),
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startDate: 'asc' },
        include: {
          venue: {
            select: { id: true, name: true, city: true, capacity: true },
          },
          _count: {
            select: { sessions: true, ticketTiers: true },
          },
        },
      }),
    ]);

    return {
      events,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single event with complete venue, contract, sessions, and ticket tiers
   */
  async getEventById(organizationId, eventId) {
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        organizationId,
        status: { not: 'ARCHIVED' },
      },
      include: {
        venue: true,
        venueContract: true,
        seatingLayout: {
          select: { id: true, name: true, totalSeats: true },
        },
        sessions: {
          orderBy: { startTime: 'asc' },
        },
        ticketTiers: {
          orderBy: { price: 'desc' },
        },
      },
    });

    if (!event) {
      throw AppError.notFound('Event not found or has been archived');
    }

    return event;
  }

  /**
   * Update event master details
   */
  async updateEvent(organizationId, eventId, data) {
    const event = await prisma.event.findFirst({
      where: { id: eventId, organizationId, status: { not: 'ARCHIVED' } },
    });

    if (!event) {
      throw AppError.notFound('Event not found');
    }

    if (data.venueId && data.venueId !== event.venueId) {
      const venue = await prisma.venue.findFirst({
        where: { id: data.venueId, organizationId, status: { not: 'ARCHIVED' } },
      });
      if (!venue) throw AppError.notFound('Selected venue not found');
    }

    return await prisma.event.update({
      where: { id: eventId },
      data: {
        venueId: data.venueId,
        venueContractId: data.venueContractId,
        seatingLayoutId: data.seatingLayoutId,
        title: data.title,
        description: data.description,
        shortDescription: data.shortDescription,
        category: data.category,
        tags: data.tags,
        performers: data.performers,
        ageRestriction: data.ageRestriction,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        bannerUrl: data.bannerUrl,
        thumbnailUrl: data.thumbnailUrl,
        isFeatured: data.isFeatured,
      },
    });
  }

  /**
   * Upload and attach banner, thumbnail, and gallery images via Cloudinary
   */
  async uploadEventMedia(organizationId, eventId, files = {}, body = {}) {
    const event = await prisma.event.findFirst({
      where: { id: eventId, organizationId, status: { not: 'ARCHIVED' } },
    });

    if (!event) {
      throw AppError.notFound('Event not found');
    }

    const updates = {};

    // 1. Banner upload (File stream or direct URL)
    if (files.banner && files.banner[0]) {
      const result = await uploadToCloudinary(files.banner[0].buffer, 'eventify/events/banners');
      updates.bannerUrl = result.secure_url;
    } else if (body.bannerUrl) {
      updates.bannerUrl = body.bannerUrl;
    }

    // 2. Thumbnail upload
    if (files.thumbnail && files.thumbnail[0]) {
      const result = await uploadToCloudinary(files.thumbnail[0].buffer, 'eventify/events/thumbnails');
      updates.thumbnailUrl = result.secure_url;
    } else if (body.thumbnailUrl) {
      updates.thumbnailUrl = body.thumbnailUrl;
    }

    // 3. Gallery photos upload
    if (files.gallery && files.gallery.length > 0) {
      const uploadPromises = files.gallery.map((file) =>
        uploadToCloudinary(file.buffer, 'eventify/events/gallery')
      );
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map((r) => r.secure_url);
      updates.galleryUrls = [...event.galleryUrls, ...newUrls];
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: updates,
    });

    return {
      bannerUrl: updatedEvent.bannerUrl,
      thumbnailUrl: updatedEvent.thumbnailUrl,
      galleryUrls: updatedEvent.galleryUrls,
    };
  }

  // =========================================================================
  // 2. EVENT SESSIONS / SHOWTIMES
  // =========================================================================

  /**
   * Add a session / showtime to an event
   */
  async addEventSession(organizationId, eventId, data) {
    const event = await prisma.event.findFirst({
      where: { id: eventId, organizationId, status: { not: 'ARCHIVED' } },
    });

    if (!event) {
      throw AppError.notFound('Event not found');
    }

    return await prisma.eventSession.create({
      data: {
        eventId,
        title: data.title,
        description: data.description,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        status: 'SCHEDULED',
      },
    });
  }

  /**
   * List sessions for an event
   */
  async getEventSessions(organizationId, eventId) {
    const event = await prisma.event.findFirst({
      where: { id: eventId, organizationId },
    });

    if (!event) {
      throw AppError.notFound('Event not found');
    }

    return await prisma.eventSession.findMany({
      where: { eventId },
      orderBy: { startTime: 'asc' },
    });
  }

  /**
   * Update session details
   */
  async updateEventSession(organizationId, eventId, sessionId, data) {
    const session = await prisma.eventSession.findFirst({
      where: { id: sessionId, eventId, event: { organizationId } },
    });

    if (!session) {
      throw AppError.notFound('Event session not found');
    }

    return await prisma.eventSession.update({
      where: { id: sessionId },
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime ? new Date(data.startTime) : undefined,
        endTime: data.endTime ? new Date(data.endTime) : undefined,
        status: data.status,
      },
    });
  }

  /**
   * Delete session
   */
  async deleteEventSession(organizationId, eventId, sessionId) {
    const session = await prisma.eventSession.findFirst({
      where: { id: sessionId, eventId, event: { organizationId } },
    });

    if (!session) {
      throw AppError.notFound('Event session not found');
    }

    await prisma.eventSession.delete({
      where: { id: sessionId },
    });

    return { message: 'Event session deleted successfully' };
  }

  // =========================================================================
  // 3. SEAT & TICKET PRICING TIERS
  // =========================================================================

  /**
   * Add a ticket pricing tier (VIP, Gold Recliner, Normal)
   */
  async addTicketTier(organizationId, eventId, data) {
    const event = await prisma.event.findFirst({
      where: { id: eventId, organizationId, status: { not: 'ARCHIVED' } },
      include: { venue: true, venueContract: true },
    });

    if (!event) {
      throw AppError.notFound('Event not found');
    }

    // Capacity limit check: if venue contract has allocatedCapacity, prevent overselling
    const currentTiers = await prisma.eventTicketTier.findMany({
      where: { eventId, status: { not: 'INACTIVE' } },
    });

    const currentTotalQuantity = currentTiers.reduce((acc, t) => acc + t.totalQuantity, 0);
    const newTotal = currentTotalQuantity + data.totalQuantity;

    const maxAllowedCapacity = event.venueContract?.allocatedCapacity || event.venue.capacity;
    if (maxAllowedCapacity > 0 && newTotal > maxAllowedCapacity) {
      throw AppError.badRequest(
        `Total ticket capacity (${newTotal}) exceeds venue allocated capacity (${maxAllowedCapacity}).`
      );
    }

    const tier = await prisma.eventTicketTier.create({
      data: {
        eventId,
        name: data.name,
        seatType: data.seatType || 'STANDARD',
        price: data.price,
        currency: data.currency || 'INR',
        totalQuantity: data.totalQuantity,
        availableQuantity: data.totalQuantity,
        maxPerOrder: data.maxPerOrder || 6,
        salesStartTime: data.salesStartTime ? new Date(data.salesStartTime) : null,
        salesEndTime: data.salesEndTime ? new Date(data.salesEndTime) : null,
        description: data.description,
        status: 'ACTIVE',
      },
    });

    // Update event total capacity
    await prisma.event.update({
      where: { id: eventId },
      data: { totalCapacity: newTotal },
    });

    return tier;
  }

  /**
   * List ticket tiers for an event
   */
  async getTicketTiers(organizationId, eventId) {
    const event = await prisma.event.findFirst({
      where: { id: eventId, organizationId },
    });

    if (!event) {
      throw AppError.notFound('Event not found');
    }

    return await prisma.eventTicketTier.findMany({
      where: { eventId },
      orderBy: { price: 'desc' },
    });
  }

  /**
   * Update a ticket pricing tier
   */
  async updateTicketTier(organizationId, eventId, tierId, data) {
    const tier = await prisma.eventTicketTier.findFirst({
      where: { id: tierId, eventId, event: { organizationId } },
    });

    if (!tier) {
      throw AppError.notFound('Ticket tier not found');
    }

    const updated = await prisma.eventTicketTier.update({
      where: { id: tierId },
      data: {
        name: data.name,
        seatType: data.seatType,
        price: data.price,
        totalQuantity: data.totalQuantity,
        maxPerOrder: data.maxPerOrder,
        salesStartTime: data.salesStartTime ? new Date(data.salesStartTime) : undefined,
        salesEndTime: data.salesEndTime ? new Date(data.salesEndTime) : undefined,
        description: data.description,
        status: data.status,
      },
    });

    // Recalculate event total capacity
    const allTiers = await prisma.eventTicketTier.findMany({
      where: { eventId, status: 'ACTIVE' },
    });
    const newTotal = allTiers.reduce((acc, t) => acc + t.totalQuantity, 0);

    await prisma.event.update({
      where: { id: eventId },
      data: { totalCapacity: newTotal },
    });

    return updated;
  }

  /**
   * Delete ticket tier
   */
  async deleteTicketTier(organizationId, eventId, tierId) {
    const tier = await prisma.eventTicketTier.findFirst({
      where: { id: tierId, eventId, event: { organizationId } },
    });

    if (!tier) {
      throw AppError.notFound('Ticket tier not found');
    }

    await prisma.eventTicketTier.delete({
      where: { id: tierId },
    });

    // Recalculate event total capacity
    const allTiers = await prisma.eventTicketTier.findMany({
      where: { eventId, status: 'ACTIVE' },
    });
    const newTotal = allTiers.reduce((acc, t) => acc + t.totalQuantity, 0);

    await prisma.event.update({
      where: { id: eventId },
      data: { totalCapacity: newTotal },
    });

    return { message: 'Ticket tier deleted successfully' };
  }

  // =========================================================================
  // 4. PUBLISHING & STATUS WORKFLOW
  // =========================================================================

  /**
   * Publish event to Marketplace (guarded by business rules)
   */
  async publishEvent(organizationId, eventId) {
    const event = await prisma.event.findFirst({
      where: { id: eventId, organizationId, status: { not: 'ARCHIVED' } },
      include: {
        sessions: { where: { status: 'SCHEDULED' } },
        ticketTiers: { where: { status: 'ACTIVE' } },
      },
    });

    if (!event) {
      throw AppError.notFound('Event not found');
    }

    // Business Guardrail 1: Event must have at least one scheduled session/showtime
    if (event.sessions.length === 0) {
      throw AppError.badRequest('Cannot publish event: At least one scheduled session is required.');
    }

    // Business Guardrail 2: Event must have at least one active ticket pricing tier
    if (event.ticketTiers.length === 0) {
      throw AppError.badRequest('Cannot publish event: At least one ticket pricing tier is required.');
    }

    return await prisma.event.update({
      where: { id: eventId },
      data: { status: 'PUBLISHED' },
    });
  }

  /**
   * Cancel event
   */
  async cancelEvent(organizationId, eventId) {
    const event = await prisma.event.findFirst({
      where: { id: eventId, organizationId },
    });

    if (!event) {
      throw AppError.notFound('Event not found');
    }

    return await prisma.event.update({
      where: { id: eventId },
      data: { status: 'CANCELLED' },
    });
  }

  /**
   * Soft delete / archive event
   */
  async softDeleteEvent(organizationId, eventId) {
    const event = await prisma.event.findFirst({
      where: { id: eventId, organizationId },
    });

    if (!event) {
      throw AppError.notFound('Event not found');
    }

    return await prisma.event.update({
      where: { id: eventId },
      data: {
        status: 'ARCHIVED',
        deletedAt: new Date(),
      },
    });
  }

  // =========================================================================
  // 5. PUBLIC MARKETPLACE DISCOVERY (UNAUTHENTICATED)
  // =========================================================================

  /**
   * Browse and filter live published events for marketplace visitors
   */
  async getPublicEvents(query = {}) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const where = {
      status: 'PUBLISHED',
      deletedAt: null,
    };

    if (query.category) {
      where.category = query.category;
    }

    if (query.isFeatured !== undefined) {
      where.isFeatured = query.isFeatured === 'true' || query.isFeatured === true;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { performers: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.city) {
      where.venue = {
        city: { contains: query.city, mode: 'insensitive' },
      };
    }

    const [total, events] = await Promise.all([
      prisma.event.count({ where }),
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startDate: 'asc' },
        include: {
          venue: {
            select: {
              id: true,
              name: true,
              address: true,
              city: true,
              state: true,
              country: true,
              capacity: true,
              facilities: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          sessions: {
            where: { status: 'SCHEDULED' },
            orderBy: { startTime: 'asc' },
            select: {
              id: true,
              title: true,
              startTime: true,
              endTime: true,
            },
          },
          ticketTiers: {
            where: { status: 'ACTIVE' },
            orderBy: { price: 'asc' },
            select: {
              id: true,
              name: true,
              seatType: true,
              price: true,
              currency: true,
              availableQuantity: true,
              totalQuantity: true,
            },
          },
        },
      }),
    ]);

    // Format events with computed fields: startingPrice and availableTickets
    const formattedEvents = events.map((event) => {
      const prices = event.ticketTiers.map((t) => Number(t.price));
      const startingPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const currency = event.ticketTiers[0]?.currency || 'INR';
      const availableTickets = event.ticketTiers.reduce(
        (acc, t) => acc + (t.availableQuantity || 0),
        0
      );

      return {
        ...event,
        startingPrice,
        currency,
        availableTickets,
      };
    });

    return {
      events: formattedEvents,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single published event by ID or Slug with full details
   */
  async getPublicEventBySlugOrId(identifier) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      identifier
    );

    const where = {
      status: 'PUBLISHED',
      deletedAt: null,
      ...(isUuid ? { id: identifier } : { slug: identifier }),
    };

    const event = await prisma.event.findFirst({
      where,
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            state: true,
            country: true,
            capacity: true,
            facilities: true,
            rules: true,
            images: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        sessions: {
          where: { status: 'SCHEDULED' },
          orderBy: { startTime: 'asc' },
        },
        ticketTiers: {
          where: { status: 'ACTIVE' },
          orderBy: { price: 'asc' },
        },
      },
    });

    if (!event) {
      throw AppError.notFound('Event not found or is no longer active');
    }

    const prices = event.ticketTiers.map((t) => Number(t.price));
    const startingPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const currency = event.ticketTiers[0]?.currency || 'INR';
    const availableTickets = event.ticketTiers.reduce(
      (acc, t) => acc + (t.availableQuantity || 0),
      0
    );

    return {
      ...event,
      startingPrice,
      currency,
      availableTickets,
    };
  }
}

module.exports = new EventService();
