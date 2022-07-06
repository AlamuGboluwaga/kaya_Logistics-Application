const { pool } = require("../../config/server");
const response = require("../../handlers/response");
const { validationResult } = require("express-validator");
const { cloudinary, multipleFileUpload } = require("../../handlers/helpers");
const mailer = require("../../handlers/mailer");
const mails = require("../../handlers/mails");

const uploads = multipleFileUpload("waybill");

class orderController {
  static async orders(req, res) {
    const userType = req.userType;
    const perPage = +req.query.perPage || 10;
    const currentPage = +req.query.currentPage || 1;
    const offsetValue = (currentPage - 1) * perPage;
    try {
      let query;
      if (userType === "admin") {
        query = await orderQuery("", "", offsetValue, perPage);
      } else {
        query = await orderQuery(
          'WHERE "ownedBy" = $1',
          req.userId,
          offsetValue,
          perPage
        );
      }
      return response.success(res, 200, "orders log", {
        results: query.rows,
        total: query.rowCount,
        currentPage,
        perPage,
      });
    } catch (err) {
      response.error(res, 500, "internal server error", err.message);
    }
  }

  static async createTripFromAvailability(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return response.error(res, 422, "validation error", errors.mapped());
    }
    const {
      id,
      client,
      loadingSite,
      truckNo,
      truckType,
      tonnage,
      driver,
      product,
      destination,
      locations,
      ownedBy,
    } = req.truckAvailabilityInfo;

