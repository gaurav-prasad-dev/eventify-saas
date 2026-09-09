const crypto = require('crypto');
const QRCode = require('qrcode');
const env = require('../../config/env');

const QR_SIGNING_SECRET = env.JWT_ACCESS_SECRET || 'eventify_ticket_qr_secret_key_2026';

/**
 * Generate human-readable unique ticket number
 * @param {string} bookingNumber e.g. "BK-MTTSBJK9-TU2O"
 * @param {number} index 1, 2, 3...
 */
function generateTicketNumber(bookingNumber, index) {
  const cleanBooking = bookingNumber ? bookingNumber.replace('BK-', '') : Date.now().toString(36).toUpperCase();
  return `TKT-${cleanBooking}-${String(index).padStart(2, '0')}`;
}

/**
 * Generate cryptographically signed QR code payload
 * @param {object} ticketData
 */
function generateSignedQrPayload(ticketData) {
  const payloadToSign = {
    ticketNumber: ticketData.ticketNumber,
    eventId: ticketData.eventId,
    sessionId: ticketData.sessionId,
    seatNumber: ticketData.seatNumber || 'GENERAL_ADMISSION',
    section: ticketData.section || 'General',
    tierName: ticketData.tierName || 'Standard',
    issuedAt: Date.now(),
  };

  const signature = crypto
    .createHmac('sha256', QR_SIGNING_SECRET)
    .update(`${payloadToSign.ticketNumber}|${payloadToSign.eventId}|${payloadToSign.sessionId}|${payloadToSign.seatNumber}|${payloadToSign.issuedAt}`)
    .digest('hex');

  return JSON.stringify({ ...payloadToSign, sig: signature });
}

/**
 * Verify cryptographic signature of a scanned QR payload
 * @param {string} qrDataString
 */
function verifyQrPayload(qrDataString) {
  try {
    const data = JSON.parse(qrDataString);
    if (!data || !data.ticketNumber || !data.eventId || !data.sessionId || !data.sig || !data.issuedAt) {
      return { valid: false, error: 'Malformed QR code format' };
    }

    const expectedSignature = crypto
      .createHmac('sha256', QR_SIGNING_SECRET)
      .update(`${data.ticketNumber}|${data.eventId}|${data.sessionId}|${data.seatNumber || 'GENERAL_ADMISSION'}|${data.issuedAt}`)
      .digest('hex');

    if (expectedSignature !== data.sig) {
      return { valid: false, error: 'Cryptographic signature mismatch: Forged or tampered ticket' };
    }

    return { valid: true, data };
  } catch (err) {
    return { valid: false, error: 'Unreadable or invalid QR code format: ' + err.message };
  }
}

/**
 * Generate high-resolution Base64 PNG Data URL for a QR code
 * @param {string} qrDataString
 * @returns {Promise<string>} data:image/png;base64,...
 */
async function generateQrCodeImage(qrDataString) {
  return await QRCode.toDataURL(qrDataString, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 320,
    color: {
      dark: '#111827', // Slate 900
      light: '#FFFFFF',
    },
  });
}

module.exports = {
  generateTicketNumber,
  generateSignedQrPayload,
  verifyQrPayload,
  generateQrCodeImage,
};
