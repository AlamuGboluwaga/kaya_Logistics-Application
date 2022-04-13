const { body, check } = require('express-validator')
const { pool } = require('../../config/server')

exports.USER_CATEGORY = [
  check('_')
    .custom(async (value, { req }) => {
      const userInfo = await pool.query('SELECT "userType" FROM users WHERE id = $1', [req.userId])
      req.userType = userInfo.rows[0].userType
    })
]


exports.AVAILABILITY = [
  check('truckavailabilityid')
    .custom(async (value, { req }) => {
      const availabilityInfo = await pool.query('SELECT *  FROM tbl_kp_truck_availabilities WHERE id = $1', [value])
      req.truckAvailabilityInfo = availabilityInfo.rows[0]
    })
]

exports.UPDATE_TRUCK_AVAILABILITY_STATUS = [
  body('status')
    .notEmpty()
    .isObject(),
]


exports.TRUCK_AVAILABILITY = [
  body("ownedBy")
    .isUUID()
    .notEmpty()
    .trim(),
  body("client")
    .isUUID()
    .notEmpty()
    .trim(),
  body("loadingSite")
    .isString()
    .trim()
    .notEmpty()
    .toLowerCase(),
  body("truckNo")
    .isString()
    .trim()
    .toUpperCase()
    .notEmpty()
    .customSanitizer(value => {
      return value.replace(/ /g, '')
    })
    .custom(async (value, { _ }) => {
      const checkTruck = await pool.query('SELECT * FROM tbl_kp_truck_availabilities WHERE "truckNo" = $1 AND "gatedIn" = FALSE', [
        value
      ])
      if (checkTruck.rowCount >= 1) {
        throw new Error("conflict")
      }
    }),
  body("truckType")
    .isUUID()
    .trim()
    .notEmpty(),
  body("tonnage")
    .isString()
    .notEmpty()
    .trim(),
  body("driver")
    .isUUID()
    .trim()
    .notEmpty(),
  body("product")
    .isString()
    .trim()
    .notEmpty(),
  body("destination")
    .isString()
    .notEmpty()
    .trim(),
  body("locations")
    .isArray()
    .isLength({ min: 1 }),
  body("status")
    .notEmpty(),
]

