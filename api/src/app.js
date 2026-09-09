const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const env = require('./config/env');
const routes = require('./routes');
const notFound = require('./shared/middleware/notFound.middleware');
const errorHandler = require('./shared/middleware/error.middleware');
const { sendSuccess } = require('./shared/utils/apiResponse');

const app = express();

// 1. Security Middleware
app.use(helmet());

// 2. CORS Middleware with Credentials
const allowedOrigins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);

// 3. Request Parsing Middleware
app.use(
  express.json({
    limit: '10mb',
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 4. Request Logging (HTTP)
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// 5. Root Welcome Route
app.get('/', (req, res) => {
  sendSuccess(res, 200, 'Welcome to Eventify SaaS API', {
    version: 'v1',
    docs: '/api/v1/health',
  });
});

// 6. Global API Rate Limiter
const { globalLimiter } = require('./shared/middleware/rateLimiter.middleware');
app.use('/api', globalLimiter);

// 7. Master API Routes (/api/v1)
app.use('/api/v1', routes);

// 7. 404 Not Found Middleware
app.use(notFound);

// 8. Centralized Global Error Handler
app.use(errorHandler);

module.exports = app;
