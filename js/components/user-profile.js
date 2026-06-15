import { Session } from "../modules/session.js";

const updateText = (selector, value) => {
  document.querySelectorAll(selector).forEach((element) => {
    element.textContent = value;
  });
};

export const initializeUserProfile = () => {
  const user = Session.getUser();

  if (!user) {
    return;
  }

  updateText("[data-current-user-name]", Session.getName());
  updateText("[data-current-user-role]", Session.getRoleLabel());

  document
    .querySelectorAll("[data-current-user-welcome]")
    .forEach((element) => {
      const firstName = Session.getFirstName();

      element.textContent = firstName ? `Witaj, ${firstName}!` : "Witaj!";
    });
};
