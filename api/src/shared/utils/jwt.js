const jwt = require('jsonwebtoken');
const jwtConfig = require('../../config/jwt');

/**
 * Signs both Access and Refresh tokens for an authenticated user
 * @param {object} payload - Identity payload { id, email, roles }
 * @returns {{ accessToken: string, refreshToken: string }}
 */
const generateTokens = (payload) => {
  const accessToken = jwt.sign(
    {
      id: payload.id,
      email: payload.email,
      roles: payload.roles || ['CUSTOMER'],
    },
    jwtConfig.accessSecret,
    { expiresIn: jwtConfig.accessExpiresIn }
  );

  const refreshToken = jwt.sign(
    { id: payload.id },
    jwtConfig.refreshSecret,
    { expiresIn: jwtConfig.refreshExpiresIn }
  );

  return { accessToken, refreshToken };
};

/**
 * Verifies an access token
 * @param {string} token 
 * @returns {object} Decoded token payload
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, jwtConfig.accessSecret);
};

/**
 * Verifies a refresh token
 * @param {string} token 
 * @returns {object} Decoded token payload
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, jwtConfig.refreshSecret);
};

module.exports = {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
};
