const { body, check } = require("express-validator");
const { pool } = require("../../config/server");

exports.TRUCK_INFO = [
  check("trucktypeid")
    .isString()
    .trim()
    .custom(async (value, { req }) => {
      const truckTypeInfo = await pool.query(
        "SELECT * FROM tbl_kp_truck_types WHERE id = $1",
        [value]
      );

      req.truckTypeInfo = truckTypeInfo.rows[0];
    }),
];

exports.NEW_TRUCK_TYPE = [
  body("truckType")
    .isString()
    .notEmpty()
    .trim()
    .toLowerCase()
    .custom(async (value, { _ }) => {
      const checkValidity = await pool.query(
        'SELECT * FROM tbl_kp_truck_types WHERE "truckType" = $1',
        [value]
      );
      if (checkValidity.rowCount > 0) {
        throw new Error("record exists");
      }
    }),
  body("tonnage").isArray().isLength({ min: 1 }).notEmpty(),
];

exports.TRUCK_TYPE_UPDATE = [
  body("truckType")
    .isString()
    .notEmpty()
    .trim()
    .toLowerCase()
    .custom(async (value, { req }) => {
      const checkValidity = await pool.query(
        'SELECT * FROM tbl_kp_truck_types WHERE "truckType" = $1 AND id <> $2',
        [value, req.headers.trucktypeid]
      );
      console.log(checkValidity.rowCount)
      if (checkValidity.rowCount > 0) {
        throw new Error("record exists");
      }
    }),
  body("tonnage").isArray().isLength({ min: 1 }).notEmpty(),
];
