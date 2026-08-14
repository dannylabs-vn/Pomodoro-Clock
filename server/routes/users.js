import express from 'express';
import pool from '../db.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

// GET /api/users/me — thông tin user + VIP status
router.get('/me', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT user_id, user_name, is_vip FROM users WHERE user_id = $1',
      [req.user.userId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'User không tồn tại' });
    const u = result.rows[0];
    res.json({ userId: u.user_id, username: u.user_name, isVip: u.is_vip });
  } catch (err) {
    console.error('GET /users/me error:', err.message);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// PATCH /api/users/vip — nâng cấp VIP
router.patch('/vip', async (req, res) => {
  try {
    await pool.query('UPDATE users SET is_vip = TRUE WHERE user_id = $1', [req.user.userId]);
    res.json({ success: true });
  } catch (err) {
    console.error('PATCH /users/vip error:', err.message);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

export default router;
