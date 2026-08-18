const USER_KEY = 'pomodoroCurrentUser';
const VIP_PREFIX = 'userVIP_';
const API_URL = 'http://localhost:3000/api/auth';

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

  async login(username, password) {
    if (!username || !password) return 'Vui long nhap day du thong tin';
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) return data.error || 'Sai ten dang nhap hoac mat khau';

      localStorage.setItem(USER_KEY, data.user.user_name);
      if (data.user.is_vip) {
        localStorage.setItem(`${VIP_PREFIX}${data.user.user_name}`, 'true');
      } else {
        localStorage.removeItem(`${VIP_PREFIX}${data.user.user_name}`);
      }
      return true;
    } catch {
      return 'Khong the ket noi Backend Server (Chay: node backend/server.js)';
    }
  }

  async register(username, password) {
    if (!username || !password) return 'Vui long nhap day du thong tin';
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) return data.error || 'Dang ky that bai';

      localStorage.setItem(USER_KEY, username);
      return true;
    } catch {
      return 'Khong the ket noi Backend Server (Chay: node backend/server.js)';
    }
  }

  logout() {
    localStorage.removeItem(USER_KEY);
  }
}

const auth = new Auth();
export { auth, Auth };
