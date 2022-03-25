const express = require('express')
const middleware = require('../../middlewares/middleware')
const LoadingSiteController = require('../../controllers/loadingsitecontroller')
const loadingSiteRouter = express.Router()
const VALIDATOR = require('../../middlewares/validators/clientloadingsite')


loadingSiteRouter.get(
  '/client-loading-sites',
  middleware.VERIFY_TOKEN,
  LoadingSiteController.clientLoadingSites
)

loadingSiteRouter.patch(
  '/add-client-loading-site',
  middleware.VERIFY_TOKEN,
  VALIDATOR.CHECK_LOADING_SITE,
  LoadingSiteController.addLoadingSites
)

loadingSiteRouter.delete(
  '/remove-client-loading-site',
  middleware.VERIFY_TOKEN,
  VALIDATOR.CHECK_LOADING_SITE,
  LoadingSiteController.removeLoadingSites
)

module.exports = loadingSiteRouter