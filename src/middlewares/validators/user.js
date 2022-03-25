const { body } = require('express-validator')
const { pool } = require('../../config/server')

exports.SIGNUP = [
  body('firstName')
    .isString()
    .toLowerCase()
    .notEmpty(),
  body('lastName')
    .isString()
    .toLowerCase()
    .notEmpty(),
  body('email')
    .isEmail()
    .notEmpty()
    .normalizeEmail()
    .custom(async (value, { _ }) => {
      const checkUserEmailQuery = 'SELECT email FROM users WHERE email = $1'
      const exists = await pool.query(checkUserEmailQuery, [value]);
      if (exists.rowCount > 0) {
        throw new Error("email in use")
      }
    })
    .trim()
    .toLowerCase(),
  body('password')
    .isStrongPassword()
    .trim()
    .notEmpty(),
  body('confirmPassword')
    .notEmpty()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("password mismatch")
      }
      return true
    }),
  body('userType')
    .isString()
    .notEmpty()
    .toLowerCase()
]

exports.LOGIN = [
  body('email')
    .isEmail()
    .notEmpty()
    .normalizeEmail()
    .custom(async (value, { _ }) => {
      const checkUserEmailQuery = 'SELECT email FROM users WHERE email = $1'
      const exists = await pool.query(checkUserEmailQuery, [value]);
      if (exists.rowCount === 0) {
        throw new Error("email does not exists")
      }
    })
    .trim()
    .toLowerCase(),
  body('password')
    .isStrongPassword()
    .trim()
    .notEmpty(),
]