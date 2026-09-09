const { z } = require('zod');

const validateTicketSchema = z.object({
  qrData: z.string().min(10, 'Valid QR code data payload is required'),
  sessionId: z.string().uuid('Valid session ID is required').optional(),
});

const manualCheckInSchema = z.object({
  ticketNumber: z.string().min(5, 'Valid ticket number is required'),
  sessionId: z.string().uuid('Valid session ID is required').optional(),
});

const myTicketsQuerySchema = z.object({
  status: z.enum(['ISSUED', 'CHECKED_IN', 'CANCELLED']).optional(),
  type: z.enum(['upcoming', 'past']).optional(),
});

module.exports = {
  validateTicketSchema,
  manualCheckInSchema,
  myTicketsQuerySchema,
};
