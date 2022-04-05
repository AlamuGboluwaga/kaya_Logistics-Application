const express = require('express')
const clientRoute = express.Router()
const clientController = require('../../controllers/clientcontroller')
const VALIDATE = require('../../middlewares/validators/client')
const middleware = require('../../middlewares/middleware')

clientRoute.get(
  '/client',
  middleware.VERIFY_TOKEN,
  clientController.getClientInfo
)

clientRoute.get(
  '/clients',
  middleware.VERIFY_TOKEN,
  clientController.allClients
)

clientRoute.get(
  '/clients/:clientId',
  middleware.VERIFY_TOKEN,
  clientController.client
)

clientRoute.post(
  '/new-client',
  middleware.VERIFY_TOKEN,
  VALIDATE.ADD_CLIENT,
  clientController.addNewClient
)

clientRoute.put(
  '/update-client/:clientId',
  middleware.VERIFY_TOKEN,
  VALIDATE.UPDATE_CLIENT,
  clientController.updateClient
)

clientRoute.patch(
  '/suspend-client/:clientId',
  middleware.VERIFY_TOKEN,
  VALIDATE.SUSPEND_CLIENT,
  clientController.suspendClient
)

clientRoute.patch(
  '/update-client-url/:clientId',
  middleware.VERIFY_TOKEN,
  VALIDATE.ADD_CLIENT_URL,
  clientController.updateClientUrl
)

clientRoute.delete(
  '/remove-client-url/:clientId',
  middleware.VERIFY_TOKEN,
  VALIDATE.CLIENT_URL_REMOVAL,
  clientController.removeClientUrl
)

clientRoute.get(
  '/client-managers',
  clientController.accountManagers
)

clientRoute.patch(
  '/client/account-manager/:clientId',
  middleware.VERIFY_TOKEN,
  VALIDATE.ACCOUNT_MANAGER,
  clientController.addManager
)

module.exports = clientRoute