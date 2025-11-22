const mongoose = require("mongoose");

const kartSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "A kart should belong to a user"],
  },
  products: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "please add product to your kart to proceed"],
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Kart = mongoose.model("Kart", kartSchema);

module.exports = Kart;
