const { z } = require('zod');

// 1. Venue Master Schemas
const createVenueSchema = z.object({
  name: z.string({ required_error: 'Venue name is required' }).trim().min(2, 'Name must be at least 2 characters').max(150),
  description: z.string().trim().optional(),
  address: z.string({ required_error: 'Address is required' }).trim().min(3, 'Address must be at least 3 characters'),
  city: z.string({ required_error: 'City is required' }).trim().min(2).max(100),
  state: z.string().trim().max(100).optional(),
  country: z.string().trim().max(100).default('India'),
  postalCode: z.string().trim().max(20).optional(),
  contactName: z.string().trim().max(100).optional(),
  contactEmail: z.string().email('Invalid contact email').optional().or(z.literal('')),
  contactPhone: z.string().trim().max(20).optional().or(z.literal('')),
  capacity: z.number().int().min(0).default(0),
  facilities: z.array(z.string().trim()).default([]),
  rules: z.string().trim().optional(),
  images: z.array(z.string().url('Image must be a valid URL')).default([]),
});

const updateVenueSchema = createVenueSchema.partial();

const toggleVenueStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED'], {
    errorMap: () => ({ message: 'Status must be ACTIVE, INACTIVE, or ARCHIVED' }),
  }),
});

// 2. Commercial Contract / Deal Schemas
const createContractSchema = z.object({
  dealTitle: z.string({ required_error: 'Deal title is required' }).trim().min(2).max(200),
  eventName: z.string().trim().max(200).optional(),
  eventId: z.string().uuid('Invalid event ID').optional(),
  startDate: z.string({ required_error: 'Start date is required' }).datetime({ message: 'Start date must be an ISO 8601 datetime' }),
  endDate: z.string({ required_error: 'End date is required' }).datetime({ message: 'End date must be an ISO 8601 datetime' }),
  allocatedCapacity: z.number().int().min(0, 'Allocated capacity must be 0 or more').default(0),
  rentalAmount: z.number().min(0, 'Rental amount cannot be negative'),
  currency: z.string().trim().max(10).default('INR'),
  securityDeposit: z.number().min(0).default(0),
  cleaningFee: z.number().min(0).default(0),
  electricityCharges: z.number().min(0).default(0),
  otherCharges: z.number().min(0).default(0),
  paidAmount: z.number().min(0).default(0),
  paymentStatus: z.enum(['PENDING', 'PARTIALLY_PAID', 'PAID', 'REFUNDED']).default('PENDING'),
  contractStatus: z.enum(['DRAFT', 'NEGOTIATING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).default('DRAFT'),
  terms: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  contractUrl: z.string().url('Invalid contract document URL').optional().or(z.literal('')),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: 'End date must be greater than or equal to start date',
  path: ['endDate'],
});

const updateContractSchema = z.object({
  dealTitle: z.string().trim().min(2).max(200).optional(),
  eventName: z.string().trim().max(200).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  allocatedCapacity: z.number().int().min(0).optional(),
  rentalAmount: z.number().min(0).optional(),
  securityDeposit: z.number().min(0).optional(),
  cleaningFee: z.number().min(0).optional(),
  electricityCharges: z.number().min(0).optional(),
  otherCharges: z.number().min(0).optional(),
  paidAmount: z.number().min(0).optional(),
  paymentStatus: z.enum(['PENDING', 'PARTIALLY_PAID', 'PAID', 'REFUNDED']).optional(),
  contractStatus: z.enum(['DRAFT', 'NEGOTIATING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
  terms: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  contractUrl: z.string().url().optional().or(z.literal('')),
});

const recordPaymentSchema = z.object({
  amount: z.number().positive('Payment amount must be greater than 0'),
  notes: z.string().trim().optional(),
});

// 3. Seating Layout & Coordinate Schemas
const createLayoutSchema = z.object({
  name: z.string({ required_error: 'Layout name is required' }).trim().min(2).max(150),
  description: z.string().trim().optional(),
  isDefault: z.boolean().default(false),
});

const singleSeatSchema = z.object({
  seatNumber: z.string({ required_error: 'Seat number is required' }).trim().min(1).max(20),
  rowNumber: z.string().trim().max(20).optional(),
  section: z.string().trim().max(100).default('General'),
  seatType: z.enum(['STANDARD', 'VIP', 'PREMIUM', 'ACCESSIBLE']).default('STANDARD'),
  xPosition: z.number(),
  yPosition: z.number(),
});

const batchSeatsSchema = z.object({
  seats: z.array(singleSeatSchema).min(1, 'At least one seat is required'),
});

module.exports = {
  createVenueSchema,
  updateVenueSchema,
  toggleVenueStatusSchema,
  createContractSchema,
  updateContractSchema,
  recordPaymentSchema,
  createLayoutSchema,
  batchSeatsSchema,
};
