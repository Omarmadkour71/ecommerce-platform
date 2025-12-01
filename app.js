const express = require("express");
const cookieParser = require("cookie-parser");
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
