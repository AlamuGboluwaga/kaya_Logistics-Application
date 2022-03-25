const express = require('express')
const middleware = require('../../middlewares/middleware')
const ProductController = require('../../controllers/productcontroller')
const VALIDATOR = require('../../middlewares/validators/clientproduct')

const productRouter = express.Router()


productRouter.get(
  '/client-products',
  middleware.VERIFY_TOKEN,
  ProductController.clientProducts
)

productRouter.patch(
  '/add-client-product',
  middleware.VERIFY_TOKEN,
  VALIDATOR.CHECK_PRODUCT,
  ProductController.addProduct
)

productRouter.delete(
  '/remove-client-product',
  middleware.VERIFY_TOKEN,
  VALIDATOR.CHECK_PRODUCT,
  ProductController.removeClientProduct
)

module.exports = productRouter