const mongoose = require("mongoose");

const cartSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "A cart should belong to a user"],
    unique: true,
  },
  items: [
    {
      product: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
        required: [true, "please add product to your cart to proceed"],
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
        min: [1, "Can't be Less than 1 item from that product"],
      },
      price: {
        type: Number,
      },
    },
  ],
  totalQuantity: {
    type: Number,
    default: 0,
    min: [0, "Quantity Can't be less than 0"],
  },
  totalPrice: {
    type: Number,
    default: 0,
    min: [0, "Price can't be less than 0"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Calculating total price for the Kart
cartSchema.pre("save", function (next) {
  this.totalQuantity = this.items.reduce(
    (sum, currentItem) => sum + currentItem.quantity,
    0
  );
  this.totalPrice = this.items.reduce(
    (sum, currentItem) => sum + currentItem.price * currentItem.quantity,
    0
  );
  this.totalPrice = parseFloat(this.totalPrice.toFixed(2));
  next();
});

// Creatingn Cart Model
const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
