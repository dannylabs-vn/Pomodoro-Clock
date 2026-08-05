class Auth {
  constructor() {
    this.USERS_KEY = "pomodoroAccounts";
    this.CURRENT_KEY = "pomodoroCurrentUser";
  }

  getCurrentUser() {
    return localStorage.getItem(this.CURRENT_KEY);
  }

  getVIPKey(username) {
    return `userVIP_${username}`;
  }

  isUserVIP(username = this.getCurrentUser()) {
    if (!username) return false;
    return localStorage.getItem(this.getVIPKey(username)) === "true";
  }

  getAuthState() {
    const user = this.getCurrentUser();
    return {
      user,
      isVIP: this.isUserVIP(user),
    };
  }

  loadAccounts() {
    return JSON.parse(localStorage.getItem(this.USERS_KEY) || "{}");
  }

  saveAccounts(accounts) {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(accounts));
  }

  login(username, password) {
    const accounts = this.loadAccounts();
    if (accounts[username] !== password) {
      return false;
    }
    localStorage.setItem(this.CURRENT_KEY, username);
    return true;
  }

  register(username, password) {
    const accounts = this.loadAccounts();
    if (accounts[username]) {
      return false;
    }
    accounts[username] = password;
    this.saveAccounts(accounts);
    localStorage.setItem(this.CURRENT_KEY, username);
    return true;
  }

  logout() {
    localStorage.removeItem(this.CURRENT_KEY);
  }

  upgradeToVIP(username = this.getCurrentUser()) {
    if (username) {
      localStorage.setItem(this.getVIPKey(username), "true");
    }
  }
}

const auth = new Auth();

export { auth, Auth };