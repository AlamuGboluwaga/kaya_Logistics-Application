const { body, check } = require("express-validator");
const { pool } = require("../../config/server");

exports.ADD_CLIENT = [
  body("companyName")
    .isString()
    .notEmpty()
    .toLowerCase()
    .custom(async (value, { _1 }) => {
      const checkExist = await pool.query(
        'SELECT "companyName" FROM tbl_kp_clients WHERE "companyName" = $1',
        [value]
      );
      if (checkExist.rowCount > 0) {
        throw new Error("data conflicted");
      }
    }),
  body("clientAlias").isString().notEmpty().toLowerCase()
    .custom(async (value, { _2 }) => {
      const checkExist = await pool.query(
        'SELECT "clientAlias" FROM tbl_kp_clients WHERE "clientAlias" = $1',
        [value]
      );
      if (checkExist.rowCount > 0) {
        throw new Error("data conflicted");
      }
    }),
];

exports.UPDATE_CLIENT = [
  body("companyName")
    .isString()
    .notEmpty()
    .toLowerCase()
    .custom(async (value, { req }) => {
      const checkExist = await pool.query(
        'SELECT "companyName" FROM tbl_kp_clients WHERE "companyName" = $1 AND id <> $2',
        [value, req.params.clientId]
      );
      if (checkExist.rowCount > 0) {
        throw new Error("data conflicted");
      }
    }),
  body("clientAlias").isString().notEmpty().toLowerCase()
    .custom(async (value, { req }) => {

      const checkExist = await pool.query(
        'SELECT "clientAlias" FROM tbl_kp_clients WHERE "clientAlias" = $1 AND id <> $2',
        [value, req.params.clientId]
      );
      if (checkExist.rowCount > 0) {
        throw new Error("data conflicted");
      }
    }),
]

exports.SUSPEND_CLIENT = [
  check('clientId')
    .custom(async (_, { req }) => {
      const clientValidity = await pool.query(
        'SELECT id FROM tbl_kp_clients WHERE id = $1',
        [req.params.clientId]
      )
      if (clientValidity.rowCount < 0) {
        throw new Error('not found')
      }
    })
]
