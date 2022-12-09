const express = require("express");
const ticketRouter = express.Router();
const middleware = require("../../middlewares/middleware");
const TicketController = require("../../controllers/ticketcontroller");
const CHECK_TICKET = require("../../middlewares/validators/ticket");

ticketRouter.post(
  "/new-ticket",
  // middleware.VERIFY_TOKEN,
  CHECK_TICKET,
  TicketController.addTicket
);

ticketRouter.get(
  "/tickets",
  // middleware.VERIFY_TOKEN,

  TicketController.allTickets
);

ticketRouter.get(
  "/ticket/:id",
  // middleware.VERIFY_TOKEN,
  TicketController.getTicketById
);

ticketRouter.put(
  "/update-ticket/:id",
  // middleware.VERIFY_TOKEN,
  CHECK_TICKET,
  TicketController.updateTicket
);
ticketRouter.delete("/delete-ticket/:id", TicketController.removeTicket);

// ticketRouter.delete("deleteAll",TicketController.deleteAll)

module.exports = ticketRouter;
