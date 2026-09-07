const express = require('express');
const authController = require('./auth.controller');
const validate = require('../../shared/middleware/validate.middleware');
const authMiddleware = require('../../shared/middleware/auth.middleware');
const {
  otpSendLimiter,
  otpVerifyLimiter,
} = require('../../shared/middleware/rateLimiter.middleware');
const {
  sendOtpSchema,
  verifyOtpSchema,
  googleAuthSchema,
  verifyStaffInviteSchema,
} = require('./auth.validation');

const router = express.Router();

/**
 * Public Authentication Routes
 */
router.post('/otp/send', otpSendLimiter, validate(sendOtpSchema), authController.sendOtp);
router.post('/otp/verify', otpVerifyLimiter, validate(verifyOtpSchema), authController.verifyOtp);
router.post('/google', validate(googleAuthSchema), authController.googleAuth);
router.post('/staff/verify-invite', validate(verifyStaffInviteSchema), authController.verifyStaffInvite);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);

/**
 * Protected Identity Routes
 */
router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;
