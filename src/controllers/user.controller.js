import { validationResult } from "express-validator";
import { Op } from "sequelize";
import User from "../models/user.js";
import ResponseHandler from "../utils/response.js";
import logger from "../utils/logger.js";

class UserController {
  async getProfile(req, res, next) {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ["password", "two_factor_secret"] },
      });

      ResponseHandler.success(res, user, "Profile retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseHandler.validationError(res, errors.array());
      }

      const { first_name, last_name } = req.body;
      const userId = req.user.id;

      const user = await User.findByPk(userId);

      user.first_name = first_name || user.first_name;
      user.last_name = last_name || user.last_name;

      await user.save();

      const updatedUser = await User.findByPk(userId, {
        attributes: { exclude: ["password", "two_factor_secret"] },
      });

      logger.info(`Profile updated for user: ${user.email}`);

      ResponseHandler.success(res, updatedUser, "Profile updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseHandler.validationError(res, errors.array());
      }

      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      const user = await User.findByPk(userId);

      if (!(await user.comparePassword(currentPassword))) {
        return ResponseHandler.error(res, "Current password is incorrect", 400);
      }

      user.password = newPassword;
      await user.save();

      logger.info(`Password changed for user: ${user.email}`);

      ResponseHandler.success(res, null, "Password changed successfully");
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req, res, next) {
    try {
      const { page = 1, limit = 10, search, role, status } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = {};

      if (search) {
        whereClause[Op.or] = [
          { first_name: { [Op.like]: `%${search}%` } },
          { last_name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
        ];
      }

      if (role) {
        whereClause.role = role;
      }

      if (status !== undefined) {
        whereClause.is_active = status === "active";
      }

      const { count, rows: users } = await User.findAndCountAll({
        where: whereClause,
        attributes: { exclude: ["password", "two_factor_secret"] },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["created_at", "DESC"]],
      });

      const totalPages = Math.ceil(count / limit);

      ResponseHandler.success(
        res,
        {
          users,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems: count,
            itemsPerPage: parseInt(limit),
          },
        },
        "Users retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id, {
        attributes: { exclude: ["password", "two_factor_secret"] },
      });

      if (!user) {
        return ResponseHandler.error(res, "User not found", 404);
      }

      ResponseHandler.success(res, user, "User retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseHandler.validationError(res, errors.array());
      }

      const { id } = req.params;
      const { first_name, last_name, role, is_active } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return ResponseHandler.error(res, "User not found", 404);
      }

      // Prevent users from changing their own role/status
      if (user.id === req.user.id && (role || is_active !== undefined)) {
        return ResponseHandler.error(
          res,
          "Cannot modify your own role or status",
          400
        );
      }

      user.first_name = first_name || user.first_name;
      user.last_name = last_name || user.last_name;
      user.role = role || user.role;

      if (is_active !== undefined) {
        user.is_active = is_active;
      }

      await user.save();

      const updatedUser = await User.findByPk(id, {
        attributes: { exclude: ["password", "two_factor_secret"] },
      });

      logger.info(`User updated: ${user.email} by ${req.user.email}`);

      ResponseHandler.success(res, updatedUser, "User updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;

      if (id === req.user.id) {
        return ResponseHandler.error(
          res,
          "Cannot delete your own account",
          400
        );
      }

      const user = await User.findByPk(id);
      if (!user) {
        return ResponseHandler.error(res, "User not found", 404);
      }

      await user.destroy();

      logger.info(`User deleted: ${user.email} by ${req.user.email}`);

      ResponseHandler.success(res, null, "User deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
