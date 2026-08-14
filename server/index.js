import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes    from './routes/auth.js';
import userRoutes    from './routes/users.js';
import taskRoutes    from './routes/tasks.js';
import historyRoutes from './routes/history.js';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth',    authRoutes);
app.use('/api/users',   userRoutes);
app.use('/api/tasks',   taskRoutes);
app.use('/api/history', historyRoutes);

app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', time: new Date().toISOString() })
);

app.listen(PORT, () => {
  console.log(`🍅 Pomodoro Backend đang chạy → http://localhost:${PORT}`);
  console.log(`   Health check          → http://localhost:${PORT}/api/health`);
});
