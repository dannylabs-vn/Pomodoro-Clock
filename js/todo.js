import { Store } from "./store.js";

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

class Todo extends Store {
  constructor({ getCurrentUser, isVIP, listElement, formElement, textInput, cyclesInput }) {
    super("pomodoroTasks", getCurrentUser);
    this.isVIP = isVIP;
    this.listElement = listElement;
    this.formElement = formElement;
    this.textInput = textInput;
    this.cyclesInput = cyclesInput;
    this.init();
  }

  checkVIP() {
    return this.isVIP && !this.isVIP();
  }

  getTasks() {
    return this.loadData();
  }

  render() {
    if (!this.listElement) return;
    this.tasks = this.getTasks();
    this.vip = this.isVIP ? this.isVIP() : false;
    this.currentUser = this.getCurrentUser ? this.getCurrentUser() : null;
    this.toggleInputs();
    this.tasks.length === 0 ? this.renderEmpty() : this.renderList();
  }

  toggleInputs() {
    if (this.textInput) this.textInput.disabled = !this.vip;
    if (this.cyclesInput) this.cyclesInput.disabled = !this.vip;
    if (this.formElement) {
      this.submitBtn = this.formElement.querySelector('button[type="submit"]');
      if (this.submitBtn) this.submitBtn.disabled = !this.vip;
    }
  }

  renderEmpty() {
    this.msg = "";
    if (this.vip) {
      this.msg = "Chưa có việc nào. Thêm việc và đặt số vòng pomodoro để bắt đầu!";
    } else if (this.currentUser) {
      this.msg = 'Nâng cấp VIP để sử dụng tính năng danh sách việc! <a href="pricing.html" style="color: var(--primary-color); text-decoration: underline;">Nâng cấp ngay</a>';
    } else {
      this.msg = 'Vui lòng đăng nhập và nâng cấp VIP để sử dụng tính năng danh sách việc! <a href="login.html" style="color: var(--primary-color); text-decoration: underline;">Đăng nhập</a>';
    }
    this.listElement.innerHTML = `<li class="todo-empty">${this.msg}</li>`;
  }

  renderList() {
    this.listElement.innerHTML = this.tasks
      .map(
        (task, index) => `
          <li class="todo-item ${task.done ? "done" : ""}">
            <input type="checkbox" class="todo-check" data-index="${index}" ${task.done ? "checked" : ""} ${this.vip ? "" : "disabled"} />
            <div class="todo-info">
              <span class="todo-title">${escapeHtml(task.text)}</span>
              <span class="todo-progress">${task.completedCycles}/${task.targetCycles} vòng pomodoro</span>
            </div>
            <button type="button" class="todo-delete" data-index="${index}" aria-label="Xóa" ${this.vip ? "" : "disabled"}>×</button>
          </li>
        `,
      )
      .join("");
  }

  add(text, targetCycles) {
    if (this.checkVIP()) return;
    this.tasks = this.loadData();
    this.tasks.push({ text, targetCycles, completedCycles: 0, done: false });
    this.saveData(this.tasks);
    this.render();
  }

  delete(index) {
    if (this.checkVIP()) return;
    this.tasks = this.loadData();
    this.tasks.splice(index, 1);
    this.saveData(this.tasks);
    this.render();
  }

  toggle(index, done) {
    if (this.checkVIP()) return;
    this.tasks = this.loadData();
    this.tasks[index].done = done;
    this.saveData(this.tasks);
    this.render();
  }

  advance() {
    if (this.checkVIP()) return;
    this.tasks = this.loadData();
    this.activeTask = this.tasks.find((task) => !task.done);
    if (!this.activeTask) return;
    this.activeTask.completedCycles = (this.activeTask.completedCycles || 0) + 1;
    if (this.activeTask.completedCycles >= this.activeTask.targetCycles) {
      this.activeTask.done = true;
    }
    this.saveData(this.tasks);
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
      this.text = this.textInput?.value?.trim() || "";
      if (!this.text) return;
      this.targetCycles = parseInt(this.cyclesInput?.value) || 1;
      this.add(this.text, this.targetCycles);
      if (this.textInput) this.textInput.value = "";
      if (this.cyclesInput) this.cyclesInput.value = 4;
    });
  }

  bindList() {
    if (!this.listElement) return;
    this.listElement.addEventListener("click", (event) => {
      if (this.checkVIP()) return;
      this.target = event.target;
      this.index = parseInt(this.target.dataset.index);
      if (this.target.classList.contains("todo-delete")) {
        this.delete(this.index);
      } else if (this.target.classList.contains("todo-check")) {
        this.toggle(this.index, this.target.checked);
      }
    });
  }
}

export { Todo };
