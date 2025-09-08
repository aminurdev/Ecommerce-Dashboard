import express from "express";
import UserController from "../controllers/user.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  updateProfileValidation,
  updateUserValidation,
} from "../validation/user.validation.js";

const router = express.Router();

// Protected routes - All users
router.get("/profile", authenticate, UserController.getProfile);
router.put(
  "/profile",
  authenticate,
  updateProfileValidation,
  UserController.updateProfile
);

// Protected routes - Admin and above
router.get(
  "/",
  authenticate,
  authorize("super_admin", "admin"),
  UserController.getAllUsers
);
router.get(
  "/:id",
  authenticate,
  authorize("super_admin", "admin"),
  UserController.getUserById
);
router.put(
  "/:id",
  authenticate,
  authorize("super_admin", "admin"),
  updateUserValidation,
  UserController.updateUser
);

// Protected routes - Super Admin only
router.delete(
  "/:id",
  authenticate,
  authorize("super_admin"),
  UserController.deleteUser
);

export default router;
