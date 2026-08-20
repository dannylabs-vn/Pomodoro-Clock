import express from "express";
import cors from "cors";
import "dotenv/config";

import auth from "./auth.js";
import todo from "./todo_db.js";
import his from "./his_db.js";

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post("/register", async (req, res) => {
  try {
    const { user_name, user_password } = req.body;
    const user = await auth.register(user_name, user_password);
    res.json(user);
  } catch (err) {
    console.error("Lỗi register:", err);
    res.status(500).json({ message: "Lỗi đăng ký", error: err.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { user_name, user_password } = req.body;
    const user = await auth.login(user_name, user_password);
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ message: "Tên đăng nhập hoặc mật khẩu không đúng" });
    }
  } catch (err) {
    console.error("Lỗi login:", err);
    res.status(500).json({ message: "Lỗi đăng nhập", error: err.message });
  }
});

app.post("/logout", (req, res) => {
  const { user_name } = req.body || {};
  auth.logout(user_name);
  res.json({ message: "Đăng xuất thành công" });
});

app.post("/upgrade", async (req, res) => {
  try {
    const { user_name } = req.body;
    const upgrade = await auth.upgradeToVIP(user_name);
    res.json(upgrade);
  } catch (err) {
    console.error("Lỗi upgrade:", err);
    res.status(500).json({ message: "Lỗi nâng cấp VIP", error: err.message });
  }
});

app.get("/getTodo/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const todos = await todo.getTodo(user_id);
    res.json(todos);
  } catch (err) {
    console.error("Lỗi getTodo:", err);
    res.status(500).json({ message: "Lỗi lấy danh sách việc", error: err.message });
  }
});

app.post("/addTodo", async (req, res) => {
  try {
    const { user_id, todo_task, chu_ky } = req.body;
    const add = await todo.addTodo(user_id, todo_task, chu_ky);
    res.json(add);
  } catch (err) {
    console.error("Lỗi addTodo:", err);
    res.status(500).json({ message: "Lỗi thêm việc", error: err.message });
  }
});

app.delete("/deleteTodo/:todo_id", async (req, res) => {
  try {
    const { todo_id } = req.params;
    const del = await todo.deleteTodo(todo_id);
    res.json(del);
  } catch (err) {
    console.error("Lỗi deleteTodo:", err);
    res.status(500).json({ message: "Lỗi xóa việc", error: err.message });
  }
});

app.get("/getHistory/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const histo = await his.getHistory(user_id);
    res.json(histo);
  } catch (err) {
    console.error("Lỗi getHistory:", err);
    res.status(500).json({ message: "Lỗi lấy lịch sử", error: err.message });
  }
});

app.post("/addHistory", async (req, res) => {
  try {
    const { user_id, his_date, so_vong } = req.body;
    const add = await his.addHistory(user_id, his_date, so_vong);
    res.json(add);
  } catch (err) {
    console.error("Lỗi addHistory:", err);
    res.status(500).json({ message: "Lỗi lưu lịch sử", error: err.message });
  }
});

if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server dang chay o port ${port}`);
  });
}

export default app;
