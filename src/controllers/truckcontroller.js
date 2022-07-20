const {
  pool
} = require("../config/server");
const {
  validationResult
} = require("express-validator");
const response = require("../handlers/response");
require("dotenv");

class TruckController {
  static async allTrucks(req, res) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return response.error(
        res, 422, 'validation failed', errors.mapped()
      )
    }
    const { userType, id } = req.userInfo;
    try {
      if (userType === "admin") {
        const trucks = await pool.query(
          'SELECT DISTINCT "truckNo", COUNT("truckNo") AS "noOfTrips" FROM tbl_kp_orders WHERE "tripStatus" = TRUE GROUP BY "truckNo" ORDER BY "truckNo" ASC'
        );
        return response.success(res, 200, "trucks info", trucks.rows);
      }
      const transporterTrucks = await pool.query(
        'SELECT DISTINCT "truckNo", COUNT("truckNo") AS "noOfTrips" FROM tbl_kp_orders WHERE "ownedBy" = $1 AND "tripStatus" = TRUE GROUP BY "truckNo" ORDER BY "truckNo" ASC',
        [id]
      );
      response.success(
        res,
        200,
        "transporter truck listings",
        transporterTrucks.rows
      );
    } catch (err) {
      response.error(res, 500, "internal server error", err.message);
    }
  }

  static async addTruck(req, res) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return response.error(
        res, 422, 'validation failed', errors.mapped()
      )
    }
    const { truckNo, truckType, tonnage } = req.body
    try {
      const truckDetails = await newTruck(truckNo, truckType, tonnage)
      return response.success(
        res, 201, 'new truck added', truckDetails.rows[0]
      )
    }
    catch (err) {
      return response.error(
        res, 500, 'internal server error', err.message
      )
    }
  }

  static async truck(req, res) {
    try {
      response.success(
        res, 200, 'truck info', req.truckInfo.pop()
      )
    }
    catch (err) {
      return response.error(
        res, 500, 'internal server error', err.message
      )
    }
  }

  static async updateTruck(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return response.error(
        res, 422, 'validation failed', errors.mapped()
      )
    }
    const truckId = req.headers.truck
    const { truckNo, tonnage, truckType } = req.body
    try {
      const updateTruck = await pool.query('UPDATE tbl_kp_trucks SET "truckNo" = $1, tonnage = $2, "truckType" = $3 WHERE id = $4 RETURNING *', [truckNo, tonnage, truckType, truckId])
      response.success(
        res, 200, 'truck info updated', updateTruck.rows.pop()
      )
    }
    catch (err) {
      response.error(
        res, 500, 'internal server error', err.message
      )
    }
  }
}


const newTruck = async (truckNo, truckType, tonnage) => {
  const checkTruckNo = await pool.query('SELECT * FROM tbl_kp_trucks WHERE "truckNo" = $1', [truckNo]);
  if (checkTruckNo.rowCount > 0) {
    return checkTruckNo.rows.pop()
  }
  return await pool.query('INSERT INTO tbl_kp_trucks ("truckNo", "truckType", "tonnage") VALUES ($1, $2, $3) RETURNING *', [
    truckNo, truckType, tonnage
  ])
}

module.exports = { TruckController, newTruck };