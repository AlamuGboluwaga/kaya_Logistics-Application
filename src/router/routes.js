const express = require('express')
const router = express.Router()

router.use(process.env.BASE_URL, [
  require('./endpoints/auth'),
  require('./endpoints/client')
])


module.exports = router