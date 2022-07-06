const { body, check } = require("express-validator");
const { pool } = require("../../config/server");

exports.USER_CATEGORY = [
  check("_").custom(async (value, { req }) => {
    const userInfo = await pool.query(
      'SELECT "userType" FROM users WHERE id = $1',
      [req.userId]
    );
    req.userType = userInfo.rows[0].userType;
  }),
];

exports.AVAILABILITY = [
  check("truckavailabilityid").custom(async (value, { req }) => {
    const availabilityInfo = await pool.query(
      "SELECT *  FROM tbl_kp_truck_availabilities WHERE id = $1",
      [value]
    );
    req.truckAvailabilityInfo = availabilityInfo.rows[0];
  }),
];

exports.SELECTED_TRIP = [
  check("orderid").custom(async (value, { req }) => {
    const orderInfo = await pool.query(
      `SELECT a.*, b.id AS "waybillId", b.waybill as "waybills", b."verificationStatus",  b."invoiceStatus", b."invoiceDate", b."verificationStatus", b."approvalStatus", c.id AS "rateId", c."clientRate", c."transporterRate", c.incentive, c.ago, c.advance, c.balance, d."companyName", d."clientAlias" FROM tbl_kp_orders a LEFT JOIN tbl_kp_order_waybill b ON a.id = b."orderId" LEFT JOIN tbl_kp_order_payments c ON a.id = c."orderId" LEFT JOIN tbl_kp_clients d ON a.client = d.id WHERE a.id = $1`, [value]
    );
    req.orderInfo = orderInfo.rows[0];
  }),
];

exports.UPDATE_TRUCK_AVAILABILITY_STATUS = [
  body("status").notEmpty().isObject(),
];

exports.TRUCK_AVAILABILITY = [
  body("ownedBy").isUUID().notEmpty().trim(),
  body("client").isUUID().notEmpty().trim(),
  body("loadingSite").isString().trim().notEmpty().toLowerCase(),
  body("truckNo")
    .isString()
    .trim()
    .toUpperCase()
    .notEmpty()
    .customSanitizer((value) => {
      return value.replace(/ /g, "");
    })
    .custom(async (value, { _ }) => {
      const checkTruck = await pool.query(
        'SELECT * FROM tbl_kp_truck_availabilities WHERE "truckNo" = $1 AND "gatedIn" = FALSE',
        [value]
      );
      if (checkTruck.rowCount >= 1) {
        throw new Error("conflict");
      }
    }),
  body("truckType").isUUID().trim().notEmpty(),
  body("tonnage").isString().notEmpty().trim(),
  body("driver").isUUID().trim().notEmpty(),
  body("product").isString().trim().notEmpty(),
  body("destination").isString().notEmpty().trim(),
  body("locations").isArray().isLength({ min: 1 }),
  body("status").notEmpty(),
];

exports.NEW_ORDER = [
  body("ownedBy").isUUID().notEmpty().trim(),
  body("client").isUUID().notEmpty().trim(),
  body("loadingSite").isString().trim().notEmpty().toLowerCase(),
  body("truckNo")
    .isString()
    .trim()
    .toUpperCase()
    .notEmpty()
    .customSanitizer((value) => {
      return value.replace(/ /g, "");
    })
    .custom(async (value, { _ }) => {
      const checkTruck = await pool.query(
        'SELECT * FROM tbl_kp_orders WHERE "truckNo" = $1 AND "tripStatus" = $2 AND tracker < $3',
        [value, "ON", 5]
      );
      if (checkTruck.rowCount >= 1) {
        throw new Error("conflict");
      }
    }),
  body("truckType").isUUID().trim().notEmpty(),
  body("tonnage").isString().notEmpty().trim(),
  body("driver").isUUID().trim().notEmpty(),
  body("product").isString().trim().notEmpty(),
  body("destination").isString().notEmpty().trim(),
  body("locations").isArray().isLength({ min: 1 }),
];

exports.UPDATE_BOOKING_ORDER = [
  check("orderid").custom(async (_, { req }) => {
    const checkBooking = await pool.query(
      "SELECT id FROM tbl_kp_orders WHERE id = $1",
      [req.headers.orderid]
    );
    if (checkBooking.rowCount <= 0) {
      throw new Error("not found");
    }
  }),
  body("customerName").isString().notEmpty().trim(),
  body("customerPhoneNo").notEmpty().trim(),
  body("loadedWeight").isString().notEmpty().trim(),
  body("customerAddress").isString().notEmpty().trim(),
];

exports.ADD_WAYBILL = [
  check("orderid")
    .isUUID()
    .notEmpty()
    .trim()
    .custom(async (value, { req }) => {
      const checkOrder = await pool.query('SELECT * FROM tbl_kp_orders WHERE id = $1', [value])
      if (checkOrder.rowCount > 0) {
        return req.order = checkOrder.rows[0]
      }
      throw new Error('invalid order')
    })
];

exports.WAYBILL_VERIFICATION_REQUEST = [
  check("waybill")
    .isUUID()
    .notEmpty()
    .trim()
    .custom(async (value, { req }) => {
      const verifyWaybill = await pool.query(
        'SELECT a.*, c."companyName", d.email, d."firstName", d."lastName" FROM tbl_kp_order_waybill a JOIN tbl_kp_orders b ON a."orderId" = b.id JOIN tbl_kp_clients c ON b.client = c.id JOIN users d ON c."managedBy" = d.id WHERE a.id = $1', [value])
      if (verifyWaybill.rowCount > 0) {
        req.waybillInfo = verifyWaybill.rows[0]
      }
      else {
        throw new Error('invalid waybill')
      }
    })
]

exports.ADD_TRIP_RATE = [
  body('gtv')
    .isNumeric()
    .notEmpty(),
  check('orderid')
    .isUUID()
    .notEmpty()
    .trim()
    .custom(async (_, { req }) => {
      const tripValidity = await pool.query('SELECT * FROM tbl_kp_orders WHERE id = $1', [req.headers.orderid])
      if (tripValidity.rowCount < 1) {
        throw new Error('trip not recognized.')
      }
    })

];  
