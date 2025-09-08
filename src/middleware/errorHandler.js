import logger from "../utils/logger.js";
import ResponseHandler from "../utils/response.js";

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error(err.message, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    return ResponseHandler.error(res, message, 404);
  }

  // Sequelize validation error
  if (err.name === "SequelizeValidationError") {
    const errors = err.errors.map((error) => ({
      field: error.path,
      message: error.message,
    }));
    return ResponseHandler.error(res, "Validation Error", 400, errors);
  }

  // Sequelize unique constraint error
  if (err.name === "SequelizeUniqueConstraintError") {
    const message = "Duplicate field value entered";
    return ResponseHandler.error(res, message, 400);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token";
    return ResponseHandler.error(res, message, 401);
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired";
    return ResponseHandler.error(res, message, 401);
  }

  // Default error
  ResponseHandler.error(
    res,
    error.message || "Server Error",
    error.statusCode || 500
  );
};

export default errorHandler;
