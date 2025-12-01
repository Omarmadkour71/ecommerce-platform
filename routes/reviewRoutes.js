const express = require("express");
const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");

const reviewRouter = express.Router();

reviewRouter.use(authController.protect);

// Current User Adding/editing/revmoving a review for a Purchased Product
reviewRouter.route("/write-review").post(reviewController.writeReview);
reviewRouter.route("/edit-review/:reviewId").patch(reviewController.editReview);
reviewRouter
  .route("/remove-review/:reviewId")
  .delete(reviewController.removeReview);

// Admin CRUD Operations
reviewRouter.use(authController.restrictTo("admin"));
reviewRouter
  .route("/")
  .get(reviewController.getAllReviews)
  .post(reviewController.createReview);
reviewRouter
  .route("/:id")
  .get(reviewController.getReview)
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview);

// export review Router
module.exports = reviewRouter;
