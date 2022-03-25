const { pool } = require('../../config/server')
const { body } = require('express-validator')
const response = require('../../handlers/response')

exports.CHECK_LOADING_SITE = [
  body('loadingSite')
    .isString()
    .notEmpty()
    .toLowerCase()
    .custom(async (_, { req }) => {
      const clientId = req.headers.clientid
      const checkClientQuery = await pool.query(
        'SELECT * FROM tbl_kp_clients WHERE id = $1', [
        clientId
      ]
      )
      if (checkClientQuery.rowCount <= 0) {
        return response.error(
          res, 404, 'loadingsite: client not found', null
        )
      }
    })
]