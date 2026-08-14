-- =====================================================
-- Pomodoro Clock — Schema SQL
-- Chạy trong pgAdmin > Query Tool (database: pomodoro)
-- Xóa data mẫu, tạo lại tables đúng chuẩn
-- =====================================================

DROP TABLE IF EXISTS history CASCADE;
DROP TABLE IF EXISTS tasks   CASCADE;
DROP TABLE IF EXISTS users   CASCADE;

CREATE TABLE users (
  user_id       SERIAL       PRIMARY KEY,
  user_name     VARCHAR(50)  UNIQUE NOT NULL,
  user_password VARCHAR(255) NOT NULL,
  is_vip        BOOLEAN      DEFAULT FALSE,
  created_at    TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE tasks (
  task_id          SERIAL    PRIMARY KEY,
  user_id          INT       REFERENCES users(user_id) ON DELETE CASCADE,
  text             VARCHAR(500) NOT NULL,
  target_cycles    INT       DEFAULT 1,
  completed_cycles INT       DEFAULT 0,
  done             BOOLEAN   DEFAULT FALSE,
  created_at       TIMESTAMP DEFAULT NOW()
);

CREATE TABLE history (
  history_id   SERIAL    PRIMARY KEY,
  user_id      INT       REFERENCES users(user_id) ON DELETE CASCADE,
  ngay         VARCHAR(20),
  gio_bat_dau  VARCHAR(20),
  gio_ket_thuc VARCHAR(20),
  created_at   TIMESTAMP DEFAULT NOW()
);

SELECT 'Schema tạo thành công! Tables: users, tasks, history' AS result;
