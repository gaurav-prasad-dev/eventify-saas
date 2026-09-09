const Razorpay = require('razorpay');
const crypto = require('crypto');
const env = require('./env');

let razorpayClient = null;

if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET) {
  razorpayClient = new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  });
  console.log('💳 Razorpay Client initialized in Test/Live Mode with Key ID:', env.RAZORPAY_KEY_ID.substring(0, 12) + '...');
} else {
  console.warn('⚠️ Razorpay credentials not found in env. Razorpay features will run in mock simulation mode.');
}

/**
 * Verify client-side checkout signature (orderId|paymentId)
 * @param {string} orderId 
 * @param {string} paymentId 
 * @param {string} signature 
 * @returns {boolean}
 */
const verifyPaymentSignature = (orderId, paymentId, signature) => {
  if (!env.RAZORPAY_KEY_SECRET) {
    // If running in sandbox without secret, accept mock signatures
    return signature === `mock_sig_${orderId}_${paymentId}`;
  }

  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return expectedSignature === signature;
};

/**
 * Verify server-to-server webhook HMAC signature against raw request body
 * @param {Buffer|string} rawBody 
 * @param {string} signature 
 * @param {string} [customSecret] 
 * @returns {boolean}
 */
const verifyWebhookSignature = (rawBody, signature, customSecret) => {
  const secret = customSecret || env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  return expectedSignature === signature;
};

module.exports = {
  razorpayClient,
  verifyPaymentSignature,
  verifyWebhookSignature,
};
