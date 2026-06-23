import { subscribeToTickets } from "../services/ticket-repository.js";
import { Session } from "../modules/session.js";
import { isTicketFinished } from "../modules/ticket-status.js";

export const initializeTechnicianDashboardPage = () => {
  if (document.body.dataset.page !== "technician-dashboard") {
    return;
  }

  const technicianEmail = Session.getEmail();

  // Funkcja przeliczająca kafelki statystyk na podstawie aktualnych danych.
  const renderStats = (tickets) => {
    const values = {
      new: tickets.filter((ticket) => ticket.status === "Nowe").length,
      assigned: tickets.filter(
        (ticket) =>
          ticket.assignedTo === technicianEmail &&
          !isTicketFinished(ticket.status),
      ).length,
      progress: tickets.filter((ticket) => ticket.status === "W trakcie")
        .length,
      resolved: tickets.filter((ticket) => ticket.status === "Zakończone")
        .length,
    };

    Object.entries(values).forEach(([name, value]) => {
      const element = document.querySelector(`[data-stat-value="${name}"]`);

      if (element) {
        element.textContent = value;
      }
    });
  };

  // Dane pobieramy NA ŻYWO z Firestore (wcześniej było to localStorage).
  // subscribeToTickets dla technika pobiera całą kolekcję "tickets",
  // a onSnapshot automatycznie odświeża liczby przy każdej zmianie w bazie.
  return subscribeToTickets((tickets) => {
    renderStats(tickets);
  });
};
