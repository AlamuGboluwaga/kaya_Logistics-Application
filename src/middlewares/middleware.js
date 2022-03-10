const jwt = require('jsonwebtoken')
require('dotenv').config

const GENERATE_TOKEN = (payload, duration) => {
  return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: duration })
}

module.exports = {
  GENERATE_TOKEN
}