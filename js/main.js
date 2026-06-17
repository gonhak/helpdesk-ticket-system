import { Session } from "./modules/session.js";
import { protectCurrentPage } from "./modules/access-control.js";
import { initializeSidebar } from "./components/sidebar.js";
import { initializeUserProfile } from "./components/user-profile.js";
import { initializeLoginPage } from "./pages/login-page.js";
import { initializeTicketsPage } from "./pages/tickets-page.js";
import { initializeNewTicketPage } from "./pages/new-ticket-page.js";
import { initializeTicketDetailsPage } from "./pages/ticket-details-page.js";
import { initializeTechnicianDashboardPage } from "./pages/technician-dashboard-page.js";

// Te funkcje muszą działać wszędzie (menu, profil, ochrona dostępu)
protectCurrentPage();
initializeSidebar();
initializeUserProfile();

// Pobieramy aktualny adres strony
const path = window.location.pathname;

// Uruchamiamy resztę TYLKO tam, gdzie są potrzebne:
if (path.includes("login.html") || path === "/" || path.endsWith("index.html")) {
  initializeLoginPage();
}

if (path.includes("my-tickets.html") || path.includes("technician-all-tickets.html") || path.includes("technician-assigned.html")) {
  initializeTicketsPage();
}

if (path.includes("new-ticket.html")) {
  initializeNewTicketPage();
}

if (path.includes("ticket-details.html") || path.includes("technician-ticket-details.html") || path.includes("user-ticket-details.html")) {
  initializeTicketDetailsPage().catch((error) => console.error("Błąd szczegółów:", error));
}

if (path.includes("technician-dashboard.html")) {
  initializeTechnicianDashboardPage();
}

// Wylogowywanie
document.querySelectorAll('a[href="../index.html"]').forEach((link) => {
  link.addEventListener("click", () => {
    Session.clear();
  });
});