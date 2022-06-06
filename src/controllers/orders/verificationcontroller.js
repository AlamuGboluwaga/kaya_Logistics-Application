const { validationResult } = require("express-validator");
const { pool } = require("../../config/server");
const response = require("../../handlers/response");
const mailer = require("../../handlers/mailer");
const mails = require("../../handlers/mails");
require("dotenv").config();

class VerificationController {
  static async verifiedTrips(req, res) {
    const clientId = req.headers.clientid;
    const perPage = +req.query.perPage || 10;
    const currentPage = +req.query.currentPage || 1;
    const offsetValue = (currentPage - 1) * perPage;
    try {
      const allVerifiedTrips = await tripVerification(
        "TRUE",
        clientId,
        offsetValue,
        perPage
      );
      return response.success(
        res,
        200,
        "all verified trips",
        allVerifiedTrips.rows
      );
    } catch (err) {
      response.error(res, 500, "internal server error", err.message);
    }
  }

  static async pendingVerification(req, res) {
    const clientId = req.headers.clientid;
    console.log(clientId);
    const perPage = +req.query.perPage || 10;
    const currentPage = +req.query.currentPage || 1;
    const offsetValue = (currentPage - 1) * perPage;
    try {
      const allVerifiedTrips = await tripVerification(
        "FALSE",
        clientId,
        offsetValue,
        perPage
      );
      return response.success(
        res,
        200,
        "pending verification",
        allVerifiedTrips.rows
      );
    } catch (err) {
      response.error(res, 500, "internal server error", err.message);
    }
  }

  static async verifyTrip(req, res) {
    try {
      const {
        orderId,
        tripId,
        client,
        verifiedBy,
        verifiedById,
        waybill,
        transporter,
        waybillId,
        transporterEmail,
        clientRate,
      } = req.body;

      const updateApprovalReq = await pool.query(
        'UPDATE tbl_kp_order_waybill SET "approvalStatus" = $1, "verifiedBy" = $2, "verifiedAt" = $3 WHERE id = $4 RETURNING *',
        ["TRUE", verifiedById, new Date().toISOString(), waybillId]
      );
      const financeEmail = process.env.KAYA_PAY_FINANCE_EMAIL;
      await mailer.notification(
        financeEmail,
        `${tripId} - Order Confirmation`,
        mails.kayaAdminWaybillConfirmation(
          waybill,
          clientRate,
          new Date().toISOString(),
          client,
          verifiedBy
        )
      );
      await mailer.notification(
        transporterEmail,
        "Order Confirmed",
        mails.transporterVerificationApproval(transporter, orderId)
      );
      return response.success(
        res, 200, 'verification approved', updateApprovalReq.rows[0]
      )
    } catch (err) {
      return response.error(res, 500, "internal server error", err.message);
    }
  }
}

const tripVerification = async (clause, id, offsetVal, perPage) => {
  const query = `
    SELECT a.*, concat(b."firstName", ' ', b."lastName") AS transporter, b.email AS "transporterEmail", d."truckType",  CONCAT(e."firstName", ' ', e."lastName") AS driver, e."phoneNo" AS "driverPhoneNo", f.id AS "waybillId", f.waybill, f."verificationStatus", f."verificationRequestedAt", f."approvalStatus", f."verifiedAt", g."clientRate", g."incentive", g."balanceRequestedBy", g."balanceRequestedAt", g.ago FROM tbl_kp_orders a JOIN users b ON a."ownedBy" = b.id JOIN tbl_kp_truck_types d ON a."truckType" = d.id JOIN tbl_kp_drivers e ON a.driver = e.id LEFT JOIN tbl_kp_order_waybill f ON a.id = f."orderId" LEFT JOIN tbl_kp_order_payments g ON a.id = g."orderId" AND "tripStatus" = TRUE WHERE a.client = $1 AND f."approvalStatus" = ${clause} ORDER BY a."orderId" DESC OFFSET ${offsetVal} LIMIT ${perPage}
  `;
  const queryResult = await pool.query(query, [id]);
  return queryResult;
};

module.exports = VerificationController;
