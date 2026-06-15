import { Session } from "./modules/session.js";
import { protectCurrentPage } from "./modules/access-control.js";
import { initializeSidebar } from "./components/sidebar.js";
import { initializeUserProfile } from "./components/user-profile.js";
import { initializeLoginPage } from "./pages/login-page.js";
import { initializeTicketsPage } from "./pages/tickets-page.js";
import { initializeNewTicketPage } from "./pages/new-ticket-page.js";
import { initializeTicketDetailsPage } from "./pages/ticket-details-page.js";
import { initializeTechnicianDashboardPage } from "./pages/technician-dashboard-page.js";

protectCurrentPage();
initializeSidebar();
initializeUserProfile();
initializeLoginPage();
initializeTicketsPage();
initializeNewTicketPage();
initializeTicketDetailsPage();
initializeTechnicianDashboardPage();

document.querySelectorAll('a[href="../index.html"]').forEach((link) => {
  link.addEventListener("click", () => {
    Session.clear();
  });
});
