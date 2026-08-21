// const express = require("express");
// const cors = require("cors")
import express from "express";
import cors from "cors";
import { ErrorsHandling } from "./errors.js";
// const auth = require("./auth.js");
// const todo = require("./todo_db.js");
// const his = require("./his_db.js");

import auth from "./auth.js";
import todo from "./todo_db.js";
import his from "./his_db.js";
// import morgan from "morgan";
import log from "./middleware.js";

const app = express();
const port = 5000;

// app.use(morgan("dev"));
app.use(log);
app.use(cors());
app.use(express.json());


app.post("/register", async (req, res) => {
  try {
    const { user_name, user_password } = req.body;
    const user = await auth.register(user_name, user_password);
    res.json(user);
  } catch (error) {
    res.status(500);
    res.json("Loi gi do");
  }
});

app.post("/login", async (req, res) => {
  const { user_name, user_password } = req.body;
  const user = await auth.login(user_name, user_password);
  if (user) {
    res.json(user);
  } else {
    res.status(401).json({ message: "Tên đăng nhập hoặc mật khẩu không đúng" });
  }
});

app.post("/logout", (req, res) => {
  const { user_name } = req.body || {};
  auth.logout(user_name);
  res.json({ message: "Đăng xuất thành công" });
});

app.post("/upgrade", async (req, res) => {
  const { user_name } = req.body;
  const errorsHandling = new ErrorsHandling();
  if (!user_name) {
    errorsHandling.setError(401, "khong co quyen");
    res.status(errorsHandling.error.status);
    res.json(errorsHandling.getErrorMessage());
    return;
  }
  try {
    const upgrade = await auth.upgradeToVIP(user_name);
    res.json(upgrade);
    // console.log('/upgrade', statuscode, execution time, start tiem, end time )
  } catch (e) {
    console.error(e);
    errorsHandling.setError(500, "loi he thong");
    errorsHandling.returnError(res);
  }
});

app.get("/getTodo/:user_id", async (req, res) => {
  const { user_id } = req.params;
  const todos = await todo.getTodo(user_id);
  res.json(todos);
});

app.post("/addTodo", async (req, res) => {
  const { user_id, todo_task, chu_ky } = req.body;
  const add = await todo.addTodo(user_id, todo_task, chu_ky);
  res.json(add);
});

app.delete("/deleteTodo/:todo_id", async (req, res) => {
  const { todo_id } = req.params;
  const del = await todo.deleteTodo(todo_id);
  res.json(del);
});

app.get("/getHistory/:user_id", async (req, res) => {
  const { user_id } = req.params;
  const histo = await his.getHistory(user_id);
  res.json(histo);
});

app.post("/addHistory", async (req, res) => {
  const { user_id, his_date, so_vong } = req.body;
  const add = await his.addHistory(user_id, his_date, so_vong);
  res.json(add);
});

app.listen(port, () => {
  console.log(`Server dang chay o port ${port}`);
});
