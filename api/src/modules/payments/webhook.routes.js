const express = require('express');
const paymentController = require('./payment.controller');

const router = express.Router();

// Public server-to-server webhook endpoint from Razorpay
// Cryptographically verified via HMAC SHA256 inside the controller
router.post('/razorpay', paymentController.handleWebhook);

module.exports = router;
