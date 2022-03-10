const express = require('express')
const AuthRoute = require('./endpoints/auth')
const router = express.Router()

router.use(process.env.BASE_URL, [
  AuthRoute
])


module.exports = router