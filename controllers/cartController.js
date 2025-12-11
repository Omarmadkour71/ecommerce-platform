const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const handlerFactory = require("./handlerFactory");

// Add Item to the cart (1 or more of the same item)
exports.addItemToCart = catchAsync(async (req, res, next) => {
  // (1) getting the product
  const productId = req.body.product;
  const quantity = req.body.quantity;

  const selectedProduct = await Product.findById(productId);
  if (!selectedProduct) {
    return next(new AppError("The item you added doesn't exist", 404));
  }

  // (2) Setting the Price for the item
  const productPrice = selectedProduct.priceDiscount
    ? selectedProduct.price - selectedProduct.priceDiscount
    : selectedProduct.price;

  // (3) Adding item to cart
  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    cart = await Cart.create({
      user: req.user.id,
      items: [
        {
          product: productId,
          quantity,
          price: parseFloat(productPrice.toFixed(2)),
        },
      ],
    });
    return res.status(201).json({
      status: "Success",
      data: {
        cart,
      },
    });
  } else {
    cart.items.push({
      product: productId,
      quantity,
      price: productPrice,
    });
    await cart.save();
  }

  // Sending response to user
  res.status(200).json({
    status: "Success",
    data: {
      cart,
    },
  });
});

// Delete item from cart (1 or more of the same item)
exports.deleteItemFromCart = catchAsync(async (req, res, next) => {
  // Getting the Cart
  const cartId = req.params.id;
  const userCart = await Cart.findOne({ _id: cartId, user: req.user.id });
  if (!userCart) {
    return next(new AppError("the cart doesn't exist! please try Again", 404));
  }

  // checking the product and quantity
  const productId = req.params.itemId;
  const productQuantity = Number(req.body.quantity);
  if (!productId || !productQuantity) {
    return next(
      new AppError(
        "please provide the item and the quntity you want to remove",
        400
      )
    );
  }

  // getting the product for the items
  const itemIndex = userCart.items.findIndex(
    (i) => i.product.toString() === productId
  );
  if (itemIndex === -1) {
    return next(new AppError("the item you added isn't in your cart!", 404));
  }
  const item = userCart.items[itemIndex];

  // deleting the items
  if (productQuantity > item.quantity) {
    return next(
      new AppError(`you only have ${item.quantity} of that item!`, 400)
    );
  }
  if (productQuantity === userCart.items[itemIndex].quantity) {
    userCart.items.splice(itemIndex, 1);
  } else {
    userCart.items[itemIndex].quantity -= productQuantity;
  }
  await userCart.save({ validateBeforeSave: false });
  // Sending response to user
  res.status(200).json({
    status: "Success",
    data: {
      userCart,
    },
  });
});

// Deleting Whole Cart
exports.deleteCart = handlerFactory.deleteDoc(Cart);

// view current Logged in user Cart
exports.getCurrentCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate({
    path: "items.product",
    select: "name category",
  });
  if (!cart) {
    return next(new AppError("your Cart is empty!", 200));
  }
  res.status(200).json({
    status: "success",
    cart,
  });
});

// delete Current logged in user Cart
exports.deleteCurrentCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return next(new AppError("your Cart is empty!", 200));
  }

  await Cart.deleteOne({ user: req.user.id });

  res.status(200).json({
    status: "success",
    message: "Cart Deleted Successfully",
  });
});

// Getting Carts
exports.getOneCart = handlerFactory.getDoc(Cart, [
  {
    path: "user",
    select: "name email phoneNumber",
  },
  {
    path: "items.product",
    select: "name category",
  },
]);
exports.getAllCarts = handlerFactory.getAllDocs(Cart);

// Cart Payment Checkout
exports.cartCheckout = catchAsync(async (req, res, next) => {
  // (1) getting the cart
  const cart = await Cart.findOne({
    _id: req.params.cartId,
    user: req.user.id,
  }).populate([
    {
      path: "user",
      select: "name email phoneNumber",
    },
    {
      path: "items.product",
      select: "name category",
    },
  ]);
  if (!cart) {
    return next(new AppError("this cart doesn't exist!", 404));
  }

  // (3) creating line item for stripe checkout
  const lineItems = cart.items.map((item) => ({
    price_data: {
      currency: "usd",
      unit_amount: Math.round(item.price * 100), // cent
      product_data: {
        name: item.product.name,
      },
    },
    quantity: item.quantity,
  }));

  // (3) creating checkout session
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    success_url: `${req.protocol}://${req.get("host")}/payment/success`,
    cancel_url: `${req.protocol}://${req.get("host")}/payment/cancel`,
    customer_email: cart.user.email,
    client_reference_id: req.params.cartId, // Required for webhook to find the cart
    // shipping address collection
    shipping_address_collection: {
      allowed_countries: ["EG", "US"],
    },
    metadata: {
      userId: cart.user.id,
      cartId: req.params.cartId,
      totalPrice: cart.totalPrice,
    },
    line_items: lineItems,
  });

  // (4) sending session as a response
  res.status(201).json({
    status: "Success",
    payment_Link: session.url,
    session,
  });
});
