const { pool } = require("../../config/server");
const { validationResult } = require("express-validator");
const response = require("../../handlers/response");

class TruckAvailability {
  static async truckAvailabilities(req, res) {
    const userType = req.userType;
    try {
      let query;
      if (userType === "admin") {
        query = await pool.query(
          'SELECT a.*,  b."firstName", b."lastName", c."companyName", d."firstName" AS dfname, d."lastName" AS dlname, d."phoneNo" as dphoneno, e."truckType"  FROM tbl_kp_truck_availabilities a JOIN users b ON a."ownedBy" = b.id  JOIN tbl_kp_clients c ON a.client = c.id JOIN tbl_kp_drivers d ON a.driver = d.id JOIN tbl_kp_truck_types e ON a."truckType" = e.id WHERE a."gatedIn" = FALSE AND "gatedInAt" IS NULL ORDER BY a."createdAt" ASC'
        );
      } else {
        query = await pool.query(
          'SELECT a.*,  b."firstName", b."lastName", c."companyName", d."firstName" AS dfname, d."lastName" AS dlname, d."phoneNo" as dphoneno, e."truckType"  FROM tbl_kp_truck_availabilities a JOIN users b ON a."ownedBy" = b.id  JOIN tbl_kp_clients c ON a.client = c.id JOIN tbl_kp_drivers d ON a.driver = d.id JOIN tbl_kp_truck_types e ON a."truckType" = e.id WHERE "ownedBy" = $1 AND a."gatedIn" = FALSE AND a."gatedInAt" IS NULL ORDER BY "createdAt" ASC',
          [req.userId]
        );
      }
      return response.success(res, 200, "truck availability log", query.rows);
    } catch (err) {
      response.error(res, 500, "internal server error", err.message);
    }
  }

  static async truckAvailabilityInfo(req, res) {
    try {
      response.success(
        res,
        200,
        "truck availability info",
        req.truckAvailabilityInfo
      );
    } catch (err) {
      response.error(res, 500, "internal server error", err.message);
    }
  }

  static async addAvailability(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return response.error(res, 422, "validation failed", errors.mapped());
    }
    const {
      ownedBy,
      client,
      loadingSite,
      truckNo,
      truckType,
      tonnage,
      driver,
      product,
      destination,
      locations,
      status,
    } = req.body;
    try {
      const newAvailability = await pool.query(
        'INSERT INTO tbl_kp_truck_availabilities("ownedBy", client, "loadingSite", "truckNo", "truckType", tonnage, driver, product, destination, locations, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
        [
          ownedBy,
          client,
          loadingSite,
          truckNo,
          truckType,
          tonnage,
          driver,
          product,
          destination,
          JSON.stringify(locations),
          JSON.stringify(status),
        ]
      );
      response.success(
        res,
        200,
        "truck availability added",
        newAvailability.rows[0]
      );
    } catch (err) {
      response.error(res, 500, "internal server error", err);
    }
  }

  static async updateTruckAvailabilityStatus(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return response.error(res, 422, "validation error", errors.mapped());
    }
    const truckAvailabilityId = req.headers.truckavailabilityid;
    const truckAvailabilityInfo = req.truckAvailabilityInfo;
    const status = req.body.status;
    const updatedStatus = [status, ...truckAvailabilityInfo.status];
    try {
      const updateAvailabilityRecord = await pool.query(
        "UPDATE tbl_kp_truck_availabilities SET status = $1 WHERE id = $2 RETURNING *",
        [JSON.stringify(updatedStatus), truckAvailabilityId]
      );
      response.success(
        res,
        200,
        "availability status updated",
        updateAvailabilityRecord.rows[0]
      );
    } catch (err) {
      response.error(res, 500, "internal server error", err.message);
    }
  }
}

module.exports = TruckAvailability;
