const roleKey = "helpDeskRole";
const emailKey = "helpDeskEmail";

export const Session = {
  getRole: () => localStorage.getItem(roleKey),
  getEmail: () => localStorage.getItem(emailKey),
  save(account) {
    localStorage.setItem(roleKey, account.role);
    localStorage.setItem(emailKey, account.email);
  },
  clear() {
    localStorage.removeItem(roleKey);
    localStorage.removeItem(emailKey);
  },
};
