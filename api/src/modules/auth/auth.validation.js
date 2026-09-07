const { z } = require('zod');

const sendOtpSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  purpose: z.enum(['LOGIN', 'STAFF_INVITE']).default('LOGIN'),
});

const verifyOtpSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  otp: z.string().trim().length(6, 'OTP must be exactly 6 digits'),
});

const googleAuthSchema = z.object({
  idToken: z.string().trim().min(1, 'Google ID Token is required'),
});

const verifyStaffInviteSchema = z.object({
  invitationToken: z.string().trim().min(1, 'Invitation token is required'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  otp: z.string().trim().length(6, 'OTP must be exactly 6 digits'),
});

module.exports = {
  sendOtpSchema,
  verifyOtpSchema,
  googleAuthSchema,
  verifyStaffInviteSchema,
};
