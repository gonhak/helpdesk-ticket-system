import { Session } from "../modules/session.js";
import { TicketRepository } from "../services/ticket-repository.js";
import { isTicketFinished } from "../modules/ticket-status.js";

export const initializeTechnicianDashboardPage = () => {
  if (document.body.dataset.page !== "technician-dashboard") {
    return;
  }

  const tickets = TicketRepository.getAll();
  const technicianEmail = Session.getEmail();

  const values = {
    new: tickets.filter((ticket) => ticket.status === "Nowe").length,
    assigned: tickets.filter(
      (ticket) =>
        ticket.assignedTo === technicianEmail &&
        !isTicketFinished(ticket.status),
    ).length,
    progress: tickets.filter((ticket) => ticket.status === "W trakcie").length,
    resolved: tickets.filter((ticket) => ticket.status === "Zakończone").length,
  };

  Object.entries(values).forEach(([name, value]) => {
    const element = document.querySelector(`[data-stat-value="${name}"]`);

    if (element) {
      element.textContent = value;
    }
  });
};
