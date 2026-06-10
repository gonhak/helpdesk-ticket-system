import { normalizeTicketStatus } from "./ticket-status.js";

export class Ticket {
  constructor({
    id,
    title,
    category,
    priority,
    status,
    createdAt,
    reporter,
    ownerEmail,
    assignedTo = null,
    description = "",
  }) {
    this.id = id;
    this.title = title;
    this.category = category;
    this.priority = priority;
    this.status = normalizeTicketStatus(status);
    this.createdAt = createdAt;
    this.reporter = reporter;
    this.ownerEmail = ownerEmail;
    this.assignedTo = assignedTo;
    this.description = description;
  }
}
