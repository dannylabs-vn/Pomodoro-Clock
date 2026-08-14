import express from 'express';
import pool from '../db.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

// GET /api/history
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM history WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50',
      [req.user.userId]
    );
    res.json(result.rows.map(r => ({ ngay: r.ngay, gioBatDau: r.gio_bat_dau, gioKetThuc: r.gio_ket_thuc })));
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// POST /api/history
router.post('/', async (req, res) => {
  const { ngay, gioBatDau, gioKetThuc } = req.body;
  try {
    await pool.query(
      'INSERT INTO history (user_id, ngay, gio_bat_dau, gio_ket_thuc) VALUES ($1,$2,$3,$4)',
      [req.user.userId, ngay, gioBatDau, gioKetThuc]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

export default router;
