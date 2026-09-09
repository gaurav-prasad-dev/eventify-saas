const { z } = require('zod');

const lockSeatsSchema = z.object({
  sessionId: z.string().uuid('Valid session ID is required'),
  seatIds: z
    .array(z.string().uuid('Invalid seat ID format'))
    .min(1, 'At least one seat must be selected')
    .max(6, 'You can only select up to 6 seats per booking'),
});

const releaseSeatsSchema = z.object({
  sessionId: z.string().uuid('Valid session ID is required'),
  seatIds: z.array(z.string().uuid()).min(1, 'At least one seat ID must be provided'),
});

const reserveBookingSchema = z
  .object({
    eventId: z.string().uuid('Valid event ID is required'),
    sessionId: z.string().uuid('Valid session ID is required'),
    reservedSeats: z
      .array(
        z.object({
          venueSeatId: z.string().uuid('Valid venue seat ID is required'),
          ticketTierId: z.string().uuid('Valid ticket tier ID is required'),
        })
      )
      .optional()
      .default([]),
    standingTickets: z
      .array(
        z.object({
          ticketTierId: z.string().uuid('Valid ticket tier ID is required'),
          quantity: z.number().int().min(1).max(6),
        })
      )
      .optional()
      .default([]),
  })
  .refine(
    (data) => data.reservedSeats.length > 0 || data.standingTickets.length > 0,
    {
      message: 'Must provide either reserved seats or standing tickets for reservation',
      path: ['reservedSeats'],
    }
  );

module.exports = {
  lockSeatsSchema,
  releaseSeatsSchema,
  reserveBookingSchema,
};
