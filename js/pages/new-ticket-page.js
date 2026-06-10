import { Session } from "../modules/session.js";
import { Ticket } from "../modules/ticket.js";
import { TicketRepository } from "../services/ticket-repository.js";

export const initializeNewTicketPage = () => {
  const form = document.querySelector("#newTicketForm");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (Session.getRole() !== "user") {
      window.location.replace("technician-dashboard.html");
      return;
    }
    const tickets = TicketRepository.getAll();
    const id =
      Math.max(...tickets.map((ticket) => Number(ticket.id)), 1000) + 1;
    const description = document.querySelector("#description")?.value.trim();
    const ticket = new Ticket({
      id,
      title: document.querySelector("#ticketTitle")?.value.trim(),
      category: document.querySelector("#category")?.value,
      priority: document.querySelector("#priority")?.value,
      status: "Nowe",
      createdAt: "Przed chwilą",
      reporter: "Jan Kowalski",
      ownerEmail: Session.getEmail(),
      description,
    });
    TicketRepository.add(ticket);
    window.location.href = "my-tickets.html";
  });
};
