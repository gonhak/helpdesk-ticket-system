export const accounts = [
  {
    email: "a@a.a",
    password: "a",
    name: "Jan Kowalski",
    role: "user",
    roleLabel: "Użytkownik",
    dashboard: "pages/my-tickets.html",
  },
  {
    email: "b@b.b",
    password: "b",
    name: "Marek Brzeziński",
    role: "technician",
    roleLabel: "Technik IT",
    dashboard: "pages/technician-dashboard.html",
  },
];

export const pagePermissions = {
  user: ["my-tickets.html", "new-ticket.html", "user-ticket-details.html"],
  technician: [
    "technician-dashboard.html",
    "technician-all-tickets.html",
    "technician-assigned.html",
    "technician-ticket-details.html",
  ],
};

export const getAccountByEmail = (email) => {
  if (!email) {
    return null;
  }

  const normalizedEmail = email.trim().toLowerCase();

  return (
    accounts.find(
      (account) => account.email.toLowerCase() === normalizedEmail,
    ) || null
  );
};

export const getAccountName = (email, fallback = "") => {
  return getAccountByEmail(email)?.name || fallback || email || "";
};

export const getRoleLabel = (role) => {
  if (role === "technician") {
    return "Technik IT";
  }

  if (role === "user") {
    return "Użytkownik";
  }

  return "";
};
