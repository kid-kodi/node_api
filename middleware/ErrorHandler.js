const Errors = require("../helpers/Errors");

module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.message = error.message || "Internal server erreur";

  // Wrong mongodb id error
  if (error.name === "CastError") {
    const message = `Resource not found. Invalid: ${error.path}`;
    error = new Errors(message, 400);
  }

  // Duplicate key error
  if (error.code === "1100") {
    const message = `Duplicate : ${Object.keys(error.keyValue)} entered`;
    error = new Errors(message, 400);
  }

  // Wrong jwt error
  if (error.name === "JsonWebTokenError") {
    const message = `JSON WEB Token is invalid try again`;
    error = new Errors(message, 401);
  }

  // JWT Token expired error
  if (error.name === "TokenExpiredError") {
    const message = `JSON WEB Token is expired try again`;
    error = new Errors(message, 401);
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
  });
};
