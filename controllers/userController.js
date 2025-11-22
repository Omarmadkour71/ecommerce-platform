const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const handlerFactory = require("./handlerFactory");

const filterData = (obj, ...fields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (fields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// CRUD Operations
exports.createUser = handlerFactory.createDoc(User);
exports.getUser = handlerFactory.getDoc(User);
exports.updateUser = handlerFactory.updateDoc(User);
exports.deleteUser = handlerFactory.deleteDoc(User);

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    status: "success",
    Date: users,
  });
});

// Updating Profile
exports.updateProfile = catchAsync(async (req, res, next) => {
  // (1) get the current user
  const currentUser = await User.findById(req.user.id);
  if (!currentUser) {
    return next(new AppError("please login before updating your profile", 401));
  }

  // (2) check if the user sent a password to change
  if (req.body.password || req.body.confrimPassword) {
    return next(
      new AppError("please use /updatepassword to change your password", 400)
    );
  }

  // (3) update the user profile
  const filteredObj = filterData(req.body, "name", "email");
  if (req.file) filteredObj.photo = req.file.filename;
  const updatedUser = await User.findByIdAndUpdate(
    currentUser.id,
    filteredObj,
    {
      new: true,
      runValidators: true,
    }
  );

  // (4) Send Response to user
  res.status(201).json({
    status: "Success",
    User: {
      updatedUser,
    },
  });
});
