import { body, param } from "express-validator";

export const updateProfileValidation = [
  body("first_name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  body("last_name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
];

export const updateUserValidation = [
  param("id").isUUID().withMessage("Invalid user ID"),
  body("first_name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  body("last_name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
  body("role")
    .optional()
    .isIn(["super_admin", "admin", "manager", "user"])
    .withMessage("Invalid role"),
  body("is_active")
    .optional()
    .isBoolean()
    .withMessage("is_active must be a boolean"),
];
