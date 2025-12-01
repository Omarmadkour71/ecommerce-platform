const Review = require("../models/reviewModel");
const Order = require("../models/orderModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const handlerFactory = require("./handlerFactory");

// Current User Adding a review for a Purchased Product
exports.writeReview = catchAsync(async (req, res, next) => {
  // (1) Checking if the user purchased the product
  const userOrders = await Order.find({ user: req.user.id });
  if (userOrders.length === 0) {
    return next(
      new AppError(
        "you can't write a review before purchasing the product",
        400
      )
    );
  }

  const purchasedProducts = userOrders.flatMap((items) =>
    items.items.map((item) => item.product.toString())
  );
  const productIndex = purchasedProducts.findIndex(
    (product) => product === req.body.product
  );
  if (productIndex === -1) {
    return next(
      new AppError("you must purchase the product before reviewing it", 400)
    );
  }

  // (2) Creating the review and sending response
  const review = await Review.create({
    user: req.user.id,
    product: req.body.product,
    review: req.body.review,
    rating: req.body.rating,
    createdAt: Date.now(),
  });
  res.status(200).json({
    status: "Success",
    review,
  });
});

// Current User Removing review
exports.removeReview = catchAsync(async (req, res, next) => {
  const review = await Review.findOneAndDelete({
    _id: req.params.reviewId,
    user: req.user.id,
  });
  if (!review) {
    return next(
      new AppError(
        "Review not found or you do not have permission to delete it",
        404
      )
    );
  }
  res.status(204).json({
    status: "Success",
    Data: null,
  });
});

// Current User Editing review
exports.editReview = catchAsync(async (req, res, next) => {
  const review = await Review.findOne({
    _id: req.params.reviewId,
    user: req.user.id,
  });
  if (!review) {
    return next(
      new AppError("the review you are trying to edit doesn't exist!", 404)
    );
  }

  if (req.body.review) review.review = req.body.review;
  if (req.body.rating) review.rating = req.body.rating;
  review.updatedAt = Date.now();
  await review.save();

  res.status(200).json({
    status: "Success",
    review,
  });
});

// CRUD OPERATIONS for Admin
exports.getReview = handlerFactory.getDoc(Review, [
  { path: "user", select: "name email" },
  { path: "product", select: "name category" },
]);
exports.getAllReviews = handlerFactory.getAllDocs(Review);
exports.createReview = handlerFactory.createDoc(Review);
exports.updateReview = handlerFactory.updateDoc(Review);
exports.deleteReview = handlerFactory.deleteDoc(Review);
