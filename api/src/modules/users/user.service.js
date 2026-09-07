const prisma = require('../../database/prisma');
const AppError = require('../../shared/errors/AppError');
const { ERROR_CODES } = require('../../shared/constants/errorCodes');

class UserService {
  /**
   * Retrieves the profile of a user by ID
   */
  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        memberships: {
          where: { status: 'ACTIVE' },
          include: {
            role: true,
            organization: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User profile not found.', 404, ERROR_CODES.NOT_FOUND);
    }

    return user;
  }

  /**
   * Updates user name, phone, or avatarUrl
   */
  async updateProfile(userId, updateData) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('User not found.', 404, ERROR_CODES.NOT_FOUND);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(updateData.name && { name: updateData.name }),
        ...(updateData.phone !== undefined && { phone: updateData.phone }),
        ...(updateData.avatarUrl !== undefined && { avatarUrl: updateData.avatarUrl }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        status: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }
}

module.exports = new UserService();
