const express = require('express')
const { orderController, uploads } = require('../../../controllers/orders/ordercontroller')
const { body } = require('express-validator')
const middleware = require('../../../middlewares/middleware')
const VALIDATOR = require('../../../middlewares/validators/order')

const orderRouter = express.Router()

// orderRouter.get('/orders', middleware.VERIFY_TOKEN,VALIDATOR.USER_CATEGOR,orderController.orders
// )

orderRouter.get(
  '/order-details',
  middleware.VERIFY_TOKEN,
  VALIDATOR.SELECTED_TRIP,
  orderController.getSelectedTrip
)

orderRouter.post(
  '/gate-in-order-availability',
  middleware.VERIFY_TOKEN,
  VALIDATOR.AVAILABILITY,
  orderController.createTripFromAvailability
)

orderRouter.post(
  '/create-new-order',
  middleware.VERIFY_TOKEN,
  VALIDATOR.NEW_ORDER,
  orderController.newOrder
)

orderRouter.patch(
  '/update-order',
  middleware.VERIFY_TOKEN,
  VALIDATOR.UPDATE_BOOKING_ORDER,
  orderController.updateOrder
)

orderRouter.post(
  '/upload-waybills',
  middleware.VERIFY_TOKEN,
  VALIDATOR.ADD_WAYBILL,
  uploads,
  orderController.uploadWaybills
)

orderRouter.patch(
  '/waybill-verification-request',
  middleware.VERIFY_TOKEN,
  VALIDATOR.WAYBILL_VERIFICATION_REQUEST,
  orderController.requestWaybillVerification
)

orderRouter.get(
  '/awaiting-gate-out',
  middleware.VERIFY_TOKEN,
  VALIDATOR.USER_CATEGORY,
  orderController.awaitingGateOut
)

orderRouter.post(
  '/trip-rate',
  middleware.VERIFY_TOKEN,
  VALIDATOR.ADD_TRIP_RATE,
  orderController.addTripRate
)

module.exports = orderRouter