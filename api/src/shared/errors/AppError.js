class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR', errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, errors = [], errorCode = 'VALIDATION_ERROR') {
    return new AppError(message, 400, errorCode, errors);
  }

  static unauthorized(message = 'Unauthorized', errorCode = 'UNAUTHORIZED') {
    return new AppError(message, 401, errorCode);
  }

  static forbidden(message = 'Forbidden', errorCode = 'FORBIDDEN_ERROR') {
    return new AppError(message, 403, errorCode);
  }

  static notFound(message = 'Resource not found', errorCode = 'NOT_FOUND') {
    return new AppError(message, 404, errorCode);
  }

  static conflict(message = 'Conflict', errorCode = 'CONFLICT') {
    return new AppError(message, 409, errorCode);
  }

  static internal(message = 'Internal Server Error', errorCode = 'INTERNAL_ERROR') {
    return new AppError(message, 500, errorCode);
  }
}

module.exports = AppError;

