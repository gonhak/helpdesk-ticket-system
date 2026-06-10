import { MessageRepository } from "../services/message-repository.js";
import { isTicketFinished, normalizeTicketStatus } from "./ticket-status.js";

export const getTicketViewStatus = (ticket, readerEmail) => {
  const storedStatus = normalizeTicketStatus(ticket.status);

  if (isTicketFinished(storedStatus)) {
    return storedStatus;
  }

  const unreadCount = MessageRepository.getUnreadCount(ticket.id, readerEmail);
  return unreadCount > 0 ? "Oczekuje na odpowiedź" : storedStatus;
};
