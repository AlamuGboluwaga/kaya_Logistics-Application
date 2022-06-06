const express = require('express')
const verificationcontroller = require('../../../controllers/orders/verificationcontroller')
const middleware = require('../../../middlewares/middleware')

const verificationRouter = express.Router()

verificationRouter.get(
  '/verified-trips',
  middleware.VERIFY_TOKEN,
  verificationcontroller.verifiedTrips
)

verificationRouter.get(
  '/trips-pending-verification',
  middleware.VERIFY_TOKEN,
  verificationcontroller.pendingVerification
)

verificationRouter.patch(
  '/client-trip-verification',
  middleware.VERIFY_TOKEN,
  verificationcontroller.verifyTrip
)

module.exports = verificationRouter
