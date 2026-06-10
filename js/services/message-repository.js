import { messagesData } from "../../data/messages-data.js";
import { Message } from "../modules/message.js";

export class MessageRepository {
  static storageKey = "helpDeskMessagesV15";

  static getAll() {
    const saved = localStorage.getItem(this.storageKey);

    if (!saved) {
      const messages = messagesData.map((message) => new Message(message));
      this.saveAll(messages);
      return messages;
    }

    return JSON.parse(saved).map((message) => new Message(message));
  }

  static saveAll(messages) {
    localStorage.setItem(this.storageKey, JSON.stringify(messages));
  }

  static getByTicketId(ticketId) {
    return this.getAll().filter(
      (message) => message.ticketId === Number(ticketId),
    );
  }

  static getUnreadCount(ticketId, readerEmail) {
    return this.getByTicketId(ticketId).filter((message) => {
      return (
        message.authorEmail !== readerEmail &&
        !message.readBy.includes(readerEmail)
      );
    }).length;
  }

  static markTicketAsRead(ticketId, readerEmail) {
    const messages = this.getAll();
    let hasChanges = false;

    messages.forEach((message) => {
      if (
        message.ticketId !== Number(ticketId) ||
        message.authorEmail === readerEmail
      ) {
        return;
      }

      if (!message.readBy.includes(readerEmail)) {
        message.readBy.push(readerEmail);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      this.saveAll(messages);
    }
  }

  static removeByTicketId(ticketId) {
    const messages = this.getAll().filter(
      (message) => message.ticketId !== Number(ticketId),
    );
    this.saveAll(messages);
  }

  static add({ ticketId, authorEmail, authorName, authorRole, content }) {
    const messages = this.getAll();
    const message = new Message({
      id: `m-${ticketId}-${Date.now()}`,
      ticketId,
      authorEmail,
      authorName,
      authorRole,
      content,
      createdAt: "Przed chwilą",
      readBy: [authorEmail],
    });

    messages.push(message);
    this.saveAll(messages);
    return message;
  }
}
