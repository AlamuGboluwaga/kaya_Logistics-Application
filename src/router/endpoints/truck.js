const express = require('express')
const truckRouter = express.Router()
const middleware = require('../../middlewares/middleware')
const { TruckController } = require('../../controllers/truckcontroller')
const VALIDATOR = require('../../middlewares/validators/truck')


truckRouter.post(
  '/new-truck',
  middleware.VERIFY_TOKEN,
  VALIDATOR.addTruck,
  TruckController.addTruck
)
truckRouter.get(
  '/trucks',
  middleware.VERIFY_TOKEN,
  VALIDATOR.allTrucks,
  TruckController.allTrucks
)

truckRouter.get(
  '/truck',
  middleware.VERIFY_TOKEN,
  VALIDATOR.truck,
  TruckController.truck
)

truckRouter.put(
  '/truck',
  middleware.VERIFY_TOKEN,
  VALIDATOR.addTruck,
  TruckController.updateTruck
)


module.exports = truckRouter