import { Session } from "../modules/session.js";
import { TicketRepository } from "../services/ticket-repository.js";
import { MessageRepository } from "../services/message-repository.js";
import { TicketTable } from "../components/ticket-table.js";
import { AutoResizeTextarea } from "../components/auto-resize-textarea.js";
import {
  TECHNICIAN_STATUS_OPTIONS,
  isTicketFinished,
} from "../modules/ticket-status.js";
import { getTicketViewStatus } from "../modules/ticket-view-status.js";

const ticketId = () =>
  Number(new URLSearchParams(window.location.search).get("id"));
const initials = (name) =>
  name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2);
const technicianName = (email) =>
  email === "b@b.b" ? "Jan Kowalski" : email ? "Inny technik" : "Nieprzypisany";

const renderMessages = (ticket, currentEmail) => {
  const messages = MessageRepository.getByTicketId(ticket.id);

  if (!messages.length) {
    return '<p class="chat__empty">Brak wiadomości w tym zgłoszeniu.</p>';
  }

  return messages
    .map((message) => {
      const isOwnMessage = message.authorEmail === currentEmail;

      return `<article class="chat__message${isOwnMessage ? " chat__message--own" : ""}"><div class="chat__message__avatar">${initials(message.authorName)}</div><div class="chat__message__content"><p class="chat__message__content__meta"><strong>${message.authorName}</strong> · ${message.createdAt}</p><div class="chat__message__content__bubble">${message.content}</div></div></article>`;
    })
    .join("");
};

const renderStatusControl = (ticket, isTechnician, isAssignedToMe) => {
  if (!isTechnician) return "";

  if (ticket.status === "Zamknięte") {
    return `<div class="ticketAside__section ticketAside__section--statusControl"><p class="ticketAside__section__label">Status zgłoszenia</p><p class="assignmentInfo">Zamkniętego zgłoszenia nie można już edytować.</p></div>`;
  }

  if (!isAssignedToMe) {
    return `<div class="ticketAside__section ticketAside__section--statusControl"><p class="ticketAside__section__label">Ustaw status</p><p class="assignmentInfo">Status może zmieniać technik przypisany do zgłoszenia.</p></div>`;
  }

  const options = TECHNICIAN_STATUS_OPTIONS.map(
    (status) =>
      `<option value="${status}"${ticket.status === status ? " selected" : ""}>${status}</option>`,
  ).join("");

  return `<div class="ticketAside__section ticketAside__section--statusControl"><p class="ticketAside__section__label">Ustaw status</p><div class="ticketStatusControl"><select class="ticketStatusControl__select" id="ticketStatusSelect" aria-label="Wybierz status zgłoszenia">${options}</select><button class="primaryButton ticketStatusControl__button" id="updateTicketStatusButton" type="button">Zapisz status</button></div><p class="ticketStatusControl__message" id="ticketStatusMessage" aria-live="polite"></p></div>`;
};

const renderResolutionConfirmation = (ticket, isTechnician) => {
  if (isTechnician || ticket.status !== "Zakończone") return "";

  return `<div class="ticketAside__section ticketAside__section--resolution"><p class="ticketAside__section__label">Potwierdzenie rozwiązania</p><p class="resolutionConfirmation__text">Czy uznajesz zgłoszenie za zakończone?</p><div class="resolutionConfirmation"><button class="primaryButton resolutionConfirmation__button" id="acceptResolutionButton" type="button">Tak</button><button class="secondaryButton resolutionConfirmation__button" id="rejectResolutionButton" type="button">Nie</button></div><p class="ticketStatusControl__message" id="resolutionConfirmationMessage" aria-live="polite"></p></div>`;
};

