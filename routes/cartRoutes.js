const express = require("express");
const cartController = require("../controllers/cartController");
const authController = require("../controllers/authController");

const cartRouter = express.Router();

// Adding item to Cart
cartRouter
  .route("/item")
  .post(authController.protect, cartController.addItemToCart);

// Delete Current Logged in user cart
cartRouter
  .route("/my-cart")
  .delete(authController.protect, cartController.deleteCurrentCart);

// Deleting item form cart and Deleting cart
cartRouter
  .route("/:id/item/:itemId")
  .delete(authController.protect, cartController.deleteItemFromCart);
cartRouter
  .route("/:id")
  .delete(authController.protect, cartController.deleteCart);

// Current Logged in user cart
cartRouter
  .route("/my-cart")
  .get(authController.protect, cartController.getCurrentCart);

// Getting Carts
cartRouter.route("/:id").get(cartController.getOneCart);
cartRouter.route("/").get(cartController.getAllCarts);

// Cart Checkout
cartRouter
  .route("/checkout/:cartId")
  .post(authController.protect, cartController.cartCheckout);

module.exports = cartRouter;
