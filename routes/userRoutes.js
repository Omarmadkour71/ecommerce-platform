const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const userRouter = express.Router();

// Authentication Routes
userRouter.route("/signup").post(authController.signUp);
userRouter.route("/login").post(authController.login);

// Forgot and Reset Password
userRouter.route("/forgotpassword").post(authController.forgotPassword);
userRouter.route("/resetpassword/:token").post(authController.resetPassword);

// Updating User Profile
userRouter
  .route("/updateprofile")
  .post(
    authController.protect,
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateProfile
  );

// CRUD Operations
userRouter
  .route("/")
  .post(
    userController.updateProfile,
    userController.resizeUserPhoto,
    userController.createUser
  )
  .get(
    authController.protect,
    authController.restrictTo("admin"),
    userController.getAllUsers
  );
userRouter
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = userRouter;
