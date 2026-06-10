export const accounts = [
  {
    email: "a@a.a",
    password: "a",
    role: "user",
    dashboard: "pages/my-tickets.html",
  },
  {
    email: "b@b.b",
    password: "b",
    role: "technician",
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
