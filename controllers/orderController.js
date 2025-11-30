const Order = require("../models/orderModel");
const handlerFactory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// CRUD Operations
exports.createOrder = handlerFactory.createDoc(Order);
exports.getOrder = handlerFactory.getDoc(Order, [
  {
    path: "user",
    select: "name email address phoneNumber",
  },
  {
    path: "items.product",
    select: "name category",
  },
]);
exports.getAllOrders = handlerFactory.getAllDocs(Order);
exports.deleteOrder = handlerFactory.getAllDocs(Order);
exports.updateOrder = handlerFactory.updateDoc(Order);

// Current Logged in user Orders
exports.currentUserOrder = catchAsync(async (req, res, next) => {
  const order = await Order.find({ user: req.user.id });
  if (order.length === 0) {
    next(new AppError("you didn't order anything yet!", 404));
  }

  res.status(200).json({
    status: "success",
    Number: order.length,
    date: {
      order,
    },
  });
});