    try {
      const orderId = await lastTripId();
      const tripType = product != "container" ? "fcmg" : "port";
      const gatedInAt = new Date();
      const newOrder = await pool.query(
        'INSERT INTO tbl_kp_orders ( availability, "gatedInAt", "orderId", "ownedBy", client, "loadingSite", "truckNo", "truckType", tonnage, driver, product, destination, locations, "tripType") VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *',
        [
          id,
          gatedInAt,
          orderId,
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
          tripType,
        ]
      );
      await pool.query(
        'UPDATE tbl_kp_truck_availabilities SET "gatedIn" = $1, "gatedInAt" = $2, "gatedInBy" = $3, "availabilityStatus" = $4 WHERE id = $5',
        ["yes", gatedInAt, req.userId, "no", id]
      );
      response.success(res, 200, "new order created", newOrder.rows[0]);
    } catch (err) {
      return response.error(res, 500, "internal server error", err.message);
    }
  }

  static async newOrder(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return response.error(res, 422, "validation error", errors.mapped());
    }
    const {
      client,
      loadingSite,
      truckNo,
      truckType,
      tonnage,
      driver,
      product,
      destination,
      locations,
      ownedBy,
    } = req.body;
    const orderId = await lastTripId();
    const tripType = product != "container" ? "fcmg" : "port";
    const gatedInAt = new Date();

    try {
      const newOrder = await pool.query(
        'INSERT INTO tbl_kp_orders ("gatedInAt", "orderId", "ownedBy", client, "loadingSite", "truckNo", "truckType", tonnage, driver, product, destination, locations, "tripType") VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *',
        [
          gatedInAt,
          orderId,
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
          tripType,
        ]
      );
      response.success(res, 201, "new order created", newOrder.rows[0]);
    } catch (err) {
      return response.error(res, 500, "internal server error", err.message);
    }
  }

  static async getSelectedTrip(req, res) {
    try {
      response.success(res, 200, "order info", req.orderInfo);
    } catch (err) {
      response.error(res, 500, "internal server error", err.message);
    }
  }

  static async updateOrder(req, res) {
    const orderId = req.headers.orderid;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return response.error(res, 422, "validation error", errors.mapped());
    }
    const {
      loadingStarted,
      loadingEnded,
      customerName,
      customerPhoneNo,
      customerAddress,
      loadedWeight,
    } = req.body;
    try {
      const updateOrderReq = await pool.query(
        'UPDATE tbl_kp_orders SET "loadingStarted" = $1, "loadingEnded" = $2, "customerName" = $3,  "customerPhoneNo" = $4, "customerAddress" = $5, "loadedWeight" = $6, tracker = $7, "updatedAt" = $8 WHERE id = $9 RETURNING *',
        [
          loadingStarted,
          loadingEnded,
          customerName,
          customerPhoneNo,
          customerAddress,
          loadedWeight,
          2,
          new Date(),
          orderId,
        ]
      );
      response.success(
        res,
        201,
        "order updated successfully",
        updateOrderReq.rows[0]
      );
    } catch (err) {
      response.error(res, 500, "internal server error", err);
    }
  }

  static async uploadWaybills(req, res) {
    const { orderId, id } = req.order;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return response.error(res, 422, "validation failed", errors.mapped());
    }
    const waybills = JSON.parse(req.body.waybillInfo);
    const selectedWaybills = req.files;
    try {
      if (!selectedWaybills) {
        return response.error(
          res,
          422,
          "validation failed",
          "no waybill is selected"
        );
      }
      let waybillDetails = [];
      const existingWaybill = await pool.query(
        'SELECT * FROM tbl_kp_order_waybill WHERE "orderId" = $1',
        [id]
      );
      if (existingWaybill.rowCount > 0) {
        await Promise.all(
          waybills.map(async (waybill, index) => {
            const attachment = await uploadWaybills(
              selectedWaybills[index].path,
              `kaya-pay/waybills/${orderId}`
            );
            waybillDetails.push(...existingWaybill.rows[0].waybill, {
              salesOrderNo: waybill.salesOrderNo,
              invoiceNo: waybill.invoiceNo,
              attachment: attachment.secure_url,
            });
          })
        );
        const updateExistingWaybill = await pool.query(
          "UPDATE tbl_kp_order_waybill SET waybill = $1 WHERE id = $2  RETURNING *",
          [JSON.stringify(waybillDetails), existingWaybill.rows[0].id]
        );
        return response.success(
          res,
          200,
          "waybill added successfully",
          updateExistingWaybill.rows[0]
        );
      } else {
        await Promise.all(
          waybills.map(async (waybill, index) => {
            const attachment = await uploadWaybills(
              selectedWaybills[index].path,
              `kaya-pay/waybills/${orderId}`
            );
            waybillDetails.push({
              salesOrderNo: waybill.salesOrderNo,
              invoiceNo: waybill.invoiceNo,
              attachment: attachment.secure_url,
            });
          })
        );
        const addedWaybills = await pool.query(
          'INSERT INTO tbl_kp_order_waybill ("orderId", waybill) VALUES ($1, $2) RETURNING *',
          [req.order.id, JSON.stringify(waybillDetails)]
        );
        response.success(
          res,
          200,
          "waybill successfully uploaded",
          addedWaybills.rows[0]
        );
      }
    } catch (err) {
      response.error(res, 500, "internal server error", err.message);
    }
  }

  static async requestWaybillVerification(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return response.error(res, 422, "validation failed", errors.mapped());
    }
    const { waybill, email, firstName, lastName, id } = req.waybillInfo;
    try {
      const updateVerificationRequest = await pool.query(
        'UPDATE tbl_kp_order_waybill SET "verificationStatus" = $1, "verificationRequestedBy" = $2, "verificationRequestedAt" = $3 WHERE id = $4 RETURNING *',
        ["1", req.userId, new Date(), id]
      );
      response.success(
        res,
        200,
        "verification request sent successfully",
        updateVerificationRequest.rows[0]
      );
      const test = await mailer.notification(
        email,
        "Waybill Verification Request",
        mails.waybillVerificationContent(waybill, {
          firstName,
          lastName,
        })
      );
    } catch (err) {
      response.error(res, 500, "internal server error", err.message);
    }
  }

  static async awaitingGateOut(req, res) {
    const userType = req.userType;
    try {
      let awaitingGateOut;
      if (userType === "admin") {
        awaitingGateOut = await tripsInPipeline("", "");
      } else {
        awaitingGateOut = await tripsInPipeline('"ownedBy" = $1', req.userId);
      }
      return response.success(
        res,
        200,
        "trips awaiting gate out",
        awaitingGateOut.rows
      );
    } catch (err) {
      return response.error(res, 500, "internal server error", err.message);
    }
  }

  static async addTripRate(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return response.error(res, 422, "validation failed", errors.mapped());
    }
    const { incentives, gtv, ago, isFinanced, payout } = req.body;
    const orderId = req.headers.orderid;
    let advancePayable,
      balancePayable,
      rate,
      totalIncentives,
      query,
      kayaPayOut = 0,
      kayaPayAdvance = 0,
      kayaPayBalance = 0,
      queryResp;
    totalIncentives = incentives.reduce((acc, curr) => {
      return (acc += curr.amount);
    }, 0);
    rate = gtv + totalIncentives + ago;
    if (isFinanced) {
      kayaPayOut = (rate - ((+process.env.INTEREST_RATE / 100) * rate)).toFixed(
        2
      );
      kayaPayAdvance = ((+process.env.ADVANCE_RATE / 100) * rate).toFixed(
        2
      );
      const deduction = (+process.env.INTEREST_RATE / 100) * rate;
      kayaPayBalance = (((+process.env.BALANCE_RATE / 100) * rate) - deduction).toFixed(
        2
      );
    }

    advancePayable = (
      (+process.env.ADVANCE_RATE / 100) *
      payout
    ).toFixed(2);
    balancePayable = (
      (+process.env.BALANCE_RATE / 100) *
      payout
    ).toFixed(2);
    try {
      const checkTripQuery =
        'SELECT * FROM tbl_kp_order_payments WHERE "orderId" = $1';
      const availableTripResult = await pool.query(checkTripQuery, [orderId]);
      if (availableTripResult.rowCount > 0) {
        query =
          'UPDATE tbl_kp_order_payments SET "clientRate" = $1, "transporterRate" = $2, incentive = $3, ago = $4, advance = $5, balance = $6, "isFinanced" = $7, "kayaPayOut" = $8, "kayaPayAdvance" = $9, "kayaPayBalance" = $10 WHERE id = $11 RETURNING *';
        queryResp = await pool.query(query, [
          gtv,
          payout,
          JSON.stringify(incentives),
          ago,
          advancePayable,
          balancePayable,
          isFinanced,
          kayaPayOut,
          kayaPayAdvance,
          kayaPayBalance,
          availableTripResult.rows[0].id,
        ]);
      } else {
        query =
          'INSERT INTO tbl_kp_order_payments ("orderId", "clientRate", "transporterRate", "incentive", "ago", "advance", "balance", "isFinanced", "kayaPayOut", "kayaPayAdvance", "kayaPayBalance") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *';
        queryResp = await pool.query(query, [
          orderId,
          gtv,
          payout,
          JSON.stringify(incentives),
          ago,
          advancePayable,
          balancePayable,
          isFinanced,
          kayaPayOut,
          kayaPayAdvance,
          kayaPayBalance,
        ]);
      }
      response.success(res, 200, "rate uploaded", queryResp.rows[0]);
    } catch (err) {
      response.error(res, 500, "internal server error", err.message);
    }
  }
}

