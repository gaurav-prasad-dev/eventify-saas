const AppError = require('../errors/AppError');
const { ERROR_CODES } = require('../constants/errorCodes');
const { ROLES } = require('../constants/roles');

/**
 * Multi-Tenant Scoping Middleware: Validates that the user belongs to the requested organization
 */
const tenantMiddleware = (req, res, next) => {
  const orgId = req.headers['x-organization-id'] || req.params.organizationId;

  if (!orgId) {
    return next(
      new AppError('Organization context required. Pass x-organization-id header.', 400, ERROR_CODES.VALIDATION_ERROR)
    );
  }

  // Super Admin can access any organization workspace
  if (req.user && req.user.roles.includes(ROLES.SUPER_ADMIN)) {
    req.organizationId = orgId;
    return next();
  }

  // Verify that the authenticated user is an active member of this organization
  const matchingMembership = req.user.memberships.find(
    (m) => m.organizationId === orgId && m.status === 'ACTIVE'
  );

  if (!matchingMembership) {
    return next(
      new AppError(
        'Forbidden: You are not a member of this organization.',
        403,
        ERROR_CODES.FORBIDDEN_ERROR
      )
    );
  }

  req.organizationId = orgId;
  req.membership = matchingMembership;
  next();
};

module.exports = tenantMiddleware;
