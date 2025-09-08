import logger from "./logger.js";

class ResponseHandler {
  static success(res, data = null, message = "Success", statusCode = 200) {
    const response = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    logger.info(`SUCCESS: ${message}`, {
      statusCode,
      data: data ? "present" : "null",
    });
    return res.status(statusCode).json(response);
  }

  static error(
    res,
    message = "Internal Server Error",
    statusCode = 500,
    errors = null
  ) {
    const response = {
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString(),
    };

    logger.error(`ERROR: ${message}`, { statusCode, errors });
    return res.status(statusCode).json(response);
  }

  static validationError(res, errors) {
    const formattedErrors = errors.map((err) => ({
      field: err.path || err.param,
      message: err.msg || err.message,
    }));

    return this.error(res, "Validation failed", 400, formattedErrors);
  }
}

export default ResponseHandler;
