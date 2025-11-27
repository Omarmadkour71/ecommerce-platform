const mongoose = require("mongoose");
const Product = require("./productModel");

const orderSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "An order must belong to a user"],
  },
  items: [
    {
      product: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
        required: [true, "An order must have at least 1 item"],
      },
      price: {
        type: Number,
        min: [0, "Price can't be negative"],
      },
      quantity: {
        type: Number,
        default: 1,
        min: [1, "quantity can't be negative"],
      },
    },
  ],
  totalQuantity: {
    type: Number,
    default: 0,
    min: [0, "must have at least 1 item"],
  },
  totalPrice: {
    type: Number,
    min: [0, "Price can't be negative"],
  },
  paymentStatus: {
    type: String,
    enum: ["paid", "pending", "refunded", "failed"],
    trim: true,
    required: [true, "provide order status"],
  },
  orderStatus: {
    type: String,
    enum: ["preparing", "shipped", "cancelled", "delivered"],
  },
  shippingAddress: {
    type: String,
  },
  paidAt: {
    type: Date,
  },
});

// MiddleWare to calculate totalQuantity and totalPrice
orderSchema.pre("save", function (next) {
  this.totalQuantity = this.items.reduce(
    (sum, currentItem) => sum + currentItem.quntity,
    0
  );
  this.totalPrice = this.items.reduce(
    (sum, currentItem) => sum + currentItem.price * currentItem.quntity,
    0
  );
  this.totalPrice = parseFloat(this.totalPrice.toFixed(2));
  next();
});

// Creating order Model
const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
