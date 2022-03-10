const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/server");
require("dotenv").config();
const { validationResult } = require("express-validator");
const response = require("../handlers/response");
const os = require("os");
const mailer = require('../handlers/mailer')
const { GENERATE_TOKEN } = require('../middlewares/middleware')
const { signUpWelcomeEmail } = require('../handlers/mails')

class AuthController {
  static async register(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return response.error(res, 422, "validation error", errors.mapped());
    }
    const {
      email,
      password
    } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 12);
      const signUpInfo = {
        ipAddress: req.ip,
        longitude: "",
        latitude: "",
        operatingSystem: {
          architecture: os.arch(),
          platform: os.platform(),
          osRelease: os.release(),
        },
      };
      const signUpQuery = 'INSERT INTO users (email, password, "signUpInfo") VALUES ($1, $2, $3) RETURNING id';
      const poolResult = await pool.query(signUpQuery, [
        email,
        hashedPassword,
        signUpInfo,
      ]);
      const userId = poolResult.rows[0].id;
      const token = GENERATE_TOKEN({ userId }, 3600)

      await mailer.signUpEmail(email, 'Fantastic! You are in.', signUpWelcomeEmail())

      response.success(res, 201, "registration successful", {
        email,
        token,
        userId,
      });
    } catch (err) {
      response.error(res, 500, "internal server error", err.message)
    }
  }

  static async login(req, res, next) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return response.error(
        res, 422, 'validation error', errors.mapped()
      )
    }
    const { email, password } = req.body
    try {

      const userInfo = await pool.query('SELECT id, email, password FROM users WHERE email = $1 ', [email])
      const doMatching = await bcrypt.compare(password, userInfo.rows[0].password)
      if (!doMatching) {
        return response.error(res, 401, 'incorrect login details', {})
      }
      const token = GENERATE_TOKEN({ userId: userInfo.rows[0].id }, 3600)
      response.success(
        res, 200, 'login successful', {
        id: userInfo.rows[0].id,
        token,
        email
      }
      )
    }
    catch (err) {
      response.error(
        res, 500, 'internal server error', err.message
      )
    }
  }

  static async resetPassword(req, res, next) { }

  static async updatePassword(req, res, next) { }
}

module.exports = AuthController;