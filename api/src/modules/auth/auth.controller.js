const authService = require('./auth.service');
const env = require('../../config/env');
const asyncHandler = require('../../shared/utils/asyncHandler');
const { sendSuccess } = require('../../shared/utils/apiResponse');

// Helper to set HTTP-only refresh token cookie
const setRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

class AuthController {
  /**
   * POST /api/v1/auth/otp/send
   */
  sendOtp = asyncHandler(async (req, res) => {
    const { email, purpose } = req.body;
    const result = await authService.sendOtp(email, purpose);
    return sendSuccess(res, 200, result.message, { email: result.email });
  });

  /**
   * POST /api/v1/auth/otp/verify
   */
  verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    const result = await authService.verifyOtp(email, otp);

    setRefreshTokenCookie(res, result.refreshToken);

    return sendSuccess(res, 200, 'Authentication successful.', {
      user: result.user,
      accessToken: result.accessToken,
    });
  });

  /**
   * POST /api/v1/auth/google
   */
  googleAuth = asyncHandler(async (req, res) => {
    const { idToken } = req.body;
    const result = await authService.loginWithGoogle(idToken);

    setRefreshTokenCookie(res, result.refreshToken);

    return sendSuccess(res, 200, 'Google sign-in successful.', {
      user: result.user,
      accessToken: result.accessToken,
    });
  });

  /**
   * POST /api/v1/auth/staff/verify-invite
   */
  verifyStaffInvite = asyncHandler(async (req, res) => {
    const { invitationToken, name, otp } = req.body;
    const result = await authService.verifyStaffInvite({ invitationToken, name, otp });

    setRefreshTokenCookie(res, result.refreshToken);

    return sendSuccess(res, 201, 'Staff account activated successfully.', {
      user: result.user,
      accessToken: result.accessToken,
    });
  });

  /**
   * POST /api/v1/auth/refresh
   */
  refreshToken = asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    const tokens = await authService.refreshTokens(token);

    setRefreshTokenCookie(res, tokens.refreshToken);

    return sendSuccess(res, 200, 'Token refreshed successfully.', {
      accessToken: tokens.accessToken,
    });
  });

  /**
   * POST /api/v1/auth/logout
   */
  logout = asyncHandler(async (req, res) => {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return sendSuccess(res, 200, 'Logged out successfully.');
  });

  /**
   * GET /api/v1/auth/me
   */
  getCurrentUser = asyncHandler(async (req, res) => {
    const user = await authService.getCurrentUser(req.user.id);
    return sendSuccess(res, 200, 'Current user profile fetched.', { user });
  });
}

module.exports = new AuthController();
