const express = require('express')
const trucktypecontroller = require('../../controllers/trucktypecontroller')

const middleware = require('../../middlewares/middleware')
const VALIDATE = require('../../middlewares/validators/trucktypes')

const truckTypeRouter = express.Router()


truckTypeRouter.get(
  '/truck-types',
  middleware.VERIFY_TOKEN,
  trucktypecontroller.truckTypes
)

truckTypeRouter.get(
  '/truck-type',
  middleware.VERIFY_TOKEN,
  VALIDATE.TRUCK_INFO,
  trucktypecontroller.truckType
)

truckTypeRouter.post(
  '/truck-type',
  middleware.VERIFY_TOKEN,
  VALIDATE.NEW_TRUCK_TYPE,
  trucktypecontroller.addTruckType
)

truckTypeRouter.put(
  '/truck-type',
  middleware.VERIFY_TOKEN,
  VALIDATE.TRUCK_TYPE_UPDATE,
  trucktypecontroller.updateTruckType
)

truckTypeRouter.delete(
  '/remove-location',
  middleware.VERIFY_TOKEN,
  VALIDATE.TRUCK_INFO,
  trucktypecontroller.removeTruckType
)


module.exports = truckTypeRouter