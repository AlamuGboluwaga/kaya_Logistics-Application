const { pool } = require("../../config/server");
const { body, validationResult } = require("express-validator");

const CHECK_TICKET = [
  body("categoryName").isString().trim().isLength({ min: 4 }).notEmpty(),
  body("description").isString().trim().isLength({ min: 4 }).notEmpty(),
];

module.exports = CHECK_TICKET ;


//     .custom((value, { req }) => {
//     if (value !== req.body.categoryName) {
//       throw new Error('Length must not be less than 4');
//     }
//   })
//   ,
//   body("Description").isString().trim().notEmpty()
// ];


// .regexp(/[^@#$&*!~`"/\|]/)