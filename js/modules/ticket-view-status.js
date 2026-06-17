import { isTicketFinished, normalizeTicketStatus } from "./ticket-status.js";

export const getTicketViewStatus = (ticket, readerEmail) => {
  // Pobieramy i normalizujemy podstawowy status zapisany w Firestore
  const storedStatus = normalizeTicketStatus(ticket.status);
  
  if (isTicketFinished(storedStatus)) {
    return storedStatus;
  }

  return storedStatus;
};