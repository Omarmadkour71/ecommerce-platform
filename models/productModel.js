const mongoose = require("mongoose");
const slugify = require("slugify");

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "product must have a name"],
    trim: true,
    unique: true,
  },
  slug: String,
  description: {
    type: String,
    minlength: [15, "Description must be longer than 15 character"],
    required: [true, "product must have a description"],
  },
  price: {
    type: Number,
    required: [true, "product must have a price"],
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function (val) {
        return val == null || val <= this.price;
      },
      message: "Discount shouldn't be higher than the product price",
    },
  },
  category: {
    type: String,
    required: [true, "A product must have a category"],
    trim: true,
    index: true,
  },
  images: [String],
  stock: {
    type: Number,
    required: [true, "product must have a stock number"],
    default: 0,
    min: [0, "stock can't be less than 0"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
    select: false,
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  ratingsAverage: {
    type: Number,
    min: [0, "ratings can't be less than 0"],
    max: [5, "ratings can't be higher than 5"],
  },
  available: {
    type: Boolean,
    default: true,
    index: true,
  },
});

// Slug Creating MiddleWare for Creating more user friendly URLs
productSchema.pre("save", function (next) {
  if (!this.isModified("name")) return next();
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Indexs
productSchema.index({ price: 1, ratingsAverage: -1 });
productSchema.index({ slug: 1 });
productSchema.index(
  { name: "text", category: "text", description: "text" },
  {
    weights: { name: 5, category: 3, description: 1 },
    name: "ProductTextIndex",
  }
);

// Creating the product model
const Product = mongoose.model("Product", productSchema);
module.exports = Product;
