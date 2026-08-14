import express from 'express';
import pool from '../db.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

// GET /api/tasks
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at ASC',
      [req.user.userId]
    );
    res.json(result.rows.map(r => ({
      id: r.task_id, text: r.text,
      targetCycles: r.target_cycles, completedCycles: r.completed_cycles, done: r.done,
    })));
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// POST /api/tasks
router.post('/', async (req, res) => {
  const { text, targetCycles } = req.body;
  if (!text) return res.status(400).json({ error: 'text không được để trống' });
  try {
    const result = await pool.query(
      'INSERT INTO tasks (user_id, text, target_cycles) VALUES ($1, $2, $3) RETURNING *',
      [req.user.userId, text, targetCycles || 1]
    );
    const r = result.rows[0];
    res.json({ id: r.task_id, text: r.text, targetCycles: r.target_cycles, completedCycles: r.completed_cycles, done: r.done });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// PATCH /api/tasks/:id
router.patch('/:id', async (req, res) => {
  const { done, completedCycles } = req.body;
  const fields = []; const values = []; let i = 1;
  if (done !== undefined)            { fields.push(`done=$${i++}`);             values.push(done); }
  if (completedCycles !== undefined) { fields.push(`completed_cycles=$${i++}`); values.push(completedCycles); }
  if (!fields.length) return res.status(400).json({ error: 'Không có gì cập nhật' });
  values.push(req.params.id, req.user.userId);
  try {
    const result = await pool.query(
      `UPDATE tasks SET ${fields.join(',')} WHERE task_id=$${i++} AND user_id=$${i} RETURNING *`,
      values
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Không tìm thấy task' });
    const r = result.rows[0];
    res.json({ id: r.task_id, text: r.text, targetCycles: r.target_cycles, completedCycles: r.completed_cycles, done: r.done });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tasks WHERE task_id=$1 AND user_id=$2', [req.params.id, req.user.userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

export default router;
