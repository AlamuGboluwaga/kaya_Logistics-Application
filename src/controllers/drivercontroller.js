const {
  validationResult
} = require("express-validator");
const {
  pool
} = require("../config/server");
const response = require("../handlers/response");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  secure: true,
});

const diskStorage = multer.diskStorage({
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },

  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({
  storage: diskStorage,
}).single("licence");

class driverController {
  static async drivers(req, res) {
    try {
      const drivers = await pool.query(
        'SELECT * FROM tbl_kp_drivers ORDER BY "firstName" ASC'
      );
      response.success(res, 200, "drivers", drivers.rows);
    } catch (err) {
      response.error(res, 500, "internal server error", err.message);
    }
  }

  static async driver(req, res) {
    try {
      response.success(res, 200, "driver info", req.driverInfo);
    } catch (err) {
      response.error(res, 500, "internal server error", err.message);
    }
  }

  static async addDriver(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return response.error(res, 422, "validation failed", errors.mapped());
    }
    const {
      firstName,
      lastName,
      licenceNo,
      phoneNo,
      licenceUrl,
      expiryDate
    } = req.body;
    try {
      const newDriver = await pool.query(
        'INSERT INTO tbl_kp_drivers ("firstName", "lastName", "phoneNo", "licenceNo", "licenceUrl", "expiryDate") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [firstName, lastName, JSON.stringify(phoneNo), licenceNo, licenceUrl, expiryDate]
      );
      response.success(res, 200, "driver info added", newDriver.rows[0]);
    } catch (err) {
      response.error(res, 500, "internal server error", err.message);
    }
  }

  static async updateDriver(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return response.error(res, 422, "validation failed", errors.mapped());
    }
    try {
      const driverId = req.headers.driverid;
      const {
        firstName,
        lastName,
        licenceNo,
        phoneNo,
        licenceUrl,
        expiryDate
      } = req.body;
      const updatedDriver = await pool.query(
        'UPDATE tbl_kp_drivers SET "firstName" = $1, "lastName" = $2, "phoneNo" = $3, "licenceNo" = $4, "licenceUrl" = $5, "expiryDate" = $6  WHERE id = $7 RETURNING *',
        [firstName, lastName, JSON.stringify(phoneNo), licenceNo, licenceUrl, expiryDate, driverId]
      );
      response.success(res, 200, "truck type updated", updatedDriver.rows[0]);
    } catch (err) {
      response.error(res, 500, "internal server error", err.message);
    }
  }

  static async uploadLicence(req, res) {
    try {
      const file = req.file.path;
      if (!file) {
        return response.error(res, 400, "bad request", "no upload found");
      }
      const upload = await cloudinary.uploader.upload(file, {
        folder: "kaya-pay/drivers-licence",
      });
      return response.success(res, 200, "upload successful", upload);
    } catch (err) {
      response.error(res, 500, "internal server error", err.message);
    }
  }

  static async removeDriver(req, res) { }
}

module.exports = {
  driverController,
  upload,
};