const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { parsePhoneNumber } = require("libphonenumber-js");
const AppError = require("../utils/appError");

// Creating User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
    minlength: [5, "user name should be longer than 5 characters"],
    maxlength: [30, "user name should be less than 30 characters"],
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: [true, "this email is being used, please try again"],
    lowercase: true,
    validate: [validator.isEmail, "please enter a correct email"],
  },
  password: {
    type: String,
    required: [true, "please enter password"],
    select: false,
    minlength: [7, "password should be more than 7 characters"],
  },
  confirmPassword: {
    type: String,
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: "Passwords aren't matched!",
    },
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  photo: {
    type: String,
  },
  address: {
    type: String,
    trim: true,
  },
  phoneNumber: {
    type: String,
    trim: true,
    //unique: [true, "this phone number is already being used"],
  },
});

// Phone Number Validation Middleware
userSchema.pre("save", function (next) {
  if (!this.isModified("phoneNumber") || !this.phoneNumber) return next();

  const phone = parsePhoneNumber(this.phoneNumber, "EG");

  if (!phone || !phone.isValid()) {
    return next(
      new AppError("phone Number isn't valid! please try another number", 400)
    );
  }

  this.phoneNumber = phone.number;
  return next();
});

// Hashing the Password
userSchema.pre("save", async function (next) {
  //exit this middleware if the password didn't change
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

// Password Changed At middleware
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Method to check if the password is changed
userSchema.methods.isPasswordChanged = function (JWTiat) {
  if (this.passwordChangedAt) {
    const passwordChangeTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTiat < passwordChangeTimeStamp;
  }
  return false;
};

// method to create reset token
userSchema.methods.createResetToken = function () {
  const token = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 1000 * 10 * 60;
  return token;
};

// Method to check if the password is correct
userSchema.methods.checkPassword = async function (
  enteredPassword,
  userPassword
) {
  return await bcrypt.compare(enteredPassword, userPassword);
};

// Creating user Model
const User = mongoose.model("User", userSchema);
module.exports = User;
