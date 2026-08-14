import { apiFetch, TOKEN_KEY, USER_KEY, VIP_PREFIX } from './api.js';

/**
 * auth.js — Xác thực user qua PostgreSQL backend
 *
 * Sync  (đọc localStorage cache): getCurrentUser, isUserVIP, getAuthState
 * Async (gọi API):                 login, register, upgradeToVIP
 * Sync  (xóa localStorage):        logout
 */
class Auth {
  // ── Sync: đọc cache nhanh, không cần gọi API ─────────────────────────────

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

  // ── Async: gọi API backend ────────────────────────────────────────────────

  /** @returns {Promise<true | string>} true = thành công, string = thông báo lỗi */
  async login(username, password) {
    try {
      const res  = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
      const data = await res.json();
      if (!res.ok) return data.error || 'Sai tên đăng nhập hoặc mật khẩu.';
      this._saveSession(data);
      return true;
    } catch {
      return 'Không thể kết nối server.';
    }
  }

  /** @returns {Promise<true | string>} true = thành công, string = thông báo lỗi */
  async register(username, password) {
    try {
      const res  = await apiFetch('/auth/register', { method: 'POST', body: JSON.stringify({ username, password }) });
      const data = await res.json();
      if (!res.ok) return data.error || 'Tên đăng nhập đã tồn tại.';
      this._saveSession(data);
      return true;
    } catch {
      return 'Không thể kết nối server.';
    }
  }

  /** Xóa session, không cần gọi API */
  logout() {
    const username = this.getCurrentUser();
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    if (username) localStorage.removeItem(`${VIP_PREFIX}${username}`);
  }

  /** @returns {Promise<boolean>} */
  async upgradeToVIP(username = this.getCurrentUser()) {
    if (!username) return false;
    try {
      const res = await apiFetch('/users/vip', { method: 'PATCH' });
      if (res.ok) {
        localStorage.setItem(`${VIP_PREFIX}${username}`, 'true');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // ── Private ───────────────────────────────────────────────────────────────

  _saveSession({ token, username, isVip }) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, username);
    if (isVip) localStorage.setItem(`${VIP_PREFIX}${username}`, 'true');
  }
}

const auth = new Auth();
export { auth, Auth };