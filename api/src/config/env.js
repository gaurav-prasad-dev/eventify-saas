const path = require('path');
const dotenv = require('dotenv');
const { z } = require('zod');

// Load .env from api root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_ACCESS_SECRET: z.string().min(1, 'JWT_ACCESS_SECRET is required'),
  JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173,http://localhost:3000'),

  // SMTP Email Configuration (Nodemailer)
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  SMTP_FROM: z.string().default('Eventify <noreply@eventify.com>'),
  SMTP_SECURE: z
    .union([z.boolean(), z.string()])
    .transform((val) => val === true || val === 'true')
    .default(false),

  // Cloudinary Image Storage
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),

  // Redis Configuration (Distributed Seat Locking)
  REDIS_URL: z.string().optional().default(''),

  // Razorpay Payment Gateway
  RAZORPAY_KEY_ID: z
    .string()
    .optional()
    .default(process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_TEST_API || ''),
  RAZORPAY_KEY_SECRET: z
    .string()
    .optional()
    .default(process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_TEST_SECRET || ''),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional().default(''),
});


const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:');
  parsedEnv.error.issues.forEach((issue) => {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  });
  process.exit(1);
}

module.exports = parsedEnv.data;
