const crypto = require('crypto');

/**
 * Generates a cryptographically secure 6-digit numeric OTP
 * @returns {string} 6-digit OTP string
 */
const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Hashes an OTP string using SHA-256 for secure database storage
 * @param {string} otp 
 * @returns {string} SHA-256 hex hash
 */
const hashOtp = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

/**
 * Verifies a candidate plain OTP against a stored SHA-256 hash using timing-safe comparison
 * @param {string} candidateOtp 
 * @param {string} storedHash 
 * @returns {boolean}
 */
const verifyOtpHash = (candidateOtp, storedHash) => {
  const candidateHash = hashOtp(candidateOtp);
  if (candidateHash.length !== storedHash.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(candidateHash), Buffer.from(storedHash));
};

module.exports = {
  generateOtp,
  hashOtp,
  verifyOtpHash,
};
