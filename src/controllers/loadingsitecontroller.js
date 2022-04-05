require("dotenv").config();
const { pool } = require("../config/server");
const { validationResult } = require("express-validator");
const response = require("../handlers/response");

class LoadingSiteController {
  static async clientLoadingSites(req, res, next) {
    const clientId = req.headers.clientid;
    try {
      const clientLoadingSiteQuery =
        'SELECT "loadingSites" FROM tbl_kp_clients WHERE id = $1';
      const clientloadingsites = await pool.query(clientLoadingSiteQuery, [
        clientId,
      ]);
      response.success(
        res,
        200,
        "client loading sites",
        clientloadingsites.rows[0]
      );
    } catch (err) {
      response.error(res, 500, "internal server error", err.message);
    }
  }

  static async addLoadingSites(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return response.error(res, 422, "validation failed", errors.mapped());
    }
    const clientId = req.headers.clientid;
    const { loadingSite, dailyCapacity, location } = req.body;
    try {
      const getLoadingSitesInfo = await pool.query(
        "SELECT * FROM tbl_kp_clients WHERE id = $1",
        [clientId]
      );
      let loadingSites;
      if (!getLoadingSitesInfo.rows[0].loadingSites) {
        loadingSites = [
          {
            name: loadingSite,
            dailyCapacity,
            location,
          },
        ];
      } else {
        const existingLoadingSites = getLoadingSitesInfo.rows[0].loadingSites;
        const prodIndex = existingLoadingSites.findIndex(
          (ls) => ls.name === loadingSite
        );
        loadingSites =
          prodIndex >= 0
            ? [...existingLoadingSites]
            : [
              ...existingLoadingSites,
              { name: loadingSite, dailyCapacity, location },
            ];
      }

      const updateClientLoadingSiteQuery = `UPDATE tbl_kp_clients SET "loadingSites" = $1 WHERE id = $2 RETURNING *`;
      const updatedLoadingSite = await pool.query(
        updateClientLoadingSiteQuery,
        [JSON.stringify(loadingSites), clientId]
      );
      return response.success(
        res,
        200,
        "loading site updated",
        updatedLoadingSite.rows[0]
      );
    } catch (err) {
      response.error(res, 500, "internal server error", err.message);
    }
  }

  static async removeLoadingSites(req, res, next) {
    try {
      const clientId = req.headers.clientid;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return response.error(res, 422, "validation error", errors.mapped());
      }
      const loadingSite = req.body.loadingSite;
      const checkLoadingSite = await pool.query(
        'SELECT "loadingSites" FROM tbl_kp_clients WHERE id = $1',
        [clientId]
      );
      let results = checkLoadingSite.rows[0].loadingSites;
      const loadingSites = results.filter(
        (ls) => ls.name !== loadingSite
      );

      const updateloadingSitesQuery = await pool.query(
        'UPDATE tbl_kp_clients SET "loadingSites" = $1 WHERE id = $2 RETURNING id, "loadingSites"',
        [JSON.stringify(loadingSites), clientId]
      );
      response.success(
        res,
        200,
        "loading site removed successfully",
        updateloadingSitesQuery.rows[0]
      );
    } catch (err) {
      response.error(res, 500, "internal server error", err.message);
    }
  }
}

module.exports = LoadingSiteController;
