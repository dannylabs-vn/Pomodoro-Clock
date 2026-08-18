import { Store } from "./store.js";

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

class Todo {
  constructor({ getCurrentUser, isVIP, listElement, formElement, textInput, cyclesInput }) {
    this.getCurrentUser = getCurrentUser;
    this.isVIP = isVIP;
    this.listElement = listElement;
    this.formElement = formElement;
    this.textInput = textInput;
    this.cyclesInput = cyclesInput;
    this.store = new Store("pomodoroTodo", getCurrentUser);
    this.tasks = [];
    this.init();
  }

  checkVIP() {
    return this.isVIP && !this.isVIP();
  }

  getTasks() {
    if (!this.getCurrentUser?.()) return [];
    try {
      const data = this.store.loadData();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  saveTasks(tasks) {
    this.store.saveData(tasks);
  }

  render() {
    if (!this.listElement) return;
    this.tasks = this.getTasks();
    const vip = this.isVIP ? this.isVIP() : false;
    const user = this.getCurrentUser ? this.getCurrentUser() : null;
    this.toggleInputs(vip);
    this.tasks.length === 0 ? this.renderEmpty(vip, user) : this.renderList(vip);
  }

  toggleInputs(vip) {
    if (this.textInput) this.textInput.disabled = !vip;
    if (this.cyclesInput) this.cyclesInput.disabled = !vip;
    if (this.formElement) {
      const btn = this.formElement.querySelector('button[type="submit"]');
      if (btn) btn.disabled = !vip;
    }
  }

  renderEmpty(vip, currentUser) {
    let msg = "";
    if (vip) {
      msg = "Chưa có việc nào. Thêm việc và đặt số vòng pomodoro để bắt đầu!";
    } else if (currentUser) {
      msg = 'Nâng cấp VIP để sử dụng tính năng danh sách việc! <a href="pricing.html" style="color: var(--primary-color); text-decoration: underline;">Nâng cấp ngay</a>';
    } else {
      msg = 'Vui lòng đăng nhập và nâng cấp VIP để sử dụng tính năng danh sách việc! <a href="login.html" style="color: var(--primary-color); text-decoration: underline;">Đăng nhập</a>';
    }
    this.listElement.innerHTML = `<li class="todo-empty">${msg}</li>`;
  }

  renderList(vip) {
    this.listElement.innerHTML = this.tasks
      .map(
        (task, index) => `
        <li class="todo-item ${task.done ? "done" : ""}">
          <input type="checkbox" class="todo-check" data-index="${index}" ${task.done ? "checked" : ""} ${vip ? "" : "disabled"} />
          <div class="todo-info">
            <span class="todo-title">${escapeHtml(task.text)}</span>
            <span class="todo-progress">${task.completedCycles}/${task.targetCycles} vòng pomodoro</span>
          </div>
          <button type="button" class="todo-delete" data-index="${index}" aria-label="Xóa" ${vip ? "" : "disabled"}>×</button>
        </li>
      `
      )
      .join("");
  }

  add(text, targetCycles) {
    if (this.checkVIP()) return;
    const tasks = this.getTasks();
    const newTask = {
      id: Date.now().toString(),
      text,
      targetCycles,
      completedCycles: 0,
      done: false,
    };
    tasks.push(newTask);
    this.saveTasks(tasks);
    this.render();
  }

  delete(index) {
    if (this.checkVIP()) return;
    const tasks = this.getTasks();
    if (index >= 0 && index < tasks.length) {
      tasks.splice(index, 1);
      this.saveTasks(tasks);
      this.render();
    }
  }

  toggle(index, done) {
    if (this.checkVIP()) return;
    const tasks = this.getTasks();
    if (tasks[index]) {
      tasks[index].done = done;
      this.saveTasks(tasks);
      this.render();
    }
  }

  advance() {
    if (this.checkVIP()) return;
    const tasks = this.getTasks();
    const activeTask = tasks.find((t) => !t.done);
    if (!activeTask) return;
    activeTask.completedCycles = (activeTask.completedCycles || 0) + 1;
    if (activeTask.completedCycles >= activeTask.targetCycles) {
      activeTask.done = true;
    }
    this.saveTasks(tasks);
    this.render();
  }

  init() {
    this.bindForm();
    this.bindList();
  }

  bindForm() {
    if (!this.formElement) return;
    this.formElement.addEventListener("submit", (event) => {
      event.preventDefault();
      if (this.checkVIP()) {
        alert("Tính năng tạo danh sách việc chỉ dành cho tài khoản VIP!");
        return;
      }
      const text = this.textInput?.value?.trim() || "";
      if (!text) return;
      const targetCycles = parseInt(this.cyclesInput?.value, 10) || 1;
      this.add(text, targetCycles);
      if (this.textInput) this.textInput.value = "";
      if (this.cyclesInput) this.cyclesInput.value = 4;
    });
  }

  bindList() {
    if (!this.listElement) return;
    this.listElement.addEventListener("click", (event) => {
      if (this.checkVIP()) return;
      const target = event.target;
      const index = parseInt(target.dataset.index, 10);
      if (target.classList.contains("todo-delete")) {
        this.delete(index);
      } else if (target.classList.contains("todo-check")) {
        this.toggle(index, target.checked);
      }
    });
  }
}

export { Todo };
