import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || 'pomodoro',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || 'kietthongminh',
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Lỗi kết nối PostgreSQL:', err.message);
  } else {
    console.log('✅ Kết nối PostgreSQL thành công!');
    release();
  }
});

export default pool;
