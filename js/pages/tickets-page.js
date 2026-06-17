import { subscribeToTickets } from "../services/ticket-repository.js";
import { auth } from "../firebase.js";

export const initializeTicketsPage = () => {
  const tableBody = document.querySelector("#ticketsTableBody");
  if (!tableBody) return;

  // Renderowanie stanu ładowania danych
  tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center;">Ładowanie zgłoszeń z bazy danych...</td></tr>`;

  // Subskrypcja strumienia danych z Firestore (onSnapshot)
  const unsubscribe = subscribeToTickets((tickets) => {
    tableBody.innerHTML = ""; // Czyszczenie tabeli przed ponownym renderowaniem

    // Filtrowanie ticketów w kodzie, aby zalogowany użytkownik widział tylko swoje zgłoszenia
    const currentUserEmail = auth.currentUser?.email;
    const myTickets = tickets.filter(ticket => ticket.ownerEmail === currentUserEmail);

    if (myTickets.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center;">Brak zgłoszeń spełniających wybrane filtry.</td></tr>`;
      
      const summary = document.querySelector("#paginationSummary");
      if (summary) summary.textContent = "Wyświetlanie 0 z 0 zgłoszeń";
      return;
    }

    // Renderowanie wierszy tabeli
    myTickets.forEach((ticket) => {
      const row = document.createElement("tr");
      
      // Bezpieczne formatowanie daty serwera Firebase
      let formattedDate = "Przed chwilą";
      if (ticket.createdAt && ticket.createdAt.seconds) {
        formattedDate = new Date(ticket.createdAt.seconds * 1000).toLocaleDateString("pl-PL", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit"
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
          <a href="user-ticket-details.html?id=${ticket.id}" class="tableAction">
            Szczegóły
          </a>
        </td>
      `;
      tableBody.appendChild(row);
    });

    // Aktualizacja licznika zgłoszeń w podsumowaniu
    const summary = document.querySelector("#paginationSummary");
    if (summary) {
      summary.textContent = `Wyświetlanie 1 do ${myTickets.length} z ${myTickets.length} zgłoszeń`;
    }
  });

  // Zwrócenie funkcji odsubskrybowania przy niszczeniu widoku
  return unsubscribe;
};