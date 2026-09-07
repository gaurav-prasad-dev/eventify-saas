const prisma = require('../../database/prisma');
const AppError = require('../errors/AppError');
const { ERROR_CODES } = require('../constants/errorCodes');
const { verifyAccessToken } = require('../utils/jwt');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Authentication Middleware: Validates JWT access token and attaches user to req.user
 */
const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Extract Bearer token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('Authentication required. Please log in.', 401, ERROR_CODES.AUTHENTICATION_ERROR)
    );
  }

  // 2. Verify token signature and expiration
  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(
        new AppError('Your session has expired. Please refresh your token.', 401, ERROR_CODES.AUTHENTICATION_ERROR)
      );
    }
    return next(
      new AppError('Invalid authentication token.', 401, ERROR_CODES.AUTHENTICATION_ERROR)
    );
  }

  // 3. Verify user still exists and is active in database
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    include: {
      memberships: {
        where: { status: 'ACTIVE' },
        include: {
          role: true,
          organization: {
            select: { id: true, name: true, slug: true, status: true },
          },
        },
      },
    },
  });

  if (!user) {
    return next(
      new AppError('The user belonging to this token no longer exists.', 401, ERROR_CODES.AUTHENTICATION_ERROR)
    );
  }

  if (user.status !== 'ACTIVE') {
    return next(
      new AppError(`Your account is currently ${user.status.toLowerCase()}. Please contact support.`, 403, ERROR_CODES.FORBIDDEN_ERROR)
    );
  }

  // 4. Aggregate roles (User's global roles + organization member roles)
  const roles = user.memberships.map((m) => m.role.name);
  if (roles.length === 0) {
    roles.push('CUSTOMER');
  }

  // 5. Attach user object to request
  req.user = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    status: user.status,
    memberships: user.memberships,
    roles,
  };

  next();
});

module.exports = authMiddleware;
