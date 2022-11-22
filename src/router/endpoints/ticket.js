const express = require("express");
const middleware = require("../../middlewares/middleware");
const TicketController = require("../../controllers/ticketcontroller");
const VALIDATOR = require("../../middlewares/validators/ticket");

const ticketRouter = express.Router();

ticketRouter.post(
  "/new-ticket",
  // middleware.VERIFY_TOKEN,
  VALIDATOR.CHECK_TICKET,
  TicketController.addTicket
);

ticketRouter.get(
  "/tickets",
  // middleware.VERIFY_TOKEN,
  VALIDATOR.CHECK_TICKET,
  TicketController.allTickets
);

// ticketRouter.get("/ticket",middleware.VERIFY_TOKEN,TICKET_VALIDATOR.ticket,TicketController.ticket
// );

ticketRouter.put(
  "/update-ticket",
  // middleware.VERIFY_TOKEN,
  VALIDATOR.CHECK_TICKET,
  TicketController.updateTicket
);

module.exports = ticketRouter;
