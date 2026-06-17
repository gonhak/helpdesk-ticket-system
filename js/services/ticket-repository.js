import { ticketsData } from "../../data/tickets-data.js";
import { Ticket } from "../modules/ticket.js";
import { isValidTechnicianStatus } from "../modules/ticket-status.js";

// Zaktualizowany import Firestore za pomocą URL
import { collection, onSnapshot, query, where, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "../firebase.js";
import { Session } from "../modules/session.js";


export class TicketRepository {
  static storageKey = "helpDeskTicketsV15";

  static getDefaultTickets() {
    return ticketsData.map((ticket) => new Ticket(ticket));
  }

  static getAll() {
    const savedTickets = localStorage.getItem(this.storageKey);

    if (!savedTickets) {
      const tickets = this.getDefaultTickets();
      this.saveAll(tickets);
      return tickets;
    }

    return JSON.parse(savedTickets).map((ticket) => new Ticket(ticket));
  }

  static saveAll(tickets) {
    localStorage.setItem(this.storageKey, JSON.stringify(tickets));
  }

  static add(ticket) {
    const tickets = this.getAll();
    tickets.unshift(ticket);
    this.saveAll(tickets);
  }

static async getById(ticketId) {
    const docRef = doc(db, "tickets", ticketId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.error("Brak zgłoszenia o tym ID w Firestore");
      return null;
    }
  }

  static updateStatus(ticketId, status, technicianEmail) {
    if (!isValidTechnicianStatus(status)) return false;

    const tickets = this.getAll();
    const ticket = tickets.find((item) => Number(item.id) === Number(ticketId));

    if (
      !ticket ||
      ticket.assignedTo !== technicianEmail ||
      ticket.status === "Zamknięte"
    )
      return false;

    ticket.status = status;
    this.saveAll(tickets);
    return true;
  }

  static closeResolvedTicket(ticketId, ownerEmail) {
    const tickets = this.getAll();
    const ticket = tickets.find((item) => Number(item.id) === Number(ticketId));

    if (
      !ticket ||
      ticket.ownerEmail !== ownerEmail ||
      ticket.status !== "Zakończone"
    ) {
      return false;
    }

    ticket.status = "Zamknięte";
    this.saveAll(tickets);
    return true;
  }

  static rejectResolution(ticketId, ownerEmail) {
    const tickets = this.getAll();
    const ticket = tickets.find((item) => Number(item.id) === Number(ticketId));

    if (
      !ticket ||
      ticket.ownerEmail !== ownerEmail ||
      ticket.status !== "Zakończone"
    ) {
      return false;
    }

    ticket.status = "W trakcie";
    this.saveAll(tickets);
    return true;
  }

  static assignTo(ticketId, technicianEmail) {
    const tickets = this.getAll();
    const ticket = tickets.find((item) => Number(item.id) === Number(ticketId));

    if (!ticket || ticket.assignedTo) return false;

    ticket.assignedTo = technicianEmail;
    ticket.status = "W trakcie";
    this.saveAll(tickets);
    return true;
  }
}

export const subscribeToTickets = (callback) => {
  const ticketsRef = collection(db, "tickets");
  const userEmail = Session.getEmail();
  const userRole = Session.getRole();

  let q;
  
  if (userRole === "technician") {
    // Technik ma uprawnienia do wszystkiego, więc pobiera całą kolekcję
    q = query(ticketsRef);
  } else {
    // Zwykły użytkownik prosi bazę TYLKO o dokumenty, których jest właścicielem.
    // To zapobiega blokadzie przez nowe reguły bezpieczeństwa!
    q = query(ticketsRef, where("ownerEmail", "==", userEmail));
  }

  return onSnapshot(q, (snapshot) => {
    const tickets = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    callback(tickets);
  }, (error) => {
    console.error("Błąd podczas pobierania zgłoszeń z Firestore:", error);
  });
};