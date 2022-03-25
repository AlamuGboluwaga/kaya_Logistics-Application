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
      password,
      firstName,
      lastName,
      userType,
      location
    } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 12);
      const signUpInfo = {
        ipAddress: req.ip,
        longitude: location.longitude,
        latitude: location.latitude,
        operatingSystem: {
          architecture: os.arch(),
          platform: os.platform(),
          osRelease: os.release(),
        },
      };
      const signUpQuery = 'INSERT INTO users ("firstName", "lastName", email, password, "userType", "signUpInfo") VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, "firstName", "lastName", "userType", "signUpInfo", "updatedAt", "createdAt"';
      const poolResult = await pool.query(signUpQuery, [
        firstName,
        lastName,
        email,
        hashedPassword,
        userType,
        signUpInfo,
      ]);
      const userId = poolResult.rows[0].id;
      const token = GENERATE_TOKEN({ userId }, 86400)

      await mailer.signUpEmail(email, 'Fantastic! You are in.', signUpWelcomeEmail(userId))

      response.success(res, 201, "registration successful", {
        ...poolResult.rows[0],
        token,
        userId,
        tokenExpiresIn: 86400
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
      const userInfo = await pool.query('SELECT * FROM users WHERE email = $1', [email])
      const doMatching = await bcrypt.compare(password, userInfo.rows[0].password)
      if (!doMatching) {
        return response.error(res, 401, 'incorrect login details', {})
      }
      const userData = userInfo.rows[0]
      const { userType, id, firstName, lastName } = userData
      const token = GENERATE_TOKEN({ userId: userInfo.rows[0].id }, 86400)
      response.success(
        res, 200, 'login successful', {
        token,
        email,
        userType,
        firstName,
        lastName,
        id,
        tokenExpiresIn: 86400
      }
      )
    }
    catch (err) {
      response.error(
        res, 500, 'internal server error', err.message
      )
    }
  }

  static async verifyEmail(req, res, next) {
    try {
      const emailVerificationQuery = 'UPDATE users SET "emailVerifiedAt" = $1 WHERE id = $2 RETURNING id, "emailVerifiedAt"'
      const emailVerificationResponse = await pool.query(emailVerificationQuery, [new Date().toISOString(), req.userId])
      response.success(
        res, 200, 'confirmation successful', emailVerificationResponse
      )
    }
    catch (err) {
      response.error(
        res, 500, 'internal server error', {}
      )
    }
    console.log(req.userId)
  }

  static async resetPassword(req, res, next) { }

  static async updatePassword(req, res, next) { }
}

module.exports = AuthController;