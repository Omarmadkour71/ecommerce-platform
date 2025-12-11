const Product = require("../models/productModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const handlerFactory = require("./handlerFactory");
const multer = require("multer");
const sharp = require("sharp");

exports.getAllProducts = handlerFactory.getAllDocs(Product);
exports.createProduct = handlerFactory.createDoc(Product);
exports.updateProduct = handlerFactory.updateDoc(Product);
exports.deleteProduct = handlerFactory.deleteDoc(Product);
exports.getProduct = handlerFactory.getDoc(Product);

// Multer Configuration for uploading products photo
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("not an image!, please upload only images", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadProductPhoto = upload.fields([{ name: "images", maxCount: 10 }]);

// Sharp Configuration for Saving and resizing photos
exports.resizeProductImages = catchAsync(async (req, res, next) => {
  if (!req.files || !req.files.images) return next();

  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const fileName = `Product-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(1200, 1200)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/products/${fileName}`);

      req.body.images.push(fileName);
    })
  );

  next();
});
