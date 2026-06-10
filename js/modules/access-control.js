import { pagePermissions } from "./config.js";
import { Session } from "./session.js";

const currentPage = () =>
  window.location.pathname.split("/").pop() || "index.html";
const homeByRole = (role) =>
  role === "technician" ? "technician-dashboard.html" : "my-tickets.html";

export const protectCurrentPage = () => {
  const requiredRole = document.body.dataset.requiredRole;
  if (!requiredRole) return;
  const role = Session.getRole();
  if (!role) {
    window.location.replace("../index.html");
    return;
  }
  if (
    role !== requiredRole ||
    !(pagePermissions[role] || []).includes(currentPage())
  )
    window.location.replace(homeByRole(role));
};
