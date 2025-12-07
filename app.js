const express = require("express");
const cookieParser = require("cookie-parser");
const hpp = require("hpp");
const helmet = require("helmet");
const perfectSanitize = require("perfect-express-sanitizer");
const rateLimter = require("express-rate-limit");
const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");
const userRouter = require("./routes/userRoutes");
const productRouter = require("./routes/productRoutes");
const cartRouter = require("./routes/cartRoutes");
const stripeWebhookRouter = require("./routes/stripeWebhookRoutes");
const orderRouter = require("./routes/orderRoutes");
const reviewRouter = require("./routes/reviewRoutes");

// app configuration
const app = express();
app.set("query parser", "extended");

// stripe webhook Route
app.use(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhookRouter
);

// MIDDLEWARES
// body parser
app.use(express.json());

// uses 'qs' parser for nested query strings

// Cookie Parser
app.use(cookieParser());

// secure http headers
app.use(helmet());

// prevent XSS & NoSQL Injections
app.use((req, res, next) => {
  // Skip sanitizer for file uploads
  if (req.is("multipart/form-data")) return next();

  // Otherwise, apply sanitizer
  perfectSanitize.clean({
    xss: true,
    noSql: true,
    sql: true,
  })(req, res, next);
});

// Rate Limiting for Brute Force Attacks
// (1) for all api routes
const limiter = rateLimter({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many request in short time! please try again later",
});
app.use("/api", limiter);
// (2) for Login route
const loginLimter = rateLimter({
  max: 5,
  windowMs: 10 * 60 * 1000,
  message: "Too many request in short time! please try again later",
});
app.use("/api/v1/users/login", loginLimter);

// prevent parameters pollution
app.use(
  hpp({
    whitelist: ["ratingsAverage", "ratingsQuantity", "price"],
  })
);

// Route Handler
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/review", reviewRouter);

// 404 handler
app.all("/{*any}", (req, res, next) => {
  //console.log(process.env.NODE_ENV);
  //console.log(process.argv);
  next(new AppError(`Can't find ${req.originalUrl} on the Server!`, 404));
});

// Global Error Handling Middleware
app.use(globalErrorHandler);

module.exports = app;
