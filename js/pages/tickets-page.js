import { Session } from "../modules/session.js";
import { TicketRepository } from "../services/ticket-repository.js";
import { TicketTable } from "../components/ticket-table.js";
import { TicketFilterControls } from "../components/ticket-filter-controls.js";
import { isTicketFinished } from "../modules/ticket-status.js";

export const initializeTicketsPage = () => {
  const body = document.querySelector("#ticketsTableBody");
  if (!body) return;
  const page = document.body.dataset.page;
  const email = Session.getEmail();
  let tickets = TicketRepository.getAll();
  if (Session.getRole() === "user") {
    tickets = tickets.filter(
      (ticket) => ticket.ownerEmail === email && ticket.status !== "Zamknięte",
    );
  }
  if (page === "technician-assigned") {
    tickets = tickets.filter(
      (ticket) =>
        ticket.assignedTo === email && !isTicketFinished(ticket.status),
    );
  }
  const table = new TicketTable(body, tickets, {
    pageSize: 3,
    showPagination: page !== "technician-all",
    showAll: page === "technician-all",
    paginationContainer: document.querySelector("#pagination"),
    paginationSummary: document.querySelector("#paginationSummary"),
  });
  table.render();

  const filterControls = new TicketFilterControls(table);
  filterControls.initialize();
};
