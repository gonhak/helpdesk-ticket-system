import { subscribeToTickets } from "../services/ticket-repository.js";
import { Session } from "../modules/session.js";

export const initializeTicketsPage = () => {
  const tableBody = document.querySelector("#ticketsTableBody");
  if (!tableBody) return;

  // Z którą stroną mamy do czynienia? (ustawione w atrybucie data-page w HTML)
  // "my-tickets" | "technician-all" | "technician-assigned"
  const page = document.body.dataset.page;
  const isTechnician = Session.getRole() === "technician";
  const myEmail = Session.getEmail();

  // Technik otwiera szczegóły w swoim panelu, użytkownik w swoim.
  const detailsPage = isTechnician
    ? "technician-ticket-details.html"
    : "user-ticket-details.html";

  // Renderowanie stanu ładowania danych
  tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center;">Ładowanie zgłoszeń z bazy danych...</td></tr>`;

  // Subskrypcja strumienia danych z Firestore (onSnapshot)
  const unsubscribe = subscribeToTickets((tickets) => {
    tableBody.innerHTML = ""; // Czyszczenie tabeli przed ponownym renderowaniem

    // Wybór zgłoszeń zależnie od strony i roli zalogowanej osoby:
    let visibleTickets;
    if (page === "technician-all") {
      visibleTickets = tickets; // panel technika: wszystkie zgłoszenia
    } else if (page === "technician-assigned") {
      visibleTickets = tickets.filter((ticket) => ticket.assignedTo === myEmail); // przypisane do mnie
    } else {
      visibleTickets = tickets.filter((ticket) => ticket.ownerEmail === myEmail); // użytkownik: moje zgłoszenia
    }

    if (visibleTickets.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center;">Brak zgłoszeń spełniających wybrane filtry.</td></tr>`;

      const summary = document.querySelector("#paginationSummary");
      if (summary) summary.textContent = "Wyświetlanie 0 z 0 zgłoszeń";
      return;
    }

    // Renderowanie wierszy tabeli
    visibleTickets.forEach((ticket) => {
      const row = document.createElement("tr");

      // Bezpieczne formatowanie daty serwera Firebase
      let formattedDate = "Przed chwilą";
      if (ticket.createdAt && ticket.createdAt.seconds) {
        formattedDate = new Date(ticket.createdAt.seconds * 1000).toLocaleDateString("pl-PL", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
      }

      row.innerHTML = `
        <td><strong>#${String(ticket.id).substring(0, 5).toUpperCase()}</strong></td>
        <td>${ticket.title}</td>
        <td>${ticket.category}</td>
        <td><span class="badge badge--${ticket.priority.toLowerCase()}">${ticket.priority}</span></td>
        <td><span class="status status--${ticket.status.toLowerCase().replace(" ", "-")}">${ticket.status}</span></td>
        <td>${formattedDate}</td>
        <td>
          <a href="${detailsPage}?id=${ticket.id}" class="tableAction">
            Szczegóły
          </a>
        </td>
      `;
      tableBody.appendChild(row);
    });

    // Aktualizacja licznika zgłoszeń w podsumowaniu
    const summary = document.querySelector("#paginationSummary");
    if (summary) {
      summary.textContent = `Wyświetlanie 1 do ${visibleTickets.length} z ${visibleTickets.length} zgłoszeń`;
    }
  });

  // Zwrócenie funkcji odsubskrybowania przy niszczeniu widoku
  return unsubscribe;
};
