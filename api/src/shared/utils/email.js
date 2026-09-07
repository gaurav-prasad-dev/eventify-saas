const nodemailer = require('nodemailer');
const env = require('../../config/env');

// Initialize Nodemailer SMTP Transporter
let transporter = null;

const getTransporter = () => {
  if (!transporter && env.SMTP_USER && env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE, // true for 465, false for 587
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

/**
 * Builds a modern HTML template for Eventify verification emails
 * @param {string} otp 
 * @param {string} purpose 
 * @returns {string} HTML string
 */
const buildOtpTemplate = (otp, purpose) => {
  const isInvite = purpose === 'STAFF_INVITE';
  const heading = isInvite ? 'Staff Invitation Verification' : 'Your Login Verification Code';
  const description = isInvite
    ? 'You have been invited to join an organization on Eventify. Use the verification code below to activate your account.'
    : 'Use the verification code below to complete your login to Eventify SaaS. This code is valid for 5 minutes.';

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f9; margin: 0; padding: 0; }
      .container { max-width: 540px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
      .header { background: #4f46e5; padding: 24px; text-align: center; color: #ffffff; }
      .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; }
      .content { padding: 32px 28px; text-align: center; color: #334155; }
      .content h2 { margin-top: 0; font-size: 20px; color: #1e293b; }
      .content p { font-size: 15px; line-height: 1.6; color: #64748b; margin: 16px 0; }
      .otp-box { background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 10px; display: inline-block; padding: 16px 36px; margin: 24px 0; }
      .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #4f46e5; font-family: monospace; }
      .footer { background: #f8fafc; padding: 18px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Eventify SaaS</h1>
      </div>
      <div class="content">
        <h2>${heading}</h2>
        <p>${description}</p>
        <div class="otp-box">
          <div class="otp-code">${otp}</div>
        </div>
        <p style="font-size: 13px; color: #94a3b8;">
          If you did not request this verification code, please ignore this email or contact support.
        </p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} Eventify SaaS Platform. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
};

/**
 * Sends an OTP email using Nodemailer via SMTP protocol
 * @param {object} params
 * @param {string} params.email - Recipient email
 * @param {string} params.otp - Plain 6-digit OTP
 * @param {string} params.purpose - Purpose ('LOGIN', 'STAFF_INVITE')
 */
const sendOtpEmail = async ({ email, otp, purpose = 'LOGIN' }) => {
  const mailTransporter = getTransporter();

  // If SMTP credentials are provided, send actual email via SMTP protocol
  if (mailTransporter) {
    try {
      const subject = purpose === 'STAFF_INVITE'
        ? 'Eventify - Staff Invitation Verification Code'
        : 'Eventify - Your Login Verification Code';

      const mailOptions = {
        from: env.SMTP_FROM,
        to: email,
        subject,
        text: `Your Eventify verification code is: ${otp}. It expires in 5 minutes.`,
        html: buildOtpTemplate(otp, purpose),
      };

      const info = await mailTransporter.sendMail(mailOptions);
      console.log(`📧 [SMTP SUCCESS] Email delivered to ${email} (Message ID: ${info.messageId})`);
      return true;
    } catch (error) {
      console.error('❌ [SMTP ERROR] Failed to send email via Nodemailer:', error.message);
      // Fall through to console logging in development so app doesn't hang
      if (env.NODE_ENV !== 'production') {
        console.log(`🔑 [DEV BACKUP OTP]: ${otp} for ${email}`);
      }
      return false;
    }
  }

  // Fallback in development when SMTP credentials are not yet configured in .env
  if (env.NODE_ENV !== 'production') {
    console.log('\n=============================================');
    console.log(`📩 [DEV EMAIL SIMULATOR] (Nodemailer Ready)`);
    console.log(`👉 To: ${email}`);
    console.log(`👉 Purpose: ${purpose}`);
    console.log(`👉 Your Verification Code: 🔑 [ ${otp} ]`);
    console.log(`👉 Valid for: 5 minutes`);
    console.log(`👉 Note: Set SMTP_USER & SMTP_PASS in .env to send real emails`);
    console.log('=============================================\n');
    return true;
  }

  return false;
};

module.exports = {
  sendOtpEmail,
  getTransporter,
};
