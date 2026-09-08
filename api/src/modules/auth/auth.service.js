const prisma = require('../../database/prisma');
const AppError = require('../../shared/errors/AppError');
const { ERROR_CODES } = require('../../shared/constants/errorCodes');
const { generateOtp, hashOtp, verifyOtpHash } = require('../../shared/utils/otp');
const { generateTokens, verifyRefreshToken } = require('../../shared/utils/jwt');
const { sendOtpEmail } = require('../../shared/utils/email');

class AuthService {
  /**
   * Dispatches a 6-digit OTP to the specified email address
   */
  async sendOtp(email, purpose = 'LOGIN') {
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Rate-limiting: Enforce 60-second cooldown on existing unexpired OTP
    const existingOtp = await prisma.otpVerification.findFirst({
      where: {
        email: normalizedEmail,
        purpose,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existingOtp) {
      const secondsSinceCreated = (Date.now() - new Date(existingOtp.createdAt).getTime()) / 1000;
      if (secondsSinceCreated < 60) {
        const waitSeconds = Math.ceil(60 - secondsSinceCreated);
        throw new AppError(
          `Please wait ${waitSeconds} seconds before requesting another code.`,
          429,
          ERROR_CODES.CONFLICT
        );
      }
    }

    // 2. Generate cryptographically secure 6-digit OTP
    const plainOtp = generateOtp();
    const otpHash = hashOtp(plainOtp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5-minute validity

    // 3. Store hashed OTP in database
    await prisma.otpVerification.create({
      data: {
        email: normalizedEmail,
        otpHash,
        purpose,
        expiresAt,
        attempts: 0,
      },
    });

    // 4. Dispatch OTP to user
    await sendOtpEmail({
      email: normalizedEmail,
      otp: plainOtp,
      purpose,
    });

    return {
      message: 'Verification code sent to your email.',
      email: normalizedEmail,
      expiresInMinutes: 5,
    };
  }

  /**
   * Verifies the OTP and authenticates/registers the user
   */
  async verifyOtp(email, otp) {
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Look up valid unexpired OTP record
    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        email: normalizedEmail,
        purpose: 'LOGIN',
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new AppError(
        'Invalid or expired verification code. Please request a new one.',
        400,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    // 2. Prevent brute-force attempts (Max 3 tries)
    if (otpRecord.attempts >= 3) {
      await prisma.otpVerification.delete({ where: { id: otpRecord.id } });
      throw new AppError(
        'Too many invalid attempts. This code has been invalidated. Please request a new one.',
        400,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    // 3. Verify OTP hash
    const isMatch = verifyOtpHash(otp, otpRecord.otpHash);
    if (!isMatch) {
      // Increment attempt counter
      await prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      const remainingAttempts = 2 - otpRecord.attempts;
      throw new AppError(
        `Invalid verification code. ${remainingAttempts > 0 ? `${remainingAttempts} attempts remaining.` : 'Code will be invalidated.'}`,
        400,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    // 4. Delete the OTP record (single-use security)
    await prisma.otpVerification.delete({ where: { id: otpRecord.id } });

    // 5. Find or auto-create User account
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
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
      // Auto-register new customer account
      const defaultName = normalizedEmail.split('@')[0];
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: defaultName.charAt(0).toUpperCase() + defaultName.slice(1),
          status: 'ACTIVE',
        },
        include: {
          memberships: true,
        },
      });
    } else if (user.status !== 'ACTIVE') {
      throw new AppError(
        `Your account is currently ${user.status.toLowerCase()}. Please contact support.`,
        403,
        ERROR_CODES.FORBIDDEN_ERROR
      );
    }

    // 6. Aggregate user roles
    const roles = user.memberships ? user.memberships.map((m) => m.role?.name).filter(Boolean) : [];
    if (roles.length === 0) {
      roles.push('CUSTOMER');
    }

    // 7. Generate JWT Access and Refresh Tokens
    const tokens = generateTokens({
      id: user.id,
      email: user.email,
      roles,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        roles,
        memberships: user.memberships || [],
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  /**
   * Verifies Google ID Token and logs in or creates customer account
   */
  async loginWithGoogle(idToken) {
    try {
      let payload;

      // In local development, support dev test tokens without requiring Google Cloud setup
      if (process.env.NODE_ENV === 'development' && idToken.startsWith('dev_google_')) {
        const testEmail = idToken.replace('dev_google_', '') || 'google.user@example.com';
        payload = {
          email: testEmail,
          email_verified: true,
          name: testEmail.split('@')[0].charAt(0).toUpperCase() + testEmail.split('@')[0].slice(1),
          sub: `google_sub_${Buffer.from(testEmail).toString('base64').substring(0, 16)}`,
          picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${testEmail}`,
        };
      } else {
        // Verify genuine token with Google's public tokeninfo endpoint
        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
        if (!response.ok) {
          throw new Error('Google token validation failed');
        }

        payload = await response.json();
        if (!payload.email || !payload.email_verified) {
          throw new AppError('Google account email is not verified.', 400, ERROR_CODES.VALIDATION_ERROR);
        }
      }

      const normalizedEmail = payload.email.toLowerCase().trim();

      // Find or create user
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: normalizedEmail },
            { googleId: payload.sub },
          ],
        },
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
        user = await prisma.user.create({
          data: {
            email: normalizedEmail,
            name: payload.name || normalizedEmail.split('@')[0],
            googleId: payload.sub,
            avatarUrl: payload.picture,
            status: 'ACTIVE',
          },
          include: {
            memberships: true,
          },
        });
      } else {
        // Link googleId or avatar if missing
        if (!user.googleId || !user.avatarUrl) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              googleId: user.googleId || payload.sub,
              avatarUrl: user.avatarUrl || payload.picture,
            },
            include: {
              memberships: {
                where: { status: 'ACTIVE' },
                include: { role: true, organization: true },
              },
            },
          });
        }
      }

      if (user.status !== 'ACTIVE') {
        throw new AppError(`Your account is currently ${user.status.toLowerCase()}.`, 403, ERROR_CODES.FORBIDDEN_ERROR);
      }

      const roles = user.memberships ? user.memberships.map((m) => m.role?.name).filter(Boolean) : [];
      if (roles.length === 0) {
        roles.push('CUSTOMER');
      }

      const tokens = generateTokens({
        id: user.id,
        email: user.email,
        roles,
      });

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          roles,
          memberships: user.memberships || [],
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError('Google authentication failed. Invalid token.', 401, ERROR_CODES.AUTHENTICATION_ERROR);
    }
  }

  /**
   * Accepts staff invitation and registers staff member via OTP
   */
  async verifyStaffInvite({ invitationToken, name, otp }) {
    // 1. Look up active unexpired invitation
    const invitation = await prisma.organizationInvitation.findUnique({
      where: { token: invitationToken },
      include: {
        organization: true,
        role: true,
      },
    });

    if (!invitation || invitation.status !== 'ACTIVE' || new Date(invitation.expiresAt) < new Date()) {
      throw new AppError('This invitation link is invalid or has expired.', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    if (invitation.maxUses && invitation.usedCount >= invitation.maxUses) {
      throw new AppError('This invitation link has reached its maximum usage limit.', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    const normalizedEmail = invitation.email.toLowerCase().trim();

    // 2. Look up OTP for staff invite
    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        email: normalizedEmail,
        purpose: 'STAFF_INVITE',
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new AppError('Invalid or expired verification code.', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    const isMatch = verifyOtpHash(otp, otpRecord.otpHash);
    if (!isMatch) {
      throw new AppError('Invalid verification code.', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    // 3. Execute atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      // Find or create User
      let user = await tx.user.findUnique({ where: { email: normalizedEmail } });
      if (!user) {
        user = await tx.user.create({
          data: {
            email: normalizedEmail,
            name: name.trim(),
            status: 'ACTIVE',
          },
        });
      }

      // Check if user is already a member
      const existingMember = await tx.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: invitation.organizationId,
            userId: user.id,
          },
        },
      });

      if (existingMember) {
        throw new AppError('User is already a member of this organization.', 409, ERROR_CODES.CONFLICT);
      }

      // Create OrganizationMember
      await tx.organizationMember.create({
        data: {
          organizationId: invitation.organizationId,
          userId: user.id,
          roleId: invitation.roleId,
          status: 'ACTIVE',
        },
      });

      // Increment used count on invitation
      const updatedUsedCount = invitation.usedCount + 1;
      const isExpired = invitation.maxUses && updatedUsedCount >= invitation.maxUses;
      await tx.organizationInvitation.update({
        where: { id: invitation.id },
        data: {
          usedCount: updatedUsedCount,
          status: isExpired ? 'EXPIRED' : 'ACTIVE',
        },
      });

      // Delete OTP
      await tx.otpVerification.delete({ where: { id: otpRecord.id } });

      return user;
    });

    // 4. Generate tokens with new role
    const tokens = generateTokens({
      id: result.id,
      email: result.email,
      roles: [invitation.role.name],
    });

    return {
      user: {
        id: result.id,
        name: result.name,
        email: result.email,
        roles: [invitation.role.name],
        organization: {
          id: invitation.organization.id,
          name: invitation.organization.name,
        },
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  /**
   * Refreshes the Access Token using a valid Refresh Token
   */
  async refreshTokens(refreshToken) {
    if (!refreshToken) {
      throw new AppError('Refresh token required.', 401, ERROR_CODES.AUTHENTICATION_ERROR);
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      throw new AppError('Invalid or expired refresh token. Please log in again.', 401, ERROR_CODES.AUTHENTICATION_ERROR);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        memberships: {
          where: { status: 'ACTIVE' },
          include: { role: true },
        },
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new AppError('User account is no longer active.', 401, ERROR_CODES.AUTHENTICATION_ERROR);
    }

    const roles = user.memberships.map((m) => m.role.name);
    if (roles.length === 0) {
      roles.push('CUSTOMER');
    }

    const tokens = generateTokens({
      id: user.id,
      email: user.email,
      roles,
    });

    return tokens;
  }

  /**
   * Returns current user identity and memberships
   */
  async getCurrentUser(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
      throw new AppError('User not found.', 404, ERROR_CODES.NOT_FOUND);
    }

    const roles = user.memberships.map((m) => m.role.name);
    if (roles.length === 0) {
      roles.push('CUSTOMER');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      status: user.status,
      roles,
      memberships: user.memberships,
    };
  }
}

module.exports = new AuthService();
