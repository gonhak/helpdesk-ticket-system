import { Session } from "../modules/session.js";
import { TicketFilter } from "../modules/ticket-filter.js";
import { MessageRepository } from "../services/message-repository.js";
import { TICKET_STATUSES } from "../modules/ticket-status.js";
import { getTicketViewStatus } from "../modules/ticket-view-status.js";

export class TicketTable {
  constructor(container, tickets, options = {}) {
    this.container = container;
    this.filterEngine = new TicketFilter(tickets);
    this.filteredTickets = tickets;
    this.pageSize = options.pageSize || 3;
    this.currentPage = 1;
    this.paginationContainer = options.paginationContainer;
    this.paginationSummary = options.paginationSummary;
    this.showPagination = options.showPagination !== false;
    this.showAll = options.showAll === true;
  }

  static getPriorityClass(priority) {
    return (
      { Niski: "low", Średni: "medium", Wysoki: "high" }[priority] || "low"
    );
  }
  static getStatusClass(status) {
    if (!TICKET_STATUSES.includes(status)) return "unknown";
    return {
      Nowe: "new",
      "W trakcie": "progress",
      "Oczekuje na odpowiedź": "waiting",
      Zakończone: "resolved",
      Zamknięte: "closed",
    }[status];
  }

  getUnreadIndicator(ticket) {
    const unreadCount = MessageRepository.getUnreadCount(
      ticket.id,
      Session.getEmail(),
    );

    if (!unreadCount) {
      return "";
    }

    return `<span class="ticketAction__notification" title="${unreadCount} nieprzeczytanych wiadomości" aria-label="${unreadCount} nieprzeczytanych wiadomości">!</span>`;
  }

  getAction(ticket) {
    const role = Session.getRole();
    const email = Session.getEmail();
    const notification = this.getUnreadIndicator(ticket);
    const displayStatus = getTicketViewStatus(ticket, email);

    if (role === "user") {
      return `<div class="ticketAction"><a class="secondaryButton ticketAction__button" href="user-ticket-details.html?id=${ticket.id}">${notification}Zobacz</a></div>`;
    }

    if (!ticket.assignedTo) {
      return `<div class="ticketAction"><a class="primaryButton ticketAction__button" href="technician-ticket-details.html?id=${ticket.id}">${notification}Zobacz</a></div>`;
    }

    const mine = ticket.assignedTo === email;

    return `<div class="ticketAction"><span class="ticketAction__assigned${mine ? " ticketAction__assigned--mine" : ""}">${mine ? "Przypisane do Ciebie" : "Już przypisane"}</span><a class="ticketAction__details ticketAction__button" href="technician-ticket-details.html?id=${ticket.id}" aria-label="Zobacz szczegóły zgłoszenia">${notification}<svg class="icon icon--search" aria-hidden="true" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path></svg></a></div>`;
  }

  getPageTickets() {
    if (this.showAll) return this.filteredTickets;
    if (!this.showPagination)
      return this.filteredTickets.slice(0, this.pageSize);
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredTickets.slice(start, start + this.pageSize);
  }

  renderRows() {
    if (!this.container) return;
    const tickets = this.getPageTickets();
    if (!tickets.length) {
      this.container.innerHTML = `<tr><td class="emptyTableMessage" colspan="7">Brak zgłoszeń spełniających wybrane filtry.</td></tr>`;
      return;
    }
    this.container.innerHTML = tickets
      .map((ticket) => {
        const displayStatus = getTicketViewStatus(ticket, Session.getEmail());

        return `<tr data-ticket-id="${ticket.id}"><td><strong>#${ticket.id}</strong></td><td class="ticketsTable__title">${ticket.title}<p class="ticketsTable__title__reporter">Zgłaszający: ${ticket.reporter}</p></td><td>${ticket.category}</td><td><span class="priorityBadge priorityBadge--${TicketTable.getPriorityClass(ticket.priority)}">${ticket.priority}</span></td><td><span class="statusBadge statusBadge--${TicketTable.getStatusClass(displayStatus)}">${displayStatus}</span></td><td>${ticket.createdAt}</td><td>${this.getAction(ticket)}</td></tr>`;
      })
      .join("");
  }

  renderPagination() {
    if (!this.showPagination || !this.paginationContainer) return;
    const count = Math.max(
      1,
      Math.ceil(this.filteredTickets.length / this.pageSize),
    );
    if (this.currentPage > count) this.currentPage = count;
    this.paginationContainer.innerHTML = Array.from(
      { length: count },
      (_, index) =>
        `<button class="pagination__button${index + 1 === this.currentPage ? " pagination__button--active" : ""}" data-page-number="${index + 1}" type="button">${index + 1}</button>`,
    ).join("");
    this.paginationContainer
      .querySelectorAll("[data-page-number]")
      .forEach((button) =>
        button.addEventListener("click", () => {
          this.currentPage = Number(button.dataset.pageNumber);
          this.render();
        }),
      );
  }

  renderSummary() {
    if (!this.paginationSummary) return;
    const total = this.filteredTickets.length;
    if (!total) {
      this.paginationSummary.textContent = "Brak zgłoszeń";
      return;
    }
    if (this.showAll) {
      this.paginationSummary.textContent = `Wyświetlanie wszystkich ${total} zgłoszeń`;
      return;
    }
    const first = (this.currentPage - 1) * this.pageSize + 1;
    const last = Math.min(first + this.pageSize - 1, total);
    this.paginationSummary.textContent = `Wyświetlanie ${first} do ${last} z ${total} zgłoszeń`;
  }

  applyFilter(name, value) {
    this.filterEngine.update(name, value);
    this.filteredTickets = this.filterEngine.getResults();
    this.currentPage = 1;
    this.render();
  }

  resetFilters() {
    this.filterEngine.reset();
    this.filteredTickets = this.filterEngine.getResults();
    this.currentPage = 1;
    this.render();
  }

  render() {
    this.renderRows();
    this.renderPagination();
    this.renderSummary();
  }
}
