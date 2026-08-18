const express = require("express");
const cors = require("cors");

const auth = require("./auth.js");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

app.post("/register", async (req,res) => {
  const { username, password } = req.body;

  await auth.register(username, password);
  res.json({ message: " Bạn đã đăng ký thành công" });
});

app.post("/login", async (req,res) => {
  const { username, password } = req.body;
  const user = await auth.login(username, password);
  if (user) {
    res.json({ message: "Đăng nhập thành công", user });
  } else {
    res.status(401).json({ message: "Tên đăng nhập hoặc mật khẩu không đúng" });
  }
});

app.post("/logout", async (req,res) => {
  auth.logout();
  res.json({ message: "Đăng xuất thành công" });
});

app.listen(port, () => {
  console.log(`Server dang chay o port ${port}`);
});
