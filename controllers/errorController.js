//const AppError = require("../utils/appError");

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
/* const sendErrorProd = (err, req, res) => {

} */

// Exporting Error Handler Middleware
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    // sendErrorProd(err, req, res);
  }
};
