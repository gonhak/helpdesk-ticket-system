export const TICKET_STATUSES = [
  "Nowe",
  "W trakcie",
  "Oczekuje na odpowiedź",
  "Zakończone",
  "Zamknięte",
];

// „Oczekuje na odpowiedź” jest statusem wyliczanym automatycznie na podstawie
// nieprzeczytanych wiadomości. Technik nie ustawia go ręcznie.
// „Zamknięte” może ustawić wyłącznie użytkownik po zaakceptowaniu rozwiązania.
export const TECHNICIAN_STATUS_OPTIONS = ["W trakcie", "Zakończone"];

export const FINISHED_TICKET_STATUSES = ["Zakończone", "Zamknięte"];

const STATUS_ALIASES = {
  Otwarte: "Nowe",
  Nowy: "Nowe",
  "W toku": "W trakcie",
  Oczekujące: "W trakcie",
  "Oczekuje na odpowiedź": "W trakcie",
  Rozwiązane: "Zakończone",
  Zakończony: "Zakończone",
};

export const normalizeTicketStatus = (status) => {
  const normalizedStatus = STATUS_ALIASES[status] || status;
  return TICKET_STATUSES.includes(normalizedStatus) ? normalizedStatus : "Nowe";
};

export const isValidTechnicianStatus = (status) => {
  return TECHNICIAN_STATUS_OPTIONS.includes(status);
};

export const isTicketFinished = (status) => {
  return FINISHED_TICKET_STATUSES.includes(normalizeTicketStatus(status));
};
