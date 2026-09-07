const AppError = require('../errors/AppError');
const { ERROR_CODES } = require('../constants/errorCodes');

/**
 * Generic Zod schema validation middleware
 * @param {import('zod').ZodSchema} schema
 * @param {'body' | 'query' | 'params'} source
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const formattedErrors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      return next(
        new AppError('Validation failed', 400, ERROR_CODES.VALIDATION_ERROR, formattedErrors)
      );
    }

    // Replace request source with sanitized parsed data
    req[source] = result.data;
    next();
  };
};

module.exports = validate;
