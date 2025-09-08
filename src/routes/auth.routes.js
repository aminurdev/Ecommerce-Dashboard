import express from "express";
import passport from "passport";
import rateLimit from "express-rate-limit";
import AuthController from "../controllers/auth.controller.js";
import { authenticate, generateTokens } from "../middleware/auth.js";
import {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation,
} from "../validation/auth.validation.js";

const router = express.Router();

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    error: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.post(
  "/register",
  generalLimiter,
  registerValidation,
  AuthController.register
);
router.post("/login", authLimiter, loginValidation, AuthController.login);
router.post("/verify-email", generalLimiter, AuthController.verifyEmail);
router.post(
  "/forgot-password",
  authLimiter,
  forgotPasswordValidation,
  AuthController.forgotPassword
);
router.post(
  "/reset-password",
  authLimiter,
  resetPasswordValidation,
  AuthController.resetPassword
);
router.post("/refresh-token", generalLimiter, AuthController.refreshToken);

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    // Generate tokens for OAuth user
    const { accessToken, refreshToken } = generateTokens(req.user.id);

    // Redirect to frontend with tokens
    res.redirect(
      `${process.env.FRONTEND_URL}/auth/callback?token=${accessToken}&refresh=${refreshToken}`
    );
  }
);

// Protected routes
router.post("/logout", authenticate, AuthController.logout);
router.post(
  "/change-password",
  authenticate,
  changePasswordValidation,
  AuthController.changePassword
);
router.post("/enable-2fa", authenticate, AuthController.enable2FA);
router.post("/verify-2fa", authenticate, AuthController.verify2FA);
router.post("/disable-2fa", authenticate, AuthController.disable2FA);

export default router;
