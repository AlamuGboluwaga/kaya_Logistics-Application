const { validationResult } = require("express-validator");
const { pool } = require("../config/server");
const response = require("../handlers/response");

class TruckTypeController {
  static async truckTypes(req, res, next) {
    try {
      const truckTypes = await pool.query(
        'SELECT * FROM tbl_kp_truck_types ORDER BY "truckType" ASC'
      );
      response.success(res, 200, "truck type log", truckTypes.rows);
    } catch (err) {
      response.error(res, 500, "internal server error", err.message);
    }
  }

  static async truckType(req, res, next) {
    try {
      response.success(res, 200, "truck type info", req.truckTypeInfo);
    } catch (err) {
      response.error(res, 500, "internal server error", err.message);
    }
  }

  static async addTruckType(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return response.error(res, 422, "validation failed", errors.mapped());
    }
    const { tonnage, truckType } = req.body;
    try {
      const newTruckType = await pool.query(
        'INSERT INTO tbl_kp_truck_types ("truckType", tonnage) VALUES ($1, $2) RETURNING *',
        [truckType, JSON.stringify(tonnage)]
      );
      response.success(res, 200, "truck type added", newTruckType.rows[0]);
    } catch (err) {
      response.error(res, 500, "internal server error", err.message);
    }
  }

  static async updateTruckType(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return response.error(res, 422, "validation failed", errors.mapped());
    }
    try {
      const truckTypeId = req.headers.trucktypeid;
      const { tonnage, truckType } = req.body;
      const updatedTruckType = await pool.query(
        "UPDATE tbl_kp_truck_types SET \"truckType\" = $1, tonnage = $2 WHERE id = $3 RETURNING *",
        [truckType, JSON.stringify(tonnage), truckTypeId]
      );
      response.success(
        res,
        200,
        "truck type updated",
        updatedTruckType.rows[0]
      );
    } catch (err) {
      response.error(res, 500, "internal server error", err.message);
    }
  }

  static async removeTruckType(req, res, next) { }
}

module.exports = TruckTypeController;
