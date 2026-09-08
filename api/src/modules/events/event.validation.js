const { z } = require('zod');

// 1. EVENT MASTER VALIDATIONS
const baseEventSchema = z.object({
  venueId: z.string({ required_error: 'Venue ID is required' }).uuid('Invalid Venue UUID'),
  venueContractId: z.string().uuid('Invalid Venue Contract UUID').optional().nullable(),
  seatingLayoutId: z.string().uuid('Invalid Seating Layout UUID').optional().nullable(),
  title: z.string({ required_error: 'Event title is required' }).trim().min(2, 'Title must be at least 2 characters').max(200),
  description: z.string({ required_error: 'Event description is required' }).trim().min(5, 'Description must be at least 5 characters'),
  shortDescription: z.string().trim().max(500).optional(),
  category: z.enum(
    ['MUSIC', 'TECH', 'COMEDY', 'SPORTS', 'THEATRE', 'WORKSHOP', 'CONFERENCE', 'FESTIVAL', 'OTHER'],
    { errorMap: () => ({ message: 'Category must be one of: MUSIC, TECH, COMEDY, SPORTS, THEATRE, WORKSHOP, CONFERENCE, FESTIVAL, OTHER' }) }
  ),
  tags: z.array(z.string().trim()).default([]),
  performers: z.string().trim().optional(),
  ageRestriction: z.enum(['ALL_AGES', '13+', '16+', '18+', '21+']).default('ALL_AGES'),
  startDate: z.string({ required_error: 'Start date is required' }).datetime({ message: 'Start date must be an ISO 8601 datetime' }),
  endDate: z.string({ required_error: 'End date is required' }).datetime({ message: 'End date must be an ISO 8601 datetime' }),
  bannerUrl: z.string().url('Invalid banner URL').optional(),
  thumbnailUrl: z.string().url('Invalid thumbnail URL').optional(),
  isFeatured: z.boolean().default(false),
});

const createEventSchema = baseEventSchema.refine(
  (data) => new Date(data.endDate) >= new Date(data.startDate),
  {
    message: 'End date must be greater than or equal to start date',
    path: ['endDate'],
  }
);

const updateEventSchema = baseEventSchema.partial();

// 2. EVENT SESSION VALIDATIONS
const baseSessionSchema = z.object({
  title: z.string({ required_error: 'Session title is required' }).trim().min(2).max(150),
  description: z.string().trim().optional(),
  startTime: z.string({ required_error: 'Start time is required' }).datetime({ message: 'Start time must be an ISO 8601 datetime' }),
  endTime: z.string({ required_error: 'End time is required' }).datetime({ message: 'End time must be an ISO 8601 datetime' }),
});

const createSessionSchema = baseSessionSchema.refine(
  (data) => new Date(data.endTime) >= new Date(data.startTime),
  {
    message: 'Session end time must be greater than or equal to start time',
    path: ['endTime'],
  }
);

const updateSessionSchema = z.object({
  title: z.string().trim().min(2).max(150).optional(),
  description: z.string().trim().optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  status: z.enum(['SCHEDULED', 'RUNNING', 'COMPLETED', 'CANCELLED']).optional(),
});

// 3. TICKET PRICING TIER VALIDATIONS
const createTierSchema = z.object({
  name: z.string({ required_error: 'Tier name is required' }).trim().min(2).max(100),
  seatType: z.enum(['VIP', 'GOLD', 'RECLINER', 'PREMIUM', 'STANDARD', 'ACCESSIBLE']).default('STANDARD'),
  price: z.number({ required_error: 'Price is required' }).min(0, 'Price cannot be negative'),
  currency: z.string().trim().max(10).default('INR'),
  totalQuantity: z.number().int().min(1, 'Quantity must be at least 1'),
  maxPerOrder: z.number().int().min(1).default(6),
  salesStartTime: z.string().datetime().optional().nullable(),
  salesEndTime: z.string().datetime().optional().nullable(),
  description: z.string().trim().optional(),
});

const updateTierSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  seatType: z.enum(['VIP', 'GOLD', 'RECLINER', 'PREMIUM', 'STANDARD', 'ACCESSIBLE']).optional(),
  price: z.number().min(0).optional(),
  totalQuantity: z.number().int().min(1).optional(),
  maxPerOrder: z.number().int().min(1).optional(),
  salesStartTime: z.string().datetime().optional().nullable(),
  salesEndTime: z.string().datetime().optional().nullable(),
  description: z.string().trim().optional(),
  status: z.enum(['ACTIVE', 'SOLD_OUT', 'INACTIVE']).optional(),
});

module.exports = {
  createEventSchema,
  updateEventSchema,
  createSessionSchema,
  updateSessionSchema,
  createTierSchema,
  updateTierSchema,
};
