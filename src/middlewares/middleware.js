const jwt = require('jsonwebtoken')
const response = require('../handlers/response')
require('dotenv').config

const GENERATE_TOKEN = (payload, duration) => {
  return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: duration })
}

const VERIFY_TOKEN = (req, res, next) => {
  if (!req.headers.authorization) {
    return response.error(
      res, 400, 'operation aborted', 'token error'
    )
  }
  const token = req.headers.authorization.split(" ")[1]
  if (!token) {
    return response.error(
      res,
      403,
      'unauthorized',
      null
    )
  }
  try {
    const validateToken = jwt.verify(token, process.env.SECRET_KEY)
    req.userId = validateToken.userId
    next()
  }
  catch (err) {
    response.error(
      res, 403, 'access denied', {}
    )
  }
}

module.exports = {
  GENERATE_TOKEN,
  VERIFY_TOKEN
}