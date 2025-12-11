const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Email = require("../utils/email");
const crypto = require("crypto");

// Creating and sending a token to user
const creatSendToken = (user, statusCode, res) => {
  // Creating jwt token
  const id = user._id;
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_IN,
  });

  // Sending Response to user
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    User: {
      user,
    },
  });
};

// Sign Up New user
exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    phoneNumber: req.body.phoneNumber,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });
  if (!req.body.phone) {
    delete req.body.phone; // removes the field
  }
  creatSendToken(newUser, 201, res);
});

// Logging in users
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // Check if the user enter email & password
  if (!email || !password) {
    return next(new AppError("please enter email and password", 400));
  }

  // Check if the email & password exist
  const user = await User.findOne({ email: email }).select("+password");
  if (!user || !(await user.checkPassword(password, user.password))) {
    return next(new AppError("wrong email or password, please try again", 400));
  }

  // Send Token to user
  creatSendToken(user, 200, res);
});

// Protect => not accesing some pages without logging in
exports.protect = catchAsync(async (req, res, next) => {
  // (1) Getting the token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(new AppError("please login to access this page", 401));
  }

  // (2) verfiying the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // (3) checking if the password is changed after logging
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("this user doesn't exist! please log in again", 401)
    );
  }
  if (currentUser.isPasswordChanged(decoded.iat)) {
    return next(new AppError("Password Changed! please log in again", 401));
  }

  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// Restricting pages to some roles only
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("you don't have access to this content!", 403));
    }
    next();
  };

// Forgot Password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // (1) find the user
  const currentUser = await User.findOne({ email: req.body.email });
  if (!currentUser) {
    return next(new AppError("wrong email! please try again", 400));
  }

  // (2) Create Reset Token
  const resetToken = currentUser.createResetToken();
  await currentUser.save({ validateBeforeSave: false });

  // (3) Sending Reset token to user in email
  try {
    const url = `${req.get("host")}/api/v1/users/resetpassword/${resetToken}`;
    new Email(currentUser, url).sendResetToken();
    res.status(200).json({
      status: "success",
      message: "Password Reset Token sent Succesfully",
    });
  } catch (err) {
    currentUser.passwordResetToken = undefined;
    currentUser.passwordResetExpires = undefined;
    await currentUser.save({ validateBeforeSave: false });
    console.log(err);
    return next(new AppError("Error while sending Reset Token", 404));
  }
});

// Reset Password
exports.resetPassword = catchAsync(async (req, res, next) => {
  // (1) Get the current user and check if he exist
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const currentUser = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!currentUser) {
    return next(
      new AppError("this Token don't exist or no Longer Valied", 401)
    );
  }

  // (2) Update User Password
  // not using findByIdAndUpdate because it does use pre "save" middlewares
  currentUser.password = req.body.password;
  currentUser.confirmPassword = req.body.confirmPassword;
  currentUser.passwordResetExpires = undefined;
  currentUser.passwordResetToken = undefined;
  currentUser.passwordChangedAt = Date.now();
  await currentUser.save();

  // (3) sending jwt token to user
  creatSendToken(currentUser, 200, res);
});
