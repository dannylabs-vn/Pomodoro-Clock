const USER_KEY = "pomodoroCurrentUser";
const USER_ID_KEY = "pomodoroCurrentUserId";
const VIP_PREFIX = "userVIP_";
const API_URL = "http://localhost:5000";

class Auth {
  getCurrentUser() {
    return localStorage.getItem(USER_KEY);
  }

  getUserId() {
    return localStorage.getItem(USER_ID_KEY);
  }

  isUserVIP(user_name = this.getCurrentUser()) {
    if (!user_name) return false;
    return localStorage.getItem(`${VIP_PREFIX}${user_name}`) === "true";
  }

  getAuthState() {
    const user = this.getCurrentUser();
    const userId = this.getUserId();
    return { user, userId, isVIP: this.isUserVIP(user) };
  }

  async login(user_name, user_password) {
    if (!user_name || !user_password) return "Vui lòng nhập đầy đủ thông tin";
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_name, user_password }),
      });
      const data = await res.json();
      if (!res.ok) return data.message || "Sai tên đăng nhập hoặc mật khẩu";

      const name =
        data.user_name || (data.user && data.user.user_name) || user_name;
      const id =
        data.user_id || (data.user && data.user.user_id) || data.userId;
      const isVip = data.is_vip || (data.user && data.user.is_vip);

      localStorage.setItem(USER_KEY, name);
      if (id) localStorage.setItem(USER_ID_KEY, String(id));

      if (isVip) {
        localStorage.setItem(`${VIP_PREFIX}${name}`, "true");
      } else {
        localStorage.removeItem(`${VIP_PREFIX}${name}`);
      }
      return true;
    } catch {
      return "Không thể kết nối Backend Server (Chạy: node backend/server.js)";
    }
  }

  async register(user_name, user_password) {
    if (!user_name || !user_password) return "Vui lòng nhập đầy đủ thông tin";
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_name, user_password }),
      });
      const data = await res.json();
      if (!res.ok) return data.message || "Đăng ký thất bại";

      const id = typeof data === "number" ? data : data.user_id || data.userId;
      localStorage.setItem(USER_KEY, user_name);
      if (id) localStorage.setItem(USER_ID_KEY, String(id));
      return true;
    } catch {
      return "Không thể kết nối Backend Server (Chạy: node backend/server.js)";
    }
  }

  async upgradeToVIP(user_name = this.getCurrentUser()) {
    if (!user_name) return false;

    try {
      const res = await fetch(`${API_URL}/upgrade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_name }),
      });

      if (!res.ok) return false;

      localStorage.setItem(`${VIP_PREFIX}${user_name}`, "true");
      return true;
    } catch {
      return false;
    }
  }

  logout() {
    const user = this.getCurrentUser();
    if (user) {
      localStorage.removeItem(`${VIP_PREFIX}${user}`);
    }
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(USER_ID_KEY);
  }
}

const auth = new Auth();
export { auth, Auth };
