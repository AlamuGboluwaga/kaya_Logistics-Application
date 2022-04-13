const express = require('express')
const TruckAvailabilityController = require('../../../controllers/orders/truckavailabilitycontroller')
const middleware = require('../../../middlewares/middleware')
const VALIDATOR = require('../../../middlewares/validators/order')

const truckAvailabilityRouter = express.Router()

truckAvailabilityRouter.get(
  '/truck-availabilities',
  middleware.VERIFY_TOKEN,
  VALIDATOR.USER_CATEGORY,
  TruckAvailabilityController.truckAvailabilities
)

truckAvailabilityRouter.post(
  '/truck-availability',
  middleware.VERIFY_TOKEN,
  VALIDATOR.TRUCK_AVAILABILITY,
  TruckAvailabilityController.addAvailability
)

truckAvailabilityRouter.get(
  '/truck-availability-info',
  middleware.VERIFY_TOKEN,
  VALIDATOR.AVAILABILITY,
  TruckAvailabilityController.truckAvailabilityInfo
)

truckAvailabilityRouter.patch(
  '/update-truck-availability-status',
  middleware.VERIFY_TOKEN,
  VALIDATOR.UPDATE_TRUCK_AVAILABILITY_STATUS,
  VALIDATOR.AVAILABILITY,
  TruckAvailabilityController.updateTruckAvailabilityStatus
)

module.exports = truckAvailabilityRouter