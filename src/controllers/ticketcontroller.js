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

  static async removeTicket(req, res) {
    try {
      const id = req.params.id;
      const checkTicket = await pool.query(
        "SELECT * FROM tbl_kp_tickets WHERE id = $1",
        [id],
        (error, data) => {
          const ticketnotFound = !data.rows.length;
          if (ticketnotFound) {
            return res
              .status(404)
              .json({ Error: "Ticket does not Exist in the Database" });
          }
          pool.query(
            "DELETE FROM tbl_kp_tickets WHERE id =$1",
            [id],
            (error) => {
              if (error) {
                return res.status(403).json({ Error: "Ticket  not deleted" });
              }
              return res
                .status(200)
                .json({ Message: "Ticket has been successfully deleted " });
            }
          );
        }
      );
    } catch (error) {
      if (error) {
        throw Error(error);
      }
    }
  }


  static async updateTicket(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return response.error(res, 422, "validation failed", errors.mapped());
    }
    try {
      const ticketId = req.params.ticketId;
      const { categoryName, description } = req.body;
      const updatedTicket = await pool.query(
        'UPDATE tbl_kp_tickets SET "categoryName" = $1, "description" = $2  WHERE id = $3 RETURNING *',
        [categoryName, description, ticketId]
      );
      response.success(res, 200, "Ticket updated", updatedTicket.rows[0]);
    } catch (err) {
      response.error(res, 500, "internal server error", err.message);
    }
  }
}
module.exports = TicketController;
