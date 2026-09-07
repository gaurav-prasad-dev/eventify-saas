const userService = require('./user.service');
const asyncHandler = require('../../shared/utils/asyncHandler');
const { sendSuccess } = require('../../shared/utils/apiResponse');

class UserController {
  /**
   * GET /api/v1/profile
   */
  getProfile = asyncHandler(async (req, res) => {
    const profile = await userService.getProfile(req.user.id);
    return sendSuccess(res, 200, 'Profile fetched successfully.', { profile });
  });

  /**
   * PATCH /api/v1/profile
   */
  updateProfile = asyncHandler(async (req, res) => {
    const updatedUser = await userService.updateProfile(req.user.id, req.body);
    return sendSuccess(res, 200, 'Profile updated successfully.', { user: updatedUser });
  });
}

module.exports = new UserController();
