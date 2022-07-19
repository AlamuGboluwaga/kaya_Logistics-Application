const { body, check } = require("express-validator");
const { pool } = require("../../config/server");

exports.TRIP_EVENT_HISTORY = [
  check("orderId")
    .isUUID()
    .notEmpty()
    .rtrim()
    .ltrim()
    .toLowerCase()
    .custom(async (value, { req }) => {
      const checkTripEvent = await pool.query(
        'SELECT * FROM tbl_kp_trip_events WHERE "orderId" = $1',
        [value]
      );
      if (checkTripEvent.rowCount > 0) {
        req.tripEventHistory = checkTripEvent.rows.pop();
      } else {
        req.tripEventHistory = checkTripEvent.rows;
      }
    }),
];

exports.CREATE_EVENT_HISTORY = [
  body("orderId")
    .isUUID()
    .notEmpty()
    .rtrim()
    .ltrim()
    .toLowerCase()
    .custom(async (value, { req }) => {
      let existingRecord;
      const checkPreviousDayRecord = await pool.query(
        'SELECT * FROM tbl_kp_trip_events WHERE "orderId" = $1',
        [value]
      );
      if (checkPreviousDayRecord.rowCount > 0) {
        const myLastRecord = checkPreviousDayRecord.rows.pop();
        existingRecord = myLastRecord.eventHistory.visibility;
      } else {
        existingRecord = [];
      }
      req.existingRecord = existingRecord;
    }),
];
