import { Session } from "../modules/session.js";
import { getAccountName } from "../modules/config.js";
import { AutoResizeTextarea } from "../components/auto-resize-textarea.js";
import { TECHNICIAN_STATUS_OPTIONS, isTicketFinished } from "../modules/ticket-status.js";
import { getTicketViewStatus } from "../modules/ticket-view-status.js";
import { db } from "../firebase.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { addMessageToFirestore, subscribeToTicketMessages } from "../services/message-repository.js";

// Teraz ID to zwykły string, nie Number()
const getTicketIdFromUrl = () => {
  return new URLSearchParams(window.location.search).get("id");
};

const initials = (name) => {
  if (!name) return "";
  return name.trim().split(/\s+/).map((word) => word.charAt(0).toUpperCase()).join("").slice(0, 2);
};

const technicianName = (email) => {
  if (!email) return "Nieprzypisany";
  return getAccountName(email, email);
};

const renderMessages = (messages, currentEmail) => {
  if (!messages.length) {
    return '<p class="chat__empty">Brak wiadomości w tym zgłoszeniu.</p>';
  }

  return messages
    .map((message) => {
      const isOwnMessage = message.senderEmail === currentEmail;
      
      let formattedDate = "Przed chwilą";
      if (message.createdAt && message.createdAt.seconds) {
        formattedDate = new Date(message.createdAt.seconds * 1000).toLocaleDateString("pl-PL", {
          year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit"
        });
      }

      return `
        <article class="chat__message${isOwnMessage ? " chat__message--own" : ""}">
          <div class="chat__message__avatar">${initials(message.senderName)}</div>
          <div class="chat__message__content">
            <p class="chat__message__content__meta">
              <strong>${message.senderName}</strong> · ${formattedDate}
            </p>
            <div class="chat__message__content__bubble">
              ${message.content}
            </div>
          </div>
        </article>
      `;
    })
    .join("");
};

const renderStatusControl = (ticket, isTechnician, isAssignedToMe) => {
  if (!isTechnician) return "";

  if (ticket.status === "Zamknięte") {
    return `
      <div class="ticketAside__section ticketAside__section--statusControl">
        <p class="ticketAside__section__label">Status zgłoszenia</p>
        <p class="assignmentInfo">Zamkniętego zgłoszenia nie można już edytować.</p>
      </div>
    `;
  }

  if (!isAssignedToMe) {
    return `
      <div class="ticketAside__section ticketAside__section--statusControl">
        <p class="ticketAside__section__label">Ustaw status</p>
        <p class="assignmentInfo">Status może zmieniać technik przypisany do zgłoszenia.</p>
      </div>
    `;
  }

  const options = TECHNICIAN_STATUS_OPTIONS.map((status) => {
    const selected = ticket.status === status ? " selected" : "";
    return `<option value="${status}"${selected}>${status}</option>`;
  }).join("");

  return `
    <div class="ticketAside__section ticketAside__section--statusControl">
      <p class="ticketAside__section__label">Ustaw status</p>
      <div class="ticketStatusControl">
        <select class="ticketStatusControl__select" id="ticketStatusSelect" aria-label="Wybierz status zgłoszenia">
          ${options}
        </select>
        <button class="primaryButton ticketStatusControl__button" id="updateTicketStatusButton" type="button">
          Zapisz status
        </button>
      </div>
      <p class="ticketStatusControl__message" id="ticketStatusMessage" aria-live="polite"></p>
    </div>
  `;
};

const renderResolutionConfirmation = (ticket, isTechnician) => {
  if (isTechnician || ticket.status !== "Zakończone") return "";

  return `
    <div class="ticketAside__section ticketAside__section--resolution">
      <p class="ticketAside__section__label">Potwierdzenie rozwiązania</p>
      <p class="resolutionConfirmation__text">Czy uznajesz zgłoszenie za zakończone?</p>
      <div class="resolutionConfirmation">
        <button class="primaryButton resolutionConfirmation__button" id="acceptResolutionButton" type="button">Tak</button>
        <button class="secondaryButton resolutionConfirmation__button" id="rejectResolutionButton" type="button">Nie</button>
      </div>
      <p class="ticketStatusControl__message" id="resolutionConfirmationMessage" aria-live="polite"></p>
    </div>
  `;
};

