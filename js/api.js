/**
 * api.js — Fetch helper gọi backend với JWT tự động
 */
const API_BASE   = 'http://localhost:3000/api';
const TOKEN_KEY  = 'pomodoroToken';
const USER_KEY   = 'pomodoroCurrentUser';
const VIP_PREFIX = 'userVIP_';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  if (res.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    if (!location.pathname.includes('login')) {
      location.href = `login.html?redirect=${encodeURIComponent(location.href)}`;
    }
    throw new Error('Unauthorized');
  }
  return res;
}

export { apiFetch, getToken, TOKEN_KEY, USER_KEY, VIP_PREFIX };
