import express from 'express';
import jwt from 'jsonwebtoken';
import pool from '../db.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// ── Helper tạo JWT ────────────────────────────────────────────────────────────
function makeToken(user) {
  return jwt.sign(
    { userId: user.user_id, username: user.user_name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username?.trim() || !password) {
    return res.status(400).json({ error: 'Thiếu tên đăng nhập hoặc mật khẩu' });
  }
  try {
    const exists = await pool.query(
      'SELECT user_id FROM users WHERE user_name = $1', [username.trim()]
    );
    if (exists.rows.length > 0) {
      return res.status(400).json({ error: 'Tên đăng nhập đã tồn tại.' });
    }
    const result = await pool.query(
      'INSERT INTO users (user_name, user_password) VALUES ($1, $2) RETURNING user_id, user_name, is_vip',
      [username.trim(), password]
    );
    const user = result.rows[0];
    res.json({ token: makeToken(user), username: user.user_name, isVip: user.is_vip });
  } catch (err) {
    console.error('register error:', err.message);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username?.trim() || !password) {
    return res.status(400).json({ error: 'Thiếu tên đăng nhập hoặc mật khẩu' });
  }
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE user_name = $1', [username.trim()]
    );
    const user = result.rows[0];
    if (!user || user.user_password !== password) {
      return res.status(400).json({ error: 'Sai tên đăng nhập hoặc mật khẩu.' });
    }
    res.json({ token: makeToken(user), username: user.user_name, isVip: user.is_vip });
  } catch (err) {
    console.error('login error:', err.message);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

export default router;