const uploadWaybills = async (waybill, path) => {
  const waybillUpload = await cloudinary.uploader.upload(waybill, {
    folder: path,
  });
  return waybillUpload;
};

const preceedingZeros = (num, places) => String(num).padStart(places, "0");

const lastTripId = async () => {
  const result = await pool.query(
    'SELECT "orderId" FROM tbl_kp_orders ORDER BY "orderId" DESC'
  );
  if (result.rowCount <= 0) {
    return `kaid${preceedingZeros(1, 4)}`;
  }
  const lastOrderId = result.rows[0].orderId.split("kaid");
  return `kaid${preceedingZeros(Number(lastOrderId[1]) + 1, 4)}`;
};

const orderQuery = async (clause, clauseValue, offsetVal, perPage) => {
  return await pool.query(
    `SELECT a.*, concat(b."firstName", ' ', b."lastName") AS transporter, c."clientAlias", d."truckType",  CONCAT(e."firstName", ' ', e."lastName") AS driver, e."phoneNo" AS "driverPhoneNo", f.id AS "waybillId", f.waybill, f."invoiceStatus", f."invoiceDate", f."verificationStatus", f."approvalStatus", g."clientRate", g."transporterRate", g."incentive", g.advance, g.balance, g."advanceRequestedAt", g."advancePaidAt", g."balanceRequestedBy", g."balanceRequestedAt", g."balancePaidAt", g.ago, g."isFinanced", g."kayaPayOut", g."kayaPayAdvance", g."kayaPayBalance" FROM tbl_kp_orders a JOIN users b ON a."ownedBy" = b.id JOIN tbl_kp_clients c ON a.client = c.id JOIN tbl_kp_truck_types d ON a."truckType" = d.id JOIN tbl_kp_drivers e ON a.driver = e.id LEFT JOIN tbl_kp_order_waybill f ON a.id = f."orderId" LEFT JOIN tbl_kp_order_payments g ON a.id = g."orderId" AND "tripStatus" = TRUE ${clause} ORDER BY a."orderId" DESC OFFSET ${offsetVal} LIMIT ${perPage}`,
    [clauseValue]
  );
};

const tripsInPipeline = async (clause, clauseValue) => {
  return await pool.query(
    `SELECT a.*,  b."firstName", b."lastName", c."companyName", d."firstName" AS dfname, d."lastName" AS dlname, d."phoneNo" as dphoneno, e."truckType" FROM tbl_kp_orders a JOIN users b ON a."ownedBy" = b.id  JOIN tbl_kp_clients c ON a.client = c.id JOIN tbl_kp_drivers d ON a.driver = d.id JOIN tbl_kp_truck_types e ON a."truckType" = e.id WHERE ${clause} AND tracker < 2 AND a."tripStatus" = TRUE ORDER by a."orderId" desc`,
    [clauseValue]
  );
};

module.exports = {
  orderController,
  uploads,
};
