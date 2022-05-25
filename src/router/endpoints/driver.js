const express = require('express')
const { driverController, upload } = require('../../controllers/drivercontroller')
const middleware = require('../../middlewares/middleware')
const VALIDATE = require('../../middlewares/validators/driver')
const driverRouter = express.Router()

driverRouter.get(
  '/drivers',
  middleware.VERIFY_TOKEN,
  driverController.drivers
)

driverRouter.get(
  '/driver',
  middleware.VERIFY_TOKEN,
  VALIDATE.DRIVER_INFO,
  driverController.driver
)

driverRouter.get(
  '/verify-driver-licence',
  middleware.VERIFY_TOKEN,
  VALIDATE.VERIFY_DRIVER_LICENCE,
  driverController.verifyDriverLicence
)

driverRouter.post(
  '/driver',
  middleware.VERIFY_TOKEN,
  VALIDATE.NEW_DRIVER,
  driverController.addDriver
)

driverRouter.put(
  '/driver',
  middleware.VERIFY_TOKEN,
  VALIDATE.DRIVER_UPDATE,
  driverController.updateDriver
)

driverRouter.delete(
  '/remove-driver',
  middleware.VERIFY_TOKEN,
  VALIDATE.DRIVER_INFO,
  driverController.removeDriver
)

driverRouter.post(
  '/upload-drivers-licence',
  middleware.VERIFY_TOKEN,
  upload,
  driverController.uploadLicence
)


module.exports = driverRouter