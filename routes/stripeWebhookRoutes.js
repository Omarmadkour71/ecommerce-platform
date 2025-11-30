const express = require("express");
const stripeWebhookController = require("../controllers/stripeWebhookController");

const stripeWebhookRouter = express.Router();

stripeWebhookRouter.post("/", stripeWebhookController.stripeWebhookHandler);

module.exports = stripeWebhookRouter;
