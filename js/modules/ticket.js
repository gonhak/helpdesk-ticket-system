import { getAccountName } from "./config.js";
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
    this.ownerEmail = ownerEmail;
    this.reporter = getAccountName(ownerEmail, reporter);
    this.assignedTo = assignedTo;
    this.description = description;
  }
}
