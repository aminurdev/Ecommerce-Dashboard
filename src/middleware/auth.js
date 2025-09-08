import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import ResponseHandler from "../utils/response.js";
import logger from "../utils/logger.js";

// JWT Strategy
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (payload, done) => {
      try {
        const user = await User.findByPk(payload.id, {
          attributes: { exclude: ["password"] },
        });

        if (user && user.is_active) {
          return done(null, user);
        }
        return done(null, false);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Local Strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
          return done(null, false, { message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          return done(null, false, { message: "Invalid credentials" });
        }

        if (!user.is_active) {
          return done(null, false, { message: "Account is deactivated" });
        }

        if (!user.is_email_verified) {
          return done(null, false, {
            message: "Please verify your email first",
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({
          where: { google_id: profile.id },
        });

        if (user) {
          return done(null, user);
        }

        // Check if user exists with same email
        user = await User.findOne({
          where: { email: profile.emails[0].value },
        });

        if (user) {
          // Link Google account to existing user
          user.google_id = profile.id;
          user.is_email_verified = true;
          await user.save();
          return done(null, user);
        }

        // Create new user
        user = await User.create({
          email: profile.emails[0].value,
          first_name: profile.name.givenName,
          last_name: profile.name.familyName,
          google_id: profile.id,
          is_email_verified: true,
          role: "user",
        });

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Middleware functions
export const authenticate = (req, res, next) => {
  // eslint-disable-next-line no-unused-vars
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      logger.error("Authentication error:", err);
      return ResponseHandler.error(res, "Authentication failed", 500);
    }

    if (!user) {
      return ResponseHandler.error(res, "Unauthorized", 401);
    }

    req.user = user;
    next();
  })(req, res, next);
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ResponseHandler.error(res, "Unauthorized", 401);
    }

    if (!roles.includes(req.user.role)) {
      return ResponseHandler.error(res, "Access denied", 403);
    }

    next();
  };
};

export const generateTokens = (userId) => {
  const payload = { id: userId };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });

  return { accessToken, refreshToken };
};
