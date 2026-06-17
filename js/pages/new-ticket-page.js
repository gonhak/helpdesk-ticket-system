import { Session } from "../modules/session.js";
import { db } from "../firebase.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export const initializeNewTicketPage = () => {
  const form = document.querySelector("#newTicketForm");

  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (Session.getRole() !== "user") {
      window.location.replace("technician-dashboard.html");
      return;
    }

    const description = document.querySelector("#description")?.value.trim();
    const title = document.querySelector("#ticketTitle")?.value.trim();
    const category = document.querySelector("#category")?.value;
    const priority = document.querySelector("#priority")?.value;

    try {
      // Wskazujemy kolekcję "tickets" w Firestore
      const ticketsRef = collection(db, "tickets");
      
      // Dodajemy nowy dokument z automatycznie wygenerowanym ID przez Firebase
      await addDoc(ticketsRef, {
        title: title,
        category: category,
        priority: priority,
        status: "Nowe",
        createdAt: serverTimestamp(), // Firebase sam nada dokładny czas serwera
        reporter: Session.getName(),
        ownerEmail: Session.getEmail(),
        assignedTo: null,
        description: description,
      });

      // Po udanym zapisie przenosimy użytkownika do jego zgłoszeń
      window.location.href = "my-tickets.html";
    } catch (error) {
      console.error("Błąd podczas dodawania zgłoszenia do Firestore: ", error);
    }
  });
};