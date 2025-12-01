const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");

exports.stripeWebhookHandler = async (req, res) => {
  // (1) verifying the stripe webhook
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // req body must be raw not json, thats why we are using express.raw()
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log("Webhook signature failed", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  console.log("Webhook received, event type:", event.type);
  // (2) Handling the events
  if (event.type === "checkout.session.completed") {
    // getting paid cart
    const session = event.data.object;

    if (!session.client_reference_id) {
      console.error("Missing client_reference_id in session", session.id);
      return res
        .status(200)
        .json({ received: true, message: "Missing client_reference_id" });
    }

    const cart = await Cart.findById(session.client_reference_id).populate(
      "items.product"
    );
    if (!cart) {
      console.warn(
        "Cart not found for session",
        session.id,
        "cartId:",
        session.client_reference_id
      );
      // Return 200 to acknowledge receipt (Stripe expects 2xx responses)
      return res.status(200).json({
        received: true,
        message: "Cart not found but webhook received",
      });
    }

    try {
      // creating order
      const order = await Order.create({
        user: cart.user,
        items: cart.items.map((item) => ({
          product: item.product._id,
          price: item.price,
          quantity: item.quantity,
        })),
        paymentStatus: "paid",
        orderStatus: "preparing",
        paidAt: Date.now(),
        shippingAddress:
          session.collected_information?.shipping_details || null,
      });

      //delete the cart
      await Cart.findByIdAndDelete(session.client_reference_id);

      console.log("✅ Order created from Stripe webhook:", order._id);
    } catch (error) {
      console.error("Error creating order from webhook:", error);
      // Still return 200 to acknowledge receipt
      return res
        .status(200)
        .json({ received: true, error: "Failed to create order" });
    }
  } else {
    console.log(`Unhandled Stripe Event: ${event.type}`);
  }

  // sending response to acknowledge receipt of the event
  res.json({ received: true });
};
