const USER_KEY = 'pomodoroCurrentUser';
const USERS_KEY = 'pomodoroUsers';
const VIP_PREFIX = 'userVIP_';

class Auth {
  getCurrentUser() {
    return localStorage.getItem(USER_KEY);
  }

  isUserVIP(username = this.getCurrentUser()) {
    if (!username) return false;
    return localStorage.getItem(`${VIP_PREFIX}${username}`) === 'true';
  }

  getAuthState() {
    const user = this.getCurrentUser();
    return { user, isVIP: this.isUserVIP(user) };
  }

  _getUsers() {
    try {
      const data = localStorage.getItem(USERS_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  _saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  async login(username, password) {
    if (!username || !password) {
      return 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.';
    }

    const users = this._getUsers();
    const user = users[username];

    if (!user || user.password !== password) {
      return 'Sai tên đăng nhập hoặc mật khẩu.';
    }

    localStorage.setItem(USER_KEY, username);
    if (user.isVIP) {
      localStorage.setItem(`${VIP_PREFIX}${username}`, 'true');
    }

    return true;
  }

  async register(username, password) {
    if (!username || !password) {
      return 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.';
    }

    const users = this._getUsers();
    if (users[username]) {
      return 'Tên đăng nhập đã tồn tại.';
    }

    users[username] = {
      password,
      isVIP: false,
      createdAt: new Date().toISOString(),
    };
    this._saveUsers(users);

    localStorage.setItem(USER_KEY, username);
    return true;
  }

  logout() {
    localStorage.removeItem(USER_KEY);
  }

  async upgradeToVIP(username = this.getCurrentUser()) {
    if (!username) return false;

    localStorage.setItem(`${VIP_PREFIX}${username}`, 'true');

    const users = this._getUsers();
    if (users[username]) {
      users[username].isVIP = true;
      this._saveUsers(users);
    }

    return true;
  }
}

const auth = new Auth();
export { auth, Auth, USER_KEY, USERS_KEY, VIP_PREFIX };