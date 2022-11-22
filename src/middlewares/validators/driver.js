const { body, check } = require("express-validator");
const { pool } = require("../../config/server");

exports.DRIVER_INFO = [check("driverid").isString().trim().custom(async (value, { req }) => {
  const driverInfo = await pool.query("SELECT * FROM tbl_kp_drivers WHERE id = $1",[value]);req.driverInfo = driverInfo.rows[0];
    }),
];


exports.VERIFY_DRIVER_LICENCE = [
  check("licenceNo")
    .isString()
    .trim()
    .custom(async (_, { req }) => {
      const licenceNo = req.query.licenceNo.toLowerCase()
      const driverInfo = await pool.query(
        "SELECT * FROM tbl_kp_drivers WHERE \"licenceNo\" = $1",
        [licenceNo]
      );
      req.driverInfo = driverInfo.rows[0];
    }),
]

exports.NEW_DRIVER = [body('firstName').isString().trim().toLowerCase().notEmpty(),body('lastName').isString().trim().toLowerCase().notEmpty(),
body('phoneNo')
    .isArray()
    .isLength({ min: 1 }),
  body("licenceNo")
    .isString()
    .notEmpty()
    .trim()
    .toLowerCase()
    .custom(async (value, { _ }) => {
      const checkValidity = await pool.query(
        'SELECT * FROM tbl_kp_drivers WHERE "licenceNo" = $1',
        [value]
      );
      if (checkValidity.rowCount > 0) {
        throw new Error("record exists");
      }
    }),
  body('licenceUrl')
    .notEmpty()
    .isURL()
    .trim()
];

exports.DRIVER_UPDATE = [
  body('firstName')
    .isString()
    .trim()
    .toLowerCase()
    .notEmpty(),
  body('lastName')
    .isString()
    .trim()
    .toLowerCase()
    .notEmpty(),
  body('phoneNo')
    .isArray()
    .isLength({ min: 1 }),
  body("licenceNo")
    .isString()
    .notEmpty()
    .trim()
    .toLowerCase()
    .custom(async (value, { req }) => {
      const checkValidity = await pool.query(
        'SELECT * FROM tbl_kp_drivers WHERE "licenceNo" = $1 AND id <> $2',
        [value, req.headers.driverid]
      );
      console.log(checkValidity.rowCount)
      if (checkValidity.rowCount > 0) {
        throw new Error("record exists");
      }
    }),
  body('licenceUrl')
    .notEmpty()
    .isURL()
    .trim()
];
