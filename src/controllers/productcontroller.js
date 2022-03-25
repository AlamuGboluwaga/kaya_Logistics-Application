require("dotenv").config();
const { pool } = require("../config/server");
const { validationResult } = require("express-validator");
const response = require("../handlers/response");

class ProductController {
  static async clientProducts(req, res, next) {
    const clientId = req.headers.clientid;
    console.log(clientId);
    try {
      const clientProductsQuery =
        "SELECT products FROM tbl_kp_clients WHERE id = $1";
      const clientProducts = await pool.query(clientProductsQuery, [clientId]);
      response.success(res, 200, "client products", clientProducts.rows[0]);
    } catch (err) {
      response.error(res, 500, "internal server error", err.message);
    }
  }

  static async addProduct(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return response.error(res, 422, "validation failed", errors.mapped());
    }
    const clientId = req.headers.clientid;
    const productName = req.body.productName;
    try {
      const getClientInfo = await pool.query(
        "SELECT * FROM tbl_kp_clients WHERE id = $1",
        [clientId]
      );
      let products;
      if (!getClientInfo.rows[0].products) {
        products = [
          {
            productName: productName,
          },
        ];
      } else {
        const existingProducts = getClientInfo.rows[0].products;
        const prodIndex = existingProducts.findIndex(
          (prod) => prod.productName === productName
        );
        if (prodIndex >= 0) {
          products = [...existingProducts];
        } else {
          products = [...existingProducts, { productName: productName }];
        }
      }

      const updateClientProductQuery = `UPDATE tbl_kp_clients SET products = $1 WHERE id = $2 RETURNING *`;
      const updatedProduct = await pool.query(updateClientProductQuery, [
        JSON.stringify(products),
        clientId,
      ]);
      return response.success(
        res,
        200,
        "products updated",
        updatedProduct.rows[0]
      );
    } catch (err) {
      response.error(res, 500, "internal server error", err.message);
    }
  }

  static async removeClientProduct(req, res, next) {
    try {
      const clientId = req.headers.clientid;
      console.log(clientId);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return response.error(res, 422, "validation error", errors.mapped());
      }
      const product = req.body.productName;
      const checkProducts = await pool.query(
        "SELECT products FROM tbl_kp_clients WHERE id = $1",
        [clientId]
      );
      let results = checkProducts.rows[0].products;

      const products = results.filter((prod) => prod.productName !== product);

      const updateProductsQuery = await pool.query(
        "UPDATE tbl_kp_clients SET products = $1 WHERE id = $2 RETURNING id, products",
        [JSON.stringify(products), clientId]
      );
      response.success(
        res,
        200,
        "product removed successfully",
        updateProductsQuery.rows[0]
      );
    } catch (err) {
      response.error(res, 500, "internal server error", err.message);
    }
  }
}

module.exports = ProductController;
