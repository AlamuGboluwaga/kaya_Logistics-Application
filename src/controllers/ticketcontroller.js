const { pool } = require("../config/server");
const { validationResult } = require("express-validator");
const response = require("../handlers/response");
require("dotenv").config();
const TICKET_VALIDATOR = require("../middlewares/validators/ticket");
const errors = require("../middlewares/validators/ticket");

class TicketController {
  static async allTickets(req, res) {
    try {
      const userType = "admin";
      if (userType === "admin") {
        const tickets = await pool.query("SELECT * FROM tbl_kp_tickets");
        return response.success(res, 200, "ticket info", tickets.rows);
      }
    } catch (err) {
      response.error(res, 500, "internal server error", err.message);
    }
  }
  static async getTicketById(req, res) {
    try {
      // const userType = "admin";
      // if (userType === "admin") {
        // const ticketId = req.headers.ticketid;
        const id = req.params.id;
        const ticket = await pool.query(
          "SELECT * FROM tbl_kp_tickets WHERE id = $1",
          [id]
        );
        return response.success(res, 200, "ticket info", ticket.rows);
      // }
    } catch (err) {
      response.error(res, 500, "internal server error", err.message);
    }
  }

  static async addTicket(req, res) {
    // const validate = TICKET_VALIDATOR.validate(req.body, errors);

    try {
      const { categoryName, description } = req.body;
      console.log(1);
      const newTicket = await pool.query(
        'INSERT INTO tbl_kp_tickets ("categoryName","description") VALUES ($1,$2) RETURNING *',
        [categoryName, description]
      );

      response.success(res, 200, "Ticket added", newTicket.rows[0]);
    } catch (err) {
      console.log(err);
      response.error(res, 500, "internal server error", err.message);
    }
  }
  static async updateTicket(req, res) {
    const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   return response.error(res, 422, "validation failed", errors.mapped());
    // }
    try {
      const ticketId = req.headers.ticketid;
      const { categoryName, description } = req.body;
      const updatedTicket = await pool.query(
        'UPDATE tbl_kp_tickets SET "categoryName" = $1, "description " = $2, WHERE id = $3 RETURNING *',
        [categoryName, description, ticketId]
      );
      response.success(res, 200, "ticket updated", updateTicket.rows[0]);
    } catch (err) {
      response.error(res, 500, "internal server error", err.message);
    }
  }
  static async removeTicket(req, res) {
    try {
      const ticketId = req.headers.ticketid;
      console.log(ticketId);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return response.error(res, 422, "validation error", errors.mapped());
      }
      const { categoryName, description } = req.body;
      const checkTicket = await pool.query(
        "SELECT tickets FROM  tbl_kp_tickets WHERE id = $1",
        [ticketId]
      );
      let results = checkTicket.rows[0].tickets;

      const tickets = results.filter(
        (tick) => tick.categoryName !== categoryName
      );

      const updateTicketsQuery = await pool.query(
        "UPDATE tbl_kp_tickets SET  tickets = $1 WHERE id = $2 RETURNING id,  tickets",
        [JSON.stringify(tickets), ticketId]
      );
      response.success(
        res,
        200,
        "ticket removed successfully",
        updateTicketsQuery.rows[0]
      );
    } catch (err) {
      response.error(res, 500, "internal server error", err.message);
    }
  }
}

module.exports = TicketController;
