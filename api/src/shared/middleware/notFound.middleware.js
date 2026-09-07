const AppError = require('../errors/AppError');
const { ERROR_CODES } = require('../constants/errorCodes');

/**
 * 404 Not Found handler for undefined routes
 */
const notFound = (req, res, next) => {
  next(
    new AppError(
      `Cannot ${req.method} ${req.originalUrl} - Route not found`,
      404,
      ERROR_CODES.NOT_FOUND
    )
  );
};

module.exports = notFound;
