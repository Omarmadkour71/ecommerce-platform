const express = require("express");
const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");

// app configuration
const app = express();

// MIDDLEWARES
// body parser
app.use(express.json());

// 404 handler
app.all("/{*any}", (req, res, next) => {
  console.log(process.env.NODE_ENV);
  next(new AppError(`Can't find ${req.originalUrl} on the Server!`, 404));
});

// Global Error Handling Middleware
app.use(globalErrorHandler);

module.exports = app;
