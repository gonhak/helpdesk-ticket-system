import { accounts } from "../modules/config.js";
import { Session } from "../modules/session.js";

export const initializeLoginPage = () => {
  const form = document.querySelector("#loginForm");
  const error = document.querySelector("#loginError");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = document.querySelector("#email")?.value.trim().toLowerCase();
    const password = document.querySelector("#password")?.value;
    const account = accounts.find(
      (item) => item.email === email && item.password === password,
    );
    if (!account) {
      error.textContent = "Nieprawidłowy adres e-mail lub hasło.";
      error.classList.add("form__error--active");
      return;
    }
    Session.save(account);
    window.location.href = account.dashboard;
  });
};
