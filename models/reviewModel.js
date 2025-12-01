const mongoose = require("mongoose");
const Product = require("./productModel");

const reviewSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Review must belong to a user"],
  },
  product: {
    type: mongoose.Schema.ObjectId,
    ref: "Product",
    required: [true, "Review must belong to a product"],
  },
  review: {
    type: String,
    required: [true, "please write your review about the product"],
    maxlength: [300, "Max Characters is 300 per review"],
    trim: true,
  },
  rating: {
    type: Number,
    required: [true, "please rate the product"],
    trim: true,
    min: [0, "rating can't be lower than 0"],
    max: [5, "rating can't be higher than 5"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

// index
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Static Method and Middleware to calculate average rating for a product
reviewSchema.statics.calcAverage = async function (productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: "$product",
        ratNum: { $sum: 1 },
        ratAve: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsQuantity: stats[0].ratNum,
      ratingsAverage: stats[0].ratAve,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: 3,
      ratingsQuantity: 0,
    });
  }
};

reviewSchema.post("save", function (next) {
  this.constructor.calcAverage(this.product);
});

reviewSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) {
    await doc.constructor.calcAverage(doc.product);
  }
});

// Review Model
const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
