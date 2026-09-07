const AppError = require('../errors/AppError');
const { ERROR_CODES } = require('../constants/errorCodes');
const { ROLES } = require('../constants/roles');

/**
 * Role-Based Access Control (RBAC) Authorization Middleware
 * @param  {...string} allowedRoles - Allowed roles (e.g. ROLES.SUPER_ADMIN, ROLES.ORGANIZER_OWNER)
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new AppError('Authentication required.', 401, ERROR_CODES.AUTHENTICATION_ERROR)
      );
    }

    // Super Admin has universal access
    if (req.user.roles.includes(ROLES.SUPER_ADMIN)) {
      return next();
    }

    // Check if user has at least one of the allowed roles
    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      return next(
        new AppError(
          'Forbidden: You do not have permission to perform this action.',
          403,
          ERROR_CODES.FORBIDDEN_ERROR
        )
      );
    }

    next();
  };
};

module.exports = authorize;
