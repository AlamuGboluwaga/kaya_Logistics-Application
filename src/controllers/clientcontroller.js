const { pool } = require("../config/server");
require("dotenv").config();
const { validationResult } = require("express-validator");
const response = require("../handlers/response");

class ClientController {
  static async accountManagers(req, res, next) {
    try {
      const accountManagerQuery =
        'SELECT "id", "firstName", "lastName", "email" FROM users WHERE "id" NOT IN (SELECT "managedBy" FROM tbl_kp_clients WHERE "managedBy" <> NULL) AND "userType" = $1';
      const accountManagerResult = await pool.query(accountManagerQuery, [
        "partner",
      ]);
      return response.success(
        res,
        200,
        "account managers",
        accountManagerResult.rows
      );
    } catch (err) {
      response.error(res, 500, "internal server error", err.message);
    }
  }

  static async allClients(req, res, next) {
    try {
      const clientsQuery = await pool.query(
        'SELECT a.*, b."firstName", b."lastName", b."email" FROM tbl_kp_clients a LEFT JOIN users b ON a."managedBy" = b.id ORDER BY "companyName" ASC'
      );
      response.success(res, 200, "all clients", clientsQuery.rows);
    } catch (err) {
      response.error(res, 500, "internal server error", err.message);
    }
  }

  static async client(req, res, next) {
    try {
      const clientId = req.params.clientId;
      const checkExists = await pool.query(
        "SELECT id FROM tbl_kp_clients WHERE id = $1",
        [clientId]
      );
      if (checkExists.rowCount <= 0) {
        return response.error(res, 404, "record not found", null);
      }
      const clientInfo = await pool.query(
        "SELECT * FROM tbl_kp_clients WHERE id = $1",
        [clientId]
      );
      response.success(res, 500, "internal server error", clientInfo.rows[0]);
    } catch (err) {
      response.error(res, 500, "internal server error", err.message);
    }
  }

  static async addNewClient(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return response.error(res, 422, "validation failed", errors.mapped());
    }
    try {
      const { companyName, personOfContact, address, payInto, clientAlias } =
        req.body;

      const addClientQuery =
        'INSERT INTO tbl_kp_clients ("companyName", "personOfContact", address, "payInto", "clientAlias") VALUES ($1, $2, $3, $4, $5) RETURNING *';
      const clientRequest = await pool.query(addClientQuery, [
        companyName,
        personOfContact,
        address,
        payInto,
        clientAlias,
      ]);
      response.success(res, 200, "client added", clientRequest.rows[0]);
    } catch (err) {
      response.error(res, 500, "internal server error", err.message);
    }
  }

  static async updateClient(req, res, next) {
    const errors = validationResult(req);
    const clientId = req.params.clientId;
    if (!errors.isEmpty()) {
      return response.error(res, 422, "validation failed", errors.mapped());
    }
    try {
      const checkRecordValidity = await pool.query(
        "SELECT id from tbl_kp_clients WHERE id = $1",
        [clientId]
      );
      if (checkRecordValidity.rowCount <= 0) {
        return response.error(res, 404, "record not found", null);
      }
      const { companyName, personOfContact, address, payInto, clientAlias } =
        req.body;

      const updateClientQuery =
        'UPDATE tbl_kp_clients SET "companyName" = $1, "personOfContact" = $2, address = $3, "payInto" = $4, "clientAlias" = $5 WHERE id = $6 RETURNING *';
      const updatedClientRequest = await pool.query(updateClientQuery, [
        companyName,
        personOfContact,
        address,
        payInto,
        clientAlias,
        clientId,
      ]);
      response.success(res, 200, "client added", updatedClientRequest.rows[0]);
    } catch (err) {
      response.error(res, 500, "internal server error", err.message);
    }
  }

  static async suspendClient(req, res, next) {
    const clientId = req.params.clientId;
    try {
      const patchClientQuery =
        'UPDATE tbl_kp_clients SET "clientStatus" = $1 RETURNING id, "companyName", "clientStatus"';
      const clientSuspension = await pool.query(patchClientQuery, [0]);
      response.success(
        res,
        200,
        "suspension activated",
        clientSuspension.rows[0]
      );
    } catch (err) {
      response.error(res, 500, "internal server error", err.message);
    }
  }

  static async updateClientUrl(req, res, next) {
    const clientId = req.params.clientId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return response.error(res, 422, "validation error", errors.mapped());
    }
    try {
      const { url } = req.body;
      const clientUrlQuery =
        'UPDATE tbl_kp_clients SET url = $1 WHERE id = $2 RETURNING id, "companyName", url ';
      const requestClientUrl = await pool.query(clientUrlQuery, [
        url,
        clientId,
      ]);
      response.success(
        res,
        200,
        "client domain updated",
        requestClientUrl.rows[0]
      );
    } catch (err) {
      response.error(res, 500, "internal server error", err.message);
    }
  }

  static async addManager(req, res, next) {
    const clientId = req.params.clientId
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return response.error(
        res, 422, 'validation error', errors.mapped()
      )
    }
    try {
      const { accountManagerId } = req.body
      const checkUserQuery = await pool.query(
        'SELECT * FROM tbl_kp_clients WHERE "managedBy" = $1', [accountManagerId])
      if (checkUserQuery.rowCount >= 1) {
        return response.error(
          res, 409, 'conflict', { msg: 'only one account allowed.' }
        )
      }
      const clientManagerQuery = 'UPDATE tbl_kp_clients SET "managedBy" = $1 WHERE id = $2 RETURNING *'
      const clientManager = await pool.query(clientManagerQuery, [
        accountManagerId, clientId
      ])
      return response.success(
        res, 200, 'account manager updated', clientManager.rows[0]
      )
    }
    catch (err) {
      response.error(
        res, 500, 'internal server error', err.message
      )
    }
  }

  static async removeClientUrl(req, res, next) { }

  static async uploadClientLogo() { }
}

module.exports = ClientController;
