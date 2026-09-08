const prisma = require('../../database/prisma');
const AppError = require('../../shared/errors/AppError');

class VenueService {
  // =========================================================================
  // 1. VENUE MASTER PROFILE
  // =========================================================================

  /**
   * Create permanent venue master profile
   */
  async createVenue(organizationId, userId, data) {
    const venue = await prisma.venue.create({
      data: {
        organizationId,
        createdBy: userId,
        name: data.name,
        description: data.description,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country || 'India',
        postalCode: data.postalCode,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        capacity: data.capacity || 0,
        facilities: data.facilities || [],
        rules: data.rules,
        images: data.images || [],
        status: 'ACTIVE',
      },
    });

    return venue;
  }

  /**
   * List venues for an organization with filtering and pagination
   */
  async getVenues(organizationId, query = {}) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const where = {
      organizationId,
      status: query.status || { not: 'ARCHIVED' },
    };

    if (query.city) {
      where.city = { equals: query.city, mode: 'insensitive' };
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { city: { contains: query.search, mode: 'insensitive' } },
        { address: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, venues] = await Promise.all([
      prisma.venue.count({ where }),
      prisma.venue.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              seatingLayouts: true,
              contracts: true,
            },
          },
        },
      }),
    ]);

    return {
      venues,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single venue details with layouts and commercial deal summary
   */
  async getVenueById(organizationId, venueId) {
    const venue = await prisma.venue.findFirst({
      where: {
        id: venueId,
        organizationId,
        status: { not: 'ARCHIVED' },
      },
      include: {
        seatingLayouts: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'asc' },
        },
        contracts: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: {
            seatingLayouts: true,
            contracts: true,
          },
        },
      },
    });

    if (!venue) {
      throw AppError.notFound('Venue not found or has been archived');
    }

    // Aggregate deal summary statistics for this venue
    const dealAggregates = await prisma.venueContract.aggregate({
      where: { venueId, organizationId },
      _sum: {
        totalCost: true,
        paidAmount: true,
      },
      _count: {
        id: true,
      },
    });

    return {
      ...venue,
      dealSummary: {
        totalDeals: dealAggregates._count.id || 0,
        totalHistoricalCost: dealAggregates._sum.totalCost || 0,
        totalPaid: dealAggregates._sum.paidAmount || 0,
      },
    };
  }

  /**
   * Update venue master profile
   */
  async updateVenue(organizationId, venueId, data) {
    const venue = await prisma.venue.findFirst({
      where: { id: venueId, organizationId, status: { not: 'ARCHIVED' } },
    });

    if (!venue) {
      throw AppError.notFound('Venue not found');
    }

    return await prisma.venue.update({
      where: { id: venueId },
      data: {
        name: data.name,
        description: data.description,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        postalCode: data.postalCode,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        capacity: data.capacity,
        facilities: data.facilities,
        rules: data.rules,
        images: data.images,
      },
    });
  }

  /**
   * Toggle venue status (ACTIVE / INACTIVE / ARCHIVED)
   */
  async setVenueStatus(organizationId, venueId, status) {
    const venue = await prisma.venue.findFirst({
      where: { id: venueId, organizationId },
    });

    if (!venue) {
      throw AppError.notFound('Venue not found');
    }

    const updateData = { status };
    if (status === 'ARCHIVED') {
      updateData.deletedAt = new Date();
    } else {
      updateData.deletedAt = null;
    }

    return await prisma.venue.update({
      where: { id: venueId },
      data: updateData,
    });
  }

  /**
   * Soft delete venue
   */
  async softDeleteVenue(organizationId, venueId) {
    return await this.setVenueStatus(organizationId, venueId, 'ARCHIVED');
  }

  // =========================================================================
  // 2. PER-EVENT COMMERCIAL DEALS / CONTRACTS
  // =========================================================================

  /**
   * Finalize a commercial deal for an event with this venue
   */
  async createVenueContract(organizationId, venueId, user, data) {
    const venue = await prisma.venue.findFirst({
      where: { id: venueId, organizationId, status: { not: 'ARCHIVED' } },
    });

    if (!venue) {
      throw AppError.notFound('Venue not found or is archived');
    }

    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const diffTime = Math.abs(end - start);
    const calculatedDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const totalDays = data.totalDays || calculatedDays;

    const rentalAmount = Number(data.rentalAmount) || 0;
    const cleaningFee = Number(data.cleaningFee) || 0;
    const electricityCharges = Number(data.electricityCharges) || 0;
    const otherCharges = Number(data.otherCharges) || 0;
    const securityDeposit = Number(data.securityDeposit) || 0;
    const paidAmount = Number(data.paidAmount) || 0;

    const totalCost = rentalAmount + cleaningFee + electricityCharges + otherCharges;

    let paymentStatus = data.paymentStatus || 'PENDING';
    if (paidAmount >= totalCost && totalCost > 0) {
      paymentStatus = 'PAID';
    } else if (paidAmount > 0) {
      paymentStatus = 'PARTIALLY_PAID';
    }

    const contract = await prisma.venueContract.create({
      data: {
        organizationId,
        venueId,
        createdBy: user.id,
        dealTitle: data.dealTitle,
        eventName: data.eventName || data.dealTitle,
        eventId: data.eventId,
        startDate: start,
        endDate: end,
        totalDays,
        allocatedCapacity: data.allocatedCapacity || venue.capacity,
        rentalAmount,
        currency: data.currency || 'INR',
        securityDeposit,
        cleaningFee,
        electricityCharges,
        otherCharges,
        totalCost,
        paidAmount,
        paymentStatus,
        contractStatus: data.contractStatus || 'CONFIRMED',
        terms: data.terms || venue.rules,
        notes: data.notes,
        contractUrl: data.contractUrl,
      },
    });

    return contract;
  }

  /**
   * List all historical deals cracked with a venue
   */
  async getVenueContracts(organizationId, venueId, query = {}) {
    const venue = await prisma.venue.findFirst({
      where: { id: venueId, organizationId },
    });

    if (!venue) {
      throw AppError.notFound('Venue not found');
    }

    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const where = { organizationId, venueId };
    if (query.contractStatus) {
      where.contractStatus = query.contractStatus;
    }
    if (query.paymentStatus) {
      where.paymentStatus = query.paymentStatus;
    }

    const [total, contracts] = await Promise.all([
      prisma.venueContract.count({ where }),
      prisma.venueContract.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      venue: { id: venue.id, name: venue.name },
      contracts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get specific contract breakdown
   */
  async getVenueContractById(organizationId, venueId, contractId) {
    const contract = await prisma.venueContract.findFirst({
      where: { id: contractId, venueId, organizationId },
      include: {
        venue: {
          select: { id: true, name: true, address: true, city: true, contactEmail: true },
        },
      },
    });

    if (!contract) {
      throw AppError.notFound('Venue contract not found');
    }

    const outstandingBalance = (Number(contract.totalCost) - Number(contract.paidAmount)).toFixed(2);

    return {
      ...contract,
      outstandingBalance: Number(outstandingBalance),
    };
  }

  /**
   * Update contract terms or status
   */
  async updateVenueContract(organizationId, venueId, contractId, data) {
    const existing = await prisma.venueContract.findFirst({
      where: { id: contractId, venueId, organizationId },
    });

    if (!existing) {
      throw AppError.notFound('Venue contract not found');
    }

    const rentalAmount = data.rentalAmount !== undefined ? Number(data.rentalAmount) : Number(existing.rentalAmount);
    const cleaningFee = data.cleaningFee !== undefined ? Number(data.cleaningFee) : Number(existing.cleaningFee);
    const electricityCharges = data.electricityCharges !== undefined ? Number(data.electricityCharges) : Number(existing.electricityCharges);
    const otherCharges = data.otherCharges !== undefined ? Number(data.otherCharges) : Number(existing.otherCharges);
    const totalCost = rentalAmount + cleaningFee + electricityCharges + otherCharges;

    return await prisma.venueContract.update({
      where: { id: contractId },
      data: {
        dealTitle: data.dealTitle,
        eventName: data.eventName,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        allocatedCapacity: data.allocatedCapacity,
        rentalAmount,
        cleaningFee,
        electricityCharges,
        otherCharges,
        totalCost,
        securityDeposit: data.securityDeposit !== undefined ? Number(data.securityDeposit) : undefined,
        contractStatus: data.contractStatus,
        terms: data.terms,
        notes: data.notes,
        contractUrl: data.contractUrl,
      },
    });
  }

  /**
   * Record a payment installment against a contract
   */
  async recordContractPayment(organizationId, venueId, contractId, paymentData) {
    const contract = await prisma.venueContract.findFirst({
      where: { id: contractId, venueId, organizationId },
    });

    if (!contract) {
      throw AppError.notFound('Venue contract not found');
    }

    const newPaidAmount = Number(contract.paidAmount) + Number(paymentData.amount);
    const totalCost = Number(contract.totalCost);

    let paymentStatus = contract.paymentStatus;
    if (newPaidAmount >= totalCost) {
      paymentStatus = 'PAID';
    } else if (newPaidAmount > 0) {
      paymentStatus = 'PARTIALLY_PAID';
    }

    const updated = await prisma.venueContract.update({
      where: { id: contractId },
      data: {
        paidAmount: newPaidAmount,
        paymentStatus,
      },
    });

    return {
      ...updated,
      outstandingBalance: Math.max(0, totalCost - newPaidAmount),
    };
  }

  // =========================================================================
  // 3. SEATING LAYOUT & VISUAL SEAT ENGINE
  // =========================================================================

  /**
   * Create a seating layout for a venue
   */
  async createSeatingLayout(organizationId, venueId, data) {
    const venue = await prisma.venue.findFirst({
      where: { id: venueId, organizationId, status: { not: 'ARCHIVED' } },
    });

    if (!venue) {
      throw AppError.notFound('Venue not found');
    }

    if (data.isDefault) {
      await prisma.venueSeatingLayout.updateMany({
        where: { venueId },
        data: { isDefault: false },
      });
    }

    return await prisma.venueSeatingLayout.create({
      data: {
        venueId,
        name: data.name,
        description: data.description,
        isDefault: data.isDefault || false,
        status: 'ACTIVE',
      },
    });
  }

  /**
   * List layouts for a venue
   */
  async getVenueLayouts(organizationId, venueId) {
    const venue = await prisma.venue.findFirst({
      where: { id: venueId, organizationId, status: { not: 'ARCHIVED' } },
    });

    if (!venue) {
      throw AppError.notFound('Venue not found');
    }

    return await prisma.venueSeatingLayout.findMany({
      where: { venueId, status: 'ACTIVE' },
      include: {
        _count: {
          select: { seats: true },
        },
      },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
  }

  /**
   * High-performance batch insertion of seat coordinates using createMany
   */
  async batchCreateSeats(organizationId, venueId, layoutId, seats) {
    const layout = await prisma.venueSeatingLayout.findFirst({
      where: {
        id: layoutId,
        venueId,
        venue: { organizationId, status: { not: 'ARCHIVED' } },
      },
    });

    if (!layout) {
      throw AppError.notFound('Seating layout not found for this venue');
    }

    const formattedSeats = seats.map((seat) => ({
      layoutId,
      seatNumber: seat.seatNumber,
      rowNumber: seat.rowNumber || null,
      section: seat.section || 'General',
      seatType: seat.seatType || 'STANDARD',
      xPosition: seat.xPosition,
      yPosition: seat.yPosition,
      status: 'ACTIVE',
    }));

    const result = await prisma.venueSeat.createMany({
      data: formattedSeats,
      skipDuplicates: true,
    });

    // Update total seat counter on layout
    const totalCount = await prisma.venueSeat.count({
      where: { layoutId, status: 'ACTIVE' },
    });

    await prisma.venueSeatingLayout.update({
      where: { id: layoutId },
      data: { totalSeats: totalCount },
    });

    return {
      insertedCount: result.count,
      totalSeats: totalCount,
    };
  }

  /**
   * Get visual coordinate map of seats for a layout
   */
  async getLayoutSeats(organizationId, venueId, layoutId) {
    const layout = await prisma.venueSeatingLayout.findFirst({
      where: {
        id: layoutId,
        venueId,
        venue: { organizationId, status: { not: 'ARCHIVED' } },
      },
    });

    if (!layout) {
      throw AppError.notFound('Seating layout not found');
    }

    const seats = await prisma.venueSeat.findMany({
      where: { layoutId },
      orderBy: [{ section: 'asc' }, { seatNumber: 'asc' }],
    });

    return {
      layout: {
        id: layout.id,
        name: layout.name,
        totalSeats: layout.totalSeats,
      },
      seats,
    };
  }
}

module.exports = new VenueService();
