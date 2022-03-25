const express = require("express");
const AuthController = require("../../controllers/authcontroller");
const validate = require("../../middlewares/validators/user");
const AuthRoute = express.Router();
const { VERIFY_TOKEN } = require("../../middlewares/middleware");

AuthRoute.post("/register", validate.SIGNUP, AuthController.register);
AuthRoute.post("/login", validate.LOGIN, AuthController.login);
AuthRoute.post("/request-password-reset", AuthController.resetPassword);
AuthRoute.patch("/update-password", AuthController.updatePassword);
AuthRoute.patch(
  "/email-verification",
  VERIFY_TOKEN,
  AuthController.verifyEmail
);

module.exports = AuthRoute;