export const initializeTicketDetailsPage = () => {
  const dynamicContainer = document.querySelector("#ticketDetailsContainer");
  const isTechnician = Session.getRole() === "technician";
  const ticket = TicketRepository.getById(ticketId());

  if (!ticket) return;

  if (Session.getRole() === "user" && ticket.status === "Zamknięte") {
    window.location.href = "my-tickets.html";
    return;
  }

  if (!dynamicContainer) {
    const layout = document.querySelector(".ticketLayout");
    if (layout) layout.outerHTML = '<div id="ticketDetailsContainer"></div>';
  }

  const container = document.querySelector("#ticketDetailsContainer");
  if (!container) return;

  const email = Session.getEmail();
  const isAssignedToMe = ticket.assignedTo === email;

  // Użytkownik odczytuje wiadomości we własnym zgłoszeniu. Technik odczytuje je
  // dopiero po przypisaniu zgłoszenia do siebie. Sam podgląd nieprzypisanego
  // zgłoszenia nie usuwa powiadomienia.
  if (!isTechnician || isAssignedToMe) {
    MessageRepository.markTicketAsRead(ticket.id, email);
  }

  const displayStatus = getTicketViewStatus(ticket, email);
  const canAssign = isTechnician && !ticket.assignedTo;
  const canReply = !isTechnician || isAssignedToMe;
  const assignment = canAssign
    ? `<button class="primaryButton" id="assignTicketButton" type="button"><svg class="icon" aria-hidden="true"><use href="../assets/icons.svg#user"></use></svg>Przypisz do mnie</button>`
    : isTechnician
      ? `<span class="assignmentInfo">${isAssignedToMe ? "Zgłoszenie przypisane do Ciebie" : "Zgłoszenie jest już przypisane do innego technika"}</span>`
      : "";
  const reply = canReply
    ? `<form class="chat__reply" id="replyForm"><textarea class="chat__reply__textarea" id="replyTextarea" rows="1" placeholder="Napisz odpowiedź..."></textarea><button class="primaryButton" type="submit"><svg class="icon" aria-hidden="true"><use href="../assets/icons.svg#send"></use></svg>Wyślij odpowiedź</button></form>`
    : `<div class="chat__reply"><span class="assignmentInfo">Odpowiedzi może dodawać technik przypisany do zgłoszenia.</span></div>`;
  const statusControl = renderStatusControl(
    ticket,
    isTechnician,
    isAssignedToMe,
  );
  const resolutionConfirmation = renderResolutionConfirmation(
    ticket,
    isTechnician,
  );

  container.innerHTML = `<section class="ticketLayout"><div class="ticketLayout__main"><article class="ticketHeader"><div class="ticketHeader__upper"><div><div class="ticketHeader__upper__meta"><strong>#${ticket.id}</strong><span class="priorityBadge priorityBadge--${TicketTable.getPriorityClass(ticket.priority)}">${ticket.priority}</span><span class="statusBadge statusBadge--${TicketTable.getStatusClass(displayStatus)}">${displayStatus}</span></div><h1 class="ticketHeader__upper__title">${ticket.title}</h1></div>${assignment}</div><div class="ticketHeader__description"><p class="ticketHeader__description__title">Opis problemu</p><p>${ticket.description}</p></div></article><section class="chat"><div class="chat__header"><h3 class="chat__header__title">Historia komunikacji</h3><span class="statusBadge statusBadge--${TicketTable.getStatusClass(displayStatus)}">${displayStatus}</span></div><div class="chat__messages" id="chatMessages">${renderMessages(ticket, email)}</div>${reply}</section></div><aside class="ticketAside"><h2 class="ticketAside__title">Szczegóły zgłoszenia</h2><div class="ticketAside__section"><p class="ticketAside__section__label">Zgłaszający</p><p class="ticketAside__section__value"><strong>${ticket.reporter}</strong><br>${ticket.ownerEmail}</p></div><div class="ticketAside__section"><p class="ticketAside__section__label">Przypisany technik</p><p class="ticketAside__section__value">${technicianName(ticket.assignedTo)}</p></div><div class="ticketAside__section"><div class="ticketAside__section__grid"><div><p class="ticketAside__section__label">Kategoria</p><p>${ticket.category}</p></div><div><p class="ticketAside__section__label">Priorytet</p><p>${ticket.priority}</p></div><div><p class="ticketAside__section__label">Utworzono</p><p>${ticket.createdAt}</p></div><div><p class="ticketAside__section__label">Status</p><p id="ticketAsideStatus">${displayStatus}</p></div></div></div>${statusControl}${resolutionConfirmation}</aside></section>`;

  const replyTextarea = document.querySelector("#replyTextarea");
  const autoResizeTextarea = new AutoResizeTextarea(replyTextarea, {
    minHeight: 44,
    maxHeight: 160,
  });
  autoResizeTextarea.initialize();

  document
    .querySelector("#assignTicketButton")
    ?.addEventListener("click", () => {
      if (TicketRepository.assignTo(ticket.id, email)) window.location.reload();
    });

  document
    .querySelector("#updateTicketStatusButton")
    ?.addEventListener("click", () => {
      const statusSelect = document.querySelector("#ticketStatusSelect");
      const statusMessage = document.querySelector("#ticketStatusMessage");
      const selectedStatus = statusSelect?.value;

      if (
        !selectedStatus ||
        !TicketRepository.updateStatus(ticket.id, selectedStatus, email)
      ) {
        if (statusMessage)
          statusMessage.textContent = "Nie udało się zmienić statusu.";
        return;
      }

      if (selectedStatus === "Zakończone") {
        MessageRepository.add({
          ticketId: ticket.id,
          authorEmail: email,
          authorName: "Jan Kowalski",
          authorRole: "technician",
          content:
            "Technik oznaczył zgłoszenie jako zakończone. Potwierdź, czy problem został rozwiązany.",
        });
      }

      if (statusMessage) statusMessage.textContent = "Status został zapisany.";

      window.setTimeout(() => {
        if (isTicketFinished(selectedStatus)) {
          window.location.href = "technician-all-tickets.html";
          return;
        }

        window.location.reload();
      }, 350);
    });

  document
    .querySelector("#acceptResolutionButton")
    ?.addEventListener("click", () => {
      const message = document.querySelector("#resolutionConfirmationMessage");

      if (!TicketRepository.closeResolvedTicket(ticket.id, email)) {
        if (message)
          message.textContent = "Nie udało się zakończyć zgłoszenia.";
        return;
      }

      window.location.href = "my-tickets.html";
    });

  document
    .querySelector("#rejectResolutionButton")
    ?.addEventListener("click", () => {
      const message = document.querySelector("#resolutionConfirmationMessage");

      if (!TicketRepository.rejectResolution(ticket.id, email)) {
        if (message) message.textContent = "Nie udało się wznowić zgłoszenia.";
        return;
      }

      MessageRepository.add({
        ticketId: ticket.id,
        authorEmail: email,
        authorName: ticket.reporter,
        authorRole: "user",
        content:
          "Użytkownik nie zaakceptował rozwiązania. Zgłoszenie wróciło do statusu „W trakcie”.",
      });

      window.location.reload();
    });

  document.querySelector("#replyForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const content = replyTextarea.value.trim();
    if (!content) return;

    MessageRepository.add({
      ticketId: ticket.id,
      authorEmail: email,
      authorName: isTechnician ? "Jan Kowalski" : ticket.reporter,
      authorRole: Session.getRole(),
      content,
    });

    autoResizeTextarea.reset();
    document.querySelector("#chatMessages").innerHTML = renderMessages(
      ticket,
      email,
    );
  });
};
