const { z } = require('zod');

const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().trim().max(20, 'Phone number too long').optional(),
  avatarUrl: z.string().trim().url('Invalid avatar URL').optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

module.exports = {
  updateProfileSchema,
};