export const initializeTicketDetailsPage = async () => {
  const isTechnician = Session.getRole() === "technician";
  const email = Session.getEmail();
  const tId = getTicketIdFromUrl();

  if (!tId) return;

  // Pobieramy dane ticketa z Firestore
  const ticketRef = doc(db, "tickets", tId);
  const ticketSnap = await getDoc(ticketRef);

  if (!ticketSnap.exists()) {
    console.error("Zgłoszenie nie istnieje w bazie!");
    return;
  }

  const ticket = { id: ticketSnap.id, ...ticketSnap.data() };

  if (Session.getRole() === "user" && ticket.status === "Zamknięte") {
    window.location.href = "my-tickets.html";
    return;
  }

  const container = document.querySelector("#ticketDetailsContainer") || (() => {
    const layout = document.querySelector(".ticketLayout");
    if (layout) {
      layout.outerHTML = '<div id="ticketDetailsContainer"></div>';
      return document.querySelector("#ticketDetailsContainer");
    }
    return null;
  })();

  if (!container) return;

  const isAssignedToMe = ticket.assignedTo === email;
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

  const statusControl = renderStatusControl(ticket, isTechnician, isAssignedToMe);
  const resolutionConfirmation = renderResolutionConfirmation(ticket, isTechnician);

  let formattedTicketDate = "Przed chwilą";
  if (ticket.createdAt && ticket.createdAt.seconds) {
    formattedTicketDate = new Date(ticket.createdAt.seconds * 1000).toLocaleDateString("pl-PL");
  }

  container.innerHTML = `
    <section class="ticketLayout">
      <div class="ticketLayout__main">
        <article class="ticketHeader">
          <div class="ticketHeader__upper">
            <div>
              <div class="ticketHeader__upper__meta">
                <strong>#${String(ticket.id).substring(0, 5).toUpperCase()}</strong>
                <span class="priorityBadge priorityBadge--${ticket.priority.toLowerCase()}">${ticket.priority}</span>
                <span class="statusBadge statusBadge--${displayStatus.toLowerCase().replace(" ", "-")}">${displayStatus}</span>
              </div>
              <h1 class="ticketHeader__upper__title">${ticket.title}</h1>
            </div>
            ${assignment}
          </div>
          <div class="ticketHeader__description">
            <p class="ticketHeader__description__title">Opis problemu</p>
            <p>${ticket.description}</p>
          </div>
        </article>
        <section class="chat">
          <div class="chat__header">
            <h3 class="chat__header__title">Historia komunikacji</h3>
            <span class="statusBadge statusBadge--${displayStatus.toLowerCase().replace(" ", "-")}">${displayStatus}</span>
          </div>
          <div class="chat__messages" id="chatMessages">
            <p class="chat__empty">Ładowanie wiadomości...</p>
          </div>
          ${reply}
        </section>
      </div>
      <aside class="ticketAside">
        <h2 class="ticketAside__title">Szczegóły zgłoszenia</h2>
        <div class="ticketAside__section">
          <p class="ticketAside__section__label">Zgłaszający</p>
          <p class="ticketAside__section__value"><strong>${ticket.reporter}</strong><br>${ticket.ownerEmail}</p>
        </div>
        <div class="ticketAside__section">
          <p class="ticketAside__section__label">Przypisany technik</p>
          <p class="ticketAside__section__value">${technicianName(ticket.assignedTo)}</p>
        </div>
        <div class="ticketAside__section">
          <div class="ticketAside__section__grid">
            <div><p class="ticketAside__section__label">Kategoria</p><p>${ticket.category}</p></div>
            <div><p class="ticketAside__section__label">Priorytet</p><p>${ticket.priority}</p></div>
            <div><p class="ticketAside__section__label">Utworzono</p><p>${formattedTicketDate}</p></div>
            <div><p class="ticketAside__section__label">Status</p><p id="ticketAsideStatus">${displayStatus}</p></div>
          </div>
        </div>
        ${statusControl}
        ${resolutionConfirmation}
      </aside>
    </section>
  `;

  // --- Subskrypcja Wiadomości z Firestore ---
  subscribeToTicketMessages(ticket.id, (messages) => {
    document.querySelector("#chatMessages").innerHTML = renderMessages(messages, email);
  });

  const replyTextarea = document.querySelector("#replyTextarea");
  if (replyTextarea) {
    const autoResizeTextarea = new AutoResizeTextarea(replyTextarea, { minHeight: 44, maxHeight: 160 });
    autoResizeTextarea.initialize();

    document.querySelector("#replyForm")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const content = replyTextarea.value.trim();
      if (!content) return;

      await addMessageToFirestore(ticket.id, email, Session.getName(), content);
      autoResizeTextarea.reset();
    });
  }

  // Akcje Technika i Użytkownika - Aktualizacje w Firestore
  document.querySelector("#assignTicketButton")?.addEventListener("click", async () => {
    await updateDoc(ticketRef, { assignedTo: email, status: "W trakcie" });
    window.location.reload();
  });

  document.querySelector("#updateTicketStatusButton")?.addEventListener("click", async () => {
    const selectedStatus = document.querySelector("#ticketStatusSelect")?.value;
    if (!selectedStatus) return;

    await updateDoc(ticketRef, { status: selectedStatus });
    
    if (selectedStatus === "Zakończone") {
      await addMessageToFirestore(ticket.id, email, Session.getName(), "Technik oznaczył zgłoszenie jako zakończone. Potwierdź, czy problem został rozwiązany.");
    }
    window.location.reload();
  });

  document.querySelector("#acceptResolutionButton")?.addEventListener("click", async () => {
    await updateDoc(ticketRef, { status: "Zamknięte" });
    window.location.href = "my-tickets.html";
  });

  document.querySelector("#rejectResolutionButton")?.addEventListener("click", async () => {
    await updateDoc(ticketRef, { status: "W trakcie" });
    await addMessageToFirestore(ticket.id, email, Session.getName(), "Użytkownik nie zaakceptował rozwiązania. Zgłoszenie wróciło do statusu „W trakcie”.");
    window.location.reload();
  });
};