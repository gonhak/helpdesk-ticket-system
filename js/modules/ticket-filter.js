import { Session } from "./session.js";
import { getTicketViewStatus } from "./ticket-view-status.js";

export class TicketFilter {
  constructor(tickets = []) {
    this.tickets = tickets;
    this.criteria = { phrase: "", status: "", category: "", priority: "" };
  }

  setTickets(tickets) {
    this.tickets = tickets;
  }

  update(name, value) {
    this.criteria[name] = value === "all" ? "" : value;
  }

  reset() {
    this.criteria = { phrase: "", status: "", category: "", priority: "" };
  }

  getResults() {
    const phrase = this.criteria.phrase.trim().toLowerCase();
    return this.tickets.filter((ticket) => {
      const displayStatus = getTicketViewStatus(ticket, Session.getEmail());
      const searchableText = [
        ticket.id,
        ticket.title,
        ticket.reporter,
        ticket.category,
        ticket.priority,
        displayStatus,
      ]
        .join(" ")
        .toLowerCase();
      const matchesPhrase = searchableText.includes(phrase);
      const matchesStatus =
        !this.criteria.status || displayStatus === this.criteria.status;
      const matchesCategory =
        !this.criteria.category || ticket.category === this.criteria.category;
      const matchesPriority =
        !this.criteria.priority || ticket.priority === this.criteria.priority;
      return (
        matchesPhrase && matchesStatus && matchesCategory && matchesPriority
      );
    });
  }
}
