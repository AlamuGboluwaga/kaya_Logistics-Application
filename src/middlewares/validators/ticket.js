const { pool } = require("../../config/server");
const { body, validationResult } = require("express-validator");

const CHECK_TICKET = [
  body("categoryName").isString().trim().notEmpty(),
  body("Description").isString().trim(),
];

// const errors = validationResult(req);
// if (!errors.isEmpty()) {
//   return res.status(400).json({ errors: errors.array() });
// }

module.exports = { CHECK_TICKET };


// .regexp(/[^@#$&*!~`"/\|]/)