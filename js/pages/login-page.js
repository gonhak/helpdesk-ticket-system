import { Session } from "../modules/session.js";
import { auth } from "../firebase.js"; // Importujemy naszą konfigurację Firebase Auth
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"; // Import oficjalnej metody Firebase

export const initializeLoginPage = () => {
  const form = document.querySelector("#loginForm");
  const error = document.querySelector("#loginError");
  if (!form) return;

  // Dodaliśmy "async", aby móc używać "await" przy komunikacji z Firebase
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.querySelector("#email")?.value.trim().toLowerCase();
    const password = document.querySelector("#password")?.value;

    try {
      // 1. Próba zalogowania użytkownika w Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Tworzymy obiekt konta na wzór starego systemu, żeby reszta aplikacji się nie zepsuła
      // UWAGA: Firebase domyślnie nie wie, kto jest technikiem, a kto zwykłym użytkownikiem.
      // Na potrzeby testu sprawdzamy domenę lub konkretny adres e-mail.
      const isTechnician = email.includes("technik") || email.startsWith("b@"); 
      
      const account = {
        email: user.email,
        role: isTechnician ? "technician" : "user",
        // POPRAWKA: Zmiana "tickets.html" na "my-tickets.html" zgodnie z fizyczną nazwą pliku
        dashboard: isTechnician ? "pages/technician-dashboard.html" : "pages/my-tickets.html"
      };

      // 3. Zapisujemy sesję i przenosimy na odpowiedni ekran
      Session.save(account);
      window.location.href = account.dashboard;

    } catch (firebaseError) {
      // Jeśli hasło jest błędne lub użytkownik nie istnieje, Firebase wyrzuci błąd
      console.error("Błąd logowania:", firebaseError);
      error.textContent = "Nieprawidłowy adres e-mail lub hasło.";
      error.classList.add("form__error--active");
    }
  });
};