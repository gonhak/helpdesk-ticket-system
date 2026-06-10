import { ticketsData } from "../../data/tickets-data.js";
import { Ticket } from "../modules/ticket.js";
import { isValidTechnicianStatus } from "../modules/ticket-status.js";

export class TicketRepository {
  static storageKey = "helpDeskTicketsV15";

  static getDefaultTickets() {
    return ticketsData.map((ticket) => new Ticket(ticket));
  }

  static getAll() {
    const savedTickets = localStorage.getItem(this.storageKey);

    if (!savedTickets) {
      const tickets = this.getDefaultTickets();
      this.saveAll(tickets);
      return tickets;
    }

    return JSON.parse(savedTickets).map((ticket) => new Ticket(ticket));
  }

  static saveAll(tickets) {
    localStorage.setItem(this.storageKey, JSON.stringify(tickets));
  }

  static add(ticket) {
    const tickets = this.getAll();
    tickets.unshift(ticket);
    this.saveAll(tickets);
  }

  static getById(id) {
    return this.getAll().find((ticket) => Number(ticket.id) === Number(id));
  }

  static updateStatus(ticketId, status, technicianEmail) {
    if (!isValidTechnicianStatus(status)) return false;

    const tickets = this.getAll();
    const ticket = tickets.find((item) => Number(item.id) === Number(ticketId));

    if (
      !ticket ||
      ticket.assignedTo !== technicianEmail ||
      ticket.status === "Zamknięte"
    )
      return false;

    ticket.status = status;
    this.saveAll(tickets);
    return true;
  }

  static closeResolvedTicket(ticketId, ownerEmail) {
    const tickets = this.getAll();
    const ticket = tickets.find((item) => Number(item.id) === Number(ticketId));

    if (
      !ticket ||
      ticket.ownerEmail !== ownerEmail ||
      ticket.status !== "Zakończone"
    ) {
      return false;
    }

    ticket.status = "Zamknięte";
    this.saveAll(tickets);
    return true;
  }

  static rejectResolution(ticketId, ownerEmail) {
    const tickets = this.getAll();
    const ticket = tickets.find((item) => Number(item.id) === Number(ticketId));

    if (
      !ticket ||
      ticket.ownerEmail !== ownerEmail ||
      ticket.status !== "Zakończone"
    ) {
      return false;
    }

    ticket.status = "W trakcie";
    this.saveAll(tickets);
    return true;
  }

  static assignTo(ticketId, technicianEmail) {
    const tickets = this.getAll();
    const ticket = tickets.find((item) => Number(item.id) === Number(ticketId));

    if (!ticket || ticket.assignedTo) return false;

    ticket.assignedTo = technicianEmail;
    ticket.status = "W trakcie";
    this.saveAll(tickets);
    return true;
  }
}
