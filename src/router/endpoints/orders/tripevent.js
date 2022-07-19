const express = require('express')
const tripEventRouter = express.Router()
const tripEventController = require('../../../controllers/orders/eventcontroller')
const middleware = require('../../../middlewares/middleware')
const orderEvent = require('../../../middlewares/validators/orderevent')

tripEventRouter.get(
  '/trip-event-history',
  middleware.VERIFY_TOKEN,
  orderEvent.TRIP_EVENT_HISTORY,
  tripEventController.tripEventHistory
)

tripEventRouter.post(
  '/create-trip-event',
  middleware.VERIFY_TOKEN,
  orderEvent.CREATE_EVENT_HISTORY,
  tripEventController.addTripEvent
)

module.exports = tripEventRouter