const express = require('express')
const clientRoute = express.Router()
const clientController = require('../../controllers/clientcontroller')
const VALIDATE = require('../../middlewares/validators/client')


clientRoute.get(
  '/clients',
  clientController.allClients
)

clientRoute.get(
  '/clients/:clientId',
  clientController.client
)

clientRoute.post(
  '/new-client',
  VALIDATE.ADD_CLIENT,
  clientController.addNewClient
)

clientRoute.put(
  '/update-client/:clientId',
  VALIDATE.UPDATE_CLIENT,
  clientController.updateClient
)

clientRoute.patch(
  '/suspend-client/:clientId',
  VALIDATE.SUSPEND_CLIENT,
  clientController.suspendClient
)

clientRoute.patch(
  '/update-client-url/:clientId',
  VALIDATE.ADD_CLIENT_URL,
  clientController.updateClientUrl
)

clientRoute.delete(
  '/remove-client-url/:clientId',
  VALIDATE.CLIENT_URL_REMOVAL,
  clientController.removeClientUrl
)

clientRoute.get(
  '/client-managers',
  clientController.accountManagers
)

clientRoute.patch(
  '/client/account-manager/:clientId',
  VALIDATE.ACCOUNT_MANAGER,
  clientController.addManager
)

module.exports = clientRoute