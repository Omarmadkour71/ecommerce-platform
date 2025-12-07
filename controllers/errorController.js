const AppError = require("../utils/appError");

// handling Errors Function
const handleCastErrorDB = (err) => {
  const message = `${err.value} is invalid ID`;
  return new AppError(message, 400);
};

const handleDublicateErrorDB = (err) => {
  const message = `${err.keyValue.name} is Dublicate`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const message = `${err.message}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError("your token is invalid, please login again", 401);

const handleExpiredTokenError = () =>
  new AppError("your session has expired, please login agian", 401);

// Development Mode Error Handling function
const sendErrorDev = (err, req, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

// Production Mode Error Handling function
const sendErrorProd = (err, req, res) => {
  // operational errors => Trusted Errors
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // non operational errors => not trusted errors
  return res.status(404).json({
    status: "Error",
    message: "Something Went Wrong",
  });
};

// Exporting Error Handler Middleware
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;
    error.name = err.name;
    // Handling invalid id errors form mongoose
    if (err.name === "CastError") error = handleCastErrorDB(error);
    // Handling Validation errors from mongoose
    if (err.name === "ValidationError") error = handleValidationErrorDB(error);
    // Handling dublicate fields errors
    if (err.code === 11000) error = handleDublicateErrorDB(error);
    // Handling invalid token errors
    if (err.name === "JsonWebTokenError") error = handleJWTError();
    // Handling expired token errors
    if (err.name === "TokenExpiredError") error = handleExpiredTokenError();
    sendErrorProd(error, req, res);
  }
};
