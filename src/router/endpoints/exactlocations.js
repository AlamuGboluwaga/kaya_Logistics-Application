const express = require('express')
const locationscontroller = require('../../controllers/locationscontroller')
const middleware = require('../../middlewares/middleware')
const VALIDATE = require('../../middlewares/validators/exactlocation')

const exactLocationRouter = express.Router()

exactLocationRouter.get(
  '/states',
  middleware.VERIFY_TOKEN,
  locationscontroller.regionalStates
)

exactLocationRouter.get(
  '/exact-locations',
  middleware.VERIFY_TOKEN,
  locationscontroller.allLocations
)

exactLocationRouter.post(
  '/exact-locations',
  middleware.VERIFY_TOKEN,
  VALIDATE.LOCATIONS,
  locationscontroller.addLocations
)

exactLocationRouter.delete(
  '/remove-location',
  middleware.VERIFY_TOKEN,
  VALIDATE.REMOVE_LOCATION,
  locationscontroller.removeLocations
)


module.exports = exactLocationRouter