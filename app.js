const express = require("express");
const cookieParser = require("cookie-parser");
const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");
const userRouter = require("./routes/userRoutes");
const productRouter = require("./routes/productRoutes");

// app configuration
const app = express();
app.set("query parser", "extended");

// MIDDLEWARES
// body parser
app.use(express.json());

// uses 'qs' parser for nested query strings

// Cookie Parser
app.use(cookieParser());

// Route Handler
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);

// 404 handler
app.all("/{*any}", (req, res, next) => {
  //console.log(process.env.NODE_ENV);
  console.log(process.argv);
  next(new AppError(`Can't find ${req.originalUrl} on the Server!`, 404));
});

// Global Error Handling Middleware
app.use(globalErrorHandler);

module.exports = app;
