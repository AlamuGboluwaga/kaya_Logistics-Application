const { validationResult } = require("express-validator");
const { pool } = require("../config/server");
const response = require("../handlers/response");
const states = require("../middlewares/validators/exactlocation");

class LocationController {
  static async regionalStates(req, res, next) {
    return response.success(
      res,
      200,
      "regional states log",
      states.REGIONAL_STATES
    );
  }

  static async allLocations(req, res, next) {
    try {
      const exactLocations = await pool.query(
        "SELECT * FROM tbl_kp_exact_locations ORDER BY state ASC"
      );
      response.success(res, 200, "exact locations", exactLocations.rows);
    } catch (err) {
      response.error(res, 500, "internal server error", err.message);
    }
  }

  static async getLocationByState(req, res, next) {
    try {
      response.success(
        res, 200, 'location per state', req.assignedStateLocations
      )
    }
    catch (err) {
      response.error(
        res, 500, 'internal server error', err.message
      )
    }
  }

  static async addLocations(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return response.error(res, 422, "validation error", errors.mapped());
    }
    const { state, exactLocations } = req.body;
    try {
      const checkStateQuery = await pool.query(
        "SELECT * FROM tbl_kp_exact_locations WHERE state = $1",
        [state]
      );
      let queryResponse;
      if (checkStateQuery.rowCount > 0) {
        const id = checkStateQuery.rows[0].id;
        const existingLocations = checkStateQuery.rows[0].exactLocations;
        const updatedLocations = existingLocations.concat(
          exactLocations.filter((location) => {
            return existingLocations.indexOf(location) < 0;
          })
        );
        const updateLocationQuery =
          'UPDATE tbl_kp_exact_locations SET state = $1, "exactLocations" = $2 WHERE id = $3 RETURNING *';
        queryResponse = await pool.query(updateLocationQuery, [
          state,
          JSON.stringify(updatedLocations),
          id,
        ]);
      } else {
        const insertLocationQuery =
          'INSERT INTO tbl_kp_exact_locations (state, "exactLocations") VALUES ($1, $2) RETURNING *';
        queryResponse = await pool.query(insertLocationQuery, [
          state,
          JSON.stringify(exactLocations),
        ]);
      }

      response.success(res, 200, "location inserted", queryResponse.rows[0]);
    } catch (err) {
      response.error(res, 500, "internal server error", err.message);
    }
  }

  static async removeLocations(req, res, next) {
    try {
      const locationId = req.headers.locationid;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return response.error(res, 422, "validation error", errors.mapped());
      }
      const { location } = req.body;
      const existingLocations = req.locationInfo.exactLocations;
      const updatedLocations = existingLocations.filter(
        (loc) => loc.toLowerCase() !== location
      );

      const updatedLocationQuery = await pool.query(
        'UPDATE tbl_kp_exact_locations SET "exactLocations" = $1 WHERE id = $2 RETURNING *', [
        JSON.stringify(updatedLocations), locationId
      ]
      );
      response.success(
        res, 200, 'exact location removed', updatedLocationQuery.rows[0]
      )
    } catch (err) {
      response.error(res, 500, "internal server error", err.message);
    }
  }
}

module.exports = LocationController;
