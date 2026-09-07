const rateLimit = require('express-rate-limit');
const { sendError } = require('../utils/apiResponse');

/**
 * Standard handler to format rate-limit errors into Eventify standard JSON format
 */
const rateLimitHandler = (message) => (req, res, next, options) => {
  return sendError(res, options.statusCode, message, [
    {
      field: 'rateLimit',
      message,
    },
  ]);
};

/**
 * Global API Rate Limiter
 * Applied across all /api/v1 routes to prevent general DDoS, scraping, and server overload.
 * Limit: 100 requests per 15 minutes per IP.
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Max 100 requests per windowMs
  standardHeaders: 'draft-7', // Returns RateLimit-* headers
  legacyHeaders: true, // Returns X-RateLimit-* headers for legacy/easy frontend consumption
  handler: rateLimitHandler('Too many requests from this IP address. Please try again in 15 minutes.'),
});

/**
 * Strict OTP Send Rate Limiter
 * Applied specifically to POST /api/v1/auth/otp/send.
 * Prevents bots from spamming email dispatchers and burning email credits.
 * Limit: 5 requests per 15 minutes per IP.
 */
const otpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // Max 5 OTP requests per IP per 15 mins
  standardHeaders: 'draft-7',
  legacyHeaders: true,
  handler: rateLimitHandler('Too many verification codes requested from this IP. Please try again after 15 minutes.'),
});

/**
 * Strict OTP Verify Rate Limiter
 * Applied specifically to POST /api/v1/auth/otp/verify.
 * Stops automated scripts from attempting to brute-force OTP codes across multiple accounts.
 * Limit: 10 verify attempts per 15 minutes per IP.
 */
const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // Max 10 attempts per IP per 15 mins
  standardHeaders: 'draft-7',
  legacyHeaders: true,
  handler: rateLimitHandler('Too many verification attempts from this IP. Please wait 15 minutes before trying again.'),
});

module.exports = {
  globalLimiter,
  otpSendLimiter,
  otpVerifyLimiter,
};
