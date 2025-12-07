const express = require("express");
const productController = require("../controllers/productController");

const productRouter = express.Router();

// CRUD operations
productRouter
  .route("/")
  .post(
    productController.uploadProductPhoto,
    productController.resizeProductImages,
    productController.createProduct
  )
  .get(productController.getAllProducts);
productRouter
  .route("/:id")
  .get(productController.getProduct)
  .patch(productController.updateProduct)
  .delete(productController.deleteProduct);

module.exports = productRouter;
