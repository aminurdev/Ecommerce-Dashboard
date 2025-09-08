import { ApiError } from "../utils/ApiError.js";

export const notFound = (req, res, next) => {
  next(new ApiError(404, "Not Found"));
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
    errors: err.errors || [],
  });
};
