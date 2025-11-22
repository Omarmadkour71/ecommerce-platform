const Product = require("../models/productModel");
const handlerFactory = require("./handlerFactory");

exports.getAllProducts = handlerFactory.getAllDocs(Product);
exports.createProduct = handlerFactory.createDoc(Product);
exports.updateProduct = handlerFactory.updateDoc(Product);
exports.deleteProduct = handlerFactory.deleteDoc(Product);
exports.getProduct = handlerFactory.getDoc(Product);
