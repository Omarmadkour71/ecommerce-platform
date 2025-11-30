const express = require("express");
const orderController = require("../controllers/orderController");
const authController = require("../controllers/authController");

const orderRouter = express.Router();

// Current Logged in user orders
orderRouter
  .route("/my-orders")
  .get(authController.protect, orderController.currentUserOrder);

// Crud Operations
orderRouter.use(authController.protect, authController.restrictTo("admin"));
orderRouter
  .route("/")
  .get(orderController.getAllOrders)
  .post(orderController.createOrder);

orderRouter
  .route("/:id")
  .get(orderController.getOrder)
  .patch(orderController.updateOrder)
  .delete(orderController.deleteOrder);

module.exports = orderRouter;
