const env = require('../../config/env');
const { sendError } = require('../utils/apiResponse');
const { ERROR_CODES } = require('../constants/errorCodes');

/**
 * Centralized Global Error Handling Middleware
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // Handle Prisma Unique Constraint Error (P2002)
  if (err.code === 'P2002') {
    statusCode = 409;
    const target = err.meta?.target ? ` for field: ${Array.isArray(err.meta.target) ? err.meta.target.join(', ') : err.meta.target}` : '';
    message = `A resource with this identifier already exists${target}`;
    errors = [{ message }];
  }

  // Handle Prisma Record Not Found Error (P2025)
  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Requested record not found';
    errors = [{ message }];
  }

  // Handle JWT Malformed Token Error
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
    errors = [{ message }];
  }

  // Handle JWT Expired Token Error
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired';
    errors = [{ message }];
  }

  // Handle Zod Validation Error if thrown directly
  if (err.name === 'ZodError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
  }

  // Log unexpected internal server errors
  if (statusCode >= 500) {
    console.error('💥 [Server Error]:', err);
    if (env.NODE_ENV === 'production') {
      message = 'An unexpected internal error occurred';
      errors = [];
    }
  }

  return sendError(res, statusCode, message, errors);
};

module.exports = errorHandler;
