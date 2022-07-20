const { check, body } = require('express-validator')
const { pool } = require('../../config/server')

exports.allTrucks = [
  check("user")
    .isUUID()
    .notEmpty()
    .rtrim()
    .ltrim()
    .custom(async (value, { req }) => {
      const userInfo = await pool.query('SELECT "userType", id FROM users WHERE id = $1 ', [value])
      if (userInfo.rowCount < 1) {
        throw new Error('user not found')
      }
      req.userInfo = userInfo.rows[0]
    })
]

exports.addTruck = [
  body('truckNo')
    .isString()
    .toLowerCase()
    .notEmpty()
    .trim()
    .customSanitizer((value) => {
      return value.replace(/\s/g, '')
    })
    .custom(async (value, { }) => {
      const checkTruck = await pool.query('SELECT * FROM tbl_kp_trucks WHERE "truckNo" = $1', [value])
      if (checkTruck.rowCount > 0) {
        throw new Error('conflict')
      }
    }),
  body('truckType')
    .isString()
    .notEmpty()
    .toLowerCase()
    .trim(),
  body('tonnage')
    .notEmpty()
    .trim()
]

exports.updateTruck = [
  body('truckNo')
    .isString()
    .toLowerCase()
    .notEmpty()
    .trim()
    .customSanitizer((value) => {
      return value.replace(/\s/g, '')
    })
    .custom(async (value, { req }) => {
      const checkTruck = await pool.query('SELECT * FROM tbl_kp_trucks WHERE "truckNo" = $1 AND id != $2', [value, req.headers.truck])
      if (checkTruck.rowCount > 0) {
        throw new Error('conflict')
      }
    }),
  body('truckType')
    .isString()
    .notEmpty()
    .toLowerCase()
    .trim(),
  body('tonnage')
    .notEmpty()
    .trim()
]

exports.truck = [
  check('truck')
    .isUUID()
    .notEmpty()
    .ltrim()
    .rtrim()
    .custom(async (value, { req }) => {
      const truckDetails = await pool.query('SELECT * FROM tbl_kp_trucks WHERE id = $1', [value])
      req.truckInfo = truckDetails.rows
    })
]