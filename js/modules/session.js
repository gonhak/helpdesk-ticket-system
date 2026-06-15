import { getAccountByEmail, getRoleLabel } from "./config.js";

const userKey = "helpDeskCurrentUser";
const roleKey = "helpDeskRole";
const emailKey = "helpDeskEmail";

const getStoredUser = () => {
  const storedUser = localStorage.getItem(userKey);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    localStorage.removeItem(userKey);

    return null;
  }
};

const getLegacyUser = () => {
  const email = localStorage.getItem(emailKey);
  const role = localStorage.getItem(roleKey);

  if (!email || !role) {
    return null;
  }

  const account = getAccountByEmail(email);

  if (account) {
    return {
      email: account.email,
      name: account.name,
      role: account.role,
      roleLabel: account.roleLabel,
    };
  }

  return {
    email,
    name: email,
    role,
    roleLabel: getRoleLabel(role),
  };
};

export const Session = {
  getUser() {
    const storedUser = getStoredUser();

    if (storedUser) {
      const account = getAccountByEmail(storedUser.email);

      if (account) {
        return {
          ...storedUser,
          name: account.name,
          role: account.role,
          roleLabel: account.roleLabel,
        };
      }

      return storedUser;
    }

    const legacyUser = getLegacyUser();

    if (legacyUser) {
      localStorage.setItem(userKey, JSON.stringify(legacyUser));
    }

    return legacyUser;
  },

  getRole() {
    return this.getUser()?.role || null;
  },

  getEmail() {
    return this.getUser()?.email || null;
  },

  getName() {
    return this.getUser()?.name || "";
  },

  getRoleLabel() {
    const user = this.getUser();

    if (!user) {
      return "";
    }

    return user.roleLabel || getRoleLabel(user.role);
  },

  getFirstName() {
    const name = this.getName().trim();

    if (!name) {
      return "";
    }

    return name.split(/\s+/)[0];
  },

  save(account) {
    const user = {
      email: account.email,
      name: account.name,
      role: account.role,
      roleLabel: account.roleLabel || getRoleLabel(account.role),
    };

    localStorage.setItem(userKey, JSON.stringify(user));

    // Starsze klucze zostają na chwilę dla zgodności z pozostałą logiką projektu.
    localStorage.setItem(roleKey, user.role);
    localStorage.setItem(emailKey, user.email);
  },

  clear() {
    localStorage.removeItem(userKey);
    localStorage.removeItem(roleKey);
    localStorage.removeItem(emailKey);
  },
};
