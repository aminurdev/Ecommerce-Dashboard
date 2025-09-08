import crypto from "crypto";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import User from "../models/user.js";
import RefreshToken from "../models/refreshToken.js";
import ResponseHandler from "../utils/response.js";
import EmailService from "../utils/email.js";
import TwoFactorService from "../utils/twoFactor.js";
import { generateTokens } from "../middleware/auth.js";
import logger from "../utils/logger.js";
import { Op } from "sequelize";

class AuthController {
  async register(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseHandler.validationError(res, errors.array());
      }

      const { email, password, first_name, last_name } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return ResponseHandler.error(res, "User already exists", 400);
      }

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString("hex");

      // Create user
      const user = await User.create({
        email,
        password,
        first_name,
        last_name,
        email_verification_token: verificationToken,
        role: "user",
      });

      // Send verification email
      await EmailService.sendVerificationEmail(user, verificationToken);

      logger.info(`User registered: ${email}`);

      ResponseHandler.success(
        res,
        {
          message:
            "Registration successful. Please check your email to verify your account.",
        },
        "User registered successfully",
        201
      );
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req, res, next) {
    try {
      const { token } = req.body;

      const user = await User.findOne({
        where: { email_verification_token: token },
      });

      if (!user) {
        return ResponseHandler.error(
          res,
          "Invalid or expired verification token",
          400
        );
      }

      user.is_email_verified = true;
      user.email_verification_token = null;
      await user.save();

      logger.info(`Email verified for user: ${user.email}`);

      ResponseHandler.success(res, null, "Email verified successfully");
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseHandler.validationError(res, errors.array());
      }

      const { email, password, twoFactorToken } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user || !(await user.comparePassword(password))) {
        return ResponseHandler.error(res, "Invalid credentials", 401);
      }

      if (!user.is_email_verified) {
        return ResponseHandler.error(
          res,
          "Please verify your email first",
          401
        );
      }

      if (!user.is_active) {
        return ResponseHandler.error(res, "Account is deactivated", 401);
      }

      // Check 2FA if enabled
      if (user.two_factor_enabled) {
        if (!twoFactorToken) {
          return ResponseHandler.error(res, "2FA token required", 400);
        }

        const isValid = TwoFactorService.verifyToken(
          user.two_factor_secret,
          twoFactorToken
        );
        if (!isValid) {
          return ResponseHandler.error(res, "Invalid 2FA token", 400);
        }
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user.id);

      // Store refresh token
      await RefreshToken.create({
        token: refreshToken,
        user_id: user.id,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });

      // Update last login
      user.last_login = new Date();
      await user.save();

      logger.info(`User logged in: ${email}`);

      ResponseHandler.success(
        res,
        {
          user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
            two_factor_enabled: user.two_factor_enabled,
          },
          accessToken,
          refreshToken,
        },
        "Login successful"
      );
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return ResponseHandler.error(res, "Refresh token required", 400);
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

      // Check if token exists in database
      const storedToken = await RefreshToken.findOne({
        where: {
          token: refreshToken,
          user_id: decoded.id,
          is_active: true,
        },
      });

      if (!storedToken || storedToken.expires_at < new Date()) {
        return ResponseHandler.error(
          res,
          "Invalid or expired refresh token",
          401
        );
      }

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = generateTokens(
        decoded.id
      );

      // Deactivate old refresh token
      storedToken.is_active = false;
      await storedToken.save();

      // Store new refresh token
      await RefreshToken.create({
        token: newRefreshToken,
        user_id: decoded.id,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      ResponseHandler.success(
        res,
        {
          accessToken,
          refreshToken: newRefreshToken,
        },
        "Token refreshed successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return ResponseHandler.success(
          res,
          null,
          "If the email exists, a reset link has been sent"
        );
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      user.password_reset_token = resetToken;
      user.password_reset_expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();

      // Send reset email
      await EmailService.sendPasswordResetEmail(user, resetToken);

      logger.info(`Password reset requested for: ${email}`);

      ResponseHandler.success(
        res,
        null,
        "If the email exists, a reset link has been sent"
      );
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;

      const user = await User.findOne({
        where: {
          password_reset_token: token,
          password_reset_expires: { [Op.gt]: new Date() },
        },
      });

      if (!user) {
        return ResponseHandler.error(
          res,
          "Invalid or expired reset token",
          400
        );
      }

      user.password = password;
      user.password_reset_token = null;
      user.password_reset_expires = null;
      await user.save();

      // Deactivate all refresh tokens
      await RefreshToken.update(
        { is_active: false },
        { where: { user_id: user.id } }
      );

      logger.info(`Password reset completed for: ${user.email}`);

      ResponseHandler.success(res, null, "Password reset successfully");
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      // Validate input
      if (!currentPassword || !newPassword) {
        return ResponseHandler.error(
          res,
          "Current and new password are required",
          400
        );
      }

      // Find user
      const user = await User.findByPk(userId);
      if (!user) {
        return ResponseHandler.error(res, "User not found", 404);
      }

      // Verify current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return ResponseHandler.error(res, "Current password is incorrect", 400);
      }

      // Update password
      user.password = newPassword;
      await user.save();

      // Invalidate all refresh tokens after password change (force re-login)
      await RefreshToken.update(
        { is_active: false },
        { where: { user_id: user.id } }
      );

      logger.info(`Password changed for user: ${user.email}`);

      ResponseHandler.success(res, null, "Password changed successfully");
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        await RefreshToken.update(
          { is_active: false },
          { where: { token: refreshToken } }
        );
      }

      ResponseHandler.success(res, null, "Logged out successfully");
    } catch (error) {
      next(error);
    }
  }

  async enable2FA(req, res, next) {
    try {
      const userId = req.user.id;
      const user = await User.findByPk(userId);

      if (user.two_factor_enabled) {
        return ResponseHandler.error(res, "2FA is already enabled", 400);
      }

      const secret = TwoFactorService.generateSecret(user.email);
      const qrCode = await TwoFactorService.generateQRCode(secret);

      // Temporarily store secret (don't save to database yet)
      ResponseHandler.success(
        res,
        {
          secret: secret.base32,
          qrCode,
          manualEntryKey: secret.base32,
        },
        "Scan QR code and verify to enable 2FA"
      );
    } catch (error) {
      next(error);
    }
  }

  async verify2FA(req, res, next) {
    try {
      const { secret, token } = req.body;
      const userId = req.user.id;

      const isValid = TwoFactorService.verifyToken(secret, token);
      if (!isValid) {
        return ResponseHandler.error(res, "Invalid 2FA token", 400);
      }

      // Save secret and enable 2FA
      const user = await User.findByPk(userId);
      user.two_factor_secret = secret;
      user.two_factor_enabled = true;
      await user.save();

      logger.info(`2FA enabled for user: ${user.email}`);

      ResponseHandler.success(res, null, "2FA enabled successfully");
    } catch (error) {
      next(error);
    }
  }

  async disable2FA(req, res, next) {
    try {
      const { password } = req.body;
      const userId = req.user.id;

      const user = await User.findByPk(userId);

      if (!(await user.comparePassword(password))) {
        return ResponseHandler.error(res, "Invalid password", 400);
      }

      user.two_factor_secret = null;
      user.two_factor_enabled = false;
      await user.save();

      logger.info(`2FA disabled for user: ${user.email}`);

      ResponseHandler.success(res, null, "2FA disabled successfully");
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
