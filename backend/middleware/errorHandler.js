const { IS_PRODUCTION } = require("../config/env");

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let details = null;

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    details = err.errors;
  }

  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for ${field}. This ${field} already exists.`;
  }

  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid or malformed token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired. Please login again.";
  }

  if (err.name === "ReferenceError") {
    statusCode = 500;
    message = "Internal server error";
  }

  console.error(
    `[${new Date().toISOString()}] ${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip} - ${err.stack}`
  );

  const response = {
    success: false,
    message,
  };

  if (!IS_PRODUCTION) {
    response.stack = err.stack;
    if (details) response.details = details;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
