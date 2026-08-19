const API_URL = "http://localhost:5000";

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

class Todo {
  constructor({
    getUserId,
    getCurrentUser,
    isVIP,
    listElement,
    formElement,
    textInput,
    cyclesInput,
  }) {
    this.getUserId = getUserId;
    this.getCurrentUser = getCurrentUser;
    this.isVIP = isVIP;
    this.listElement = listElement;
    this.formElement = formElement;
    this.textInput = textInput;
    this.cyclesInput = cyclesInput;
    this.tasks = [];
    this.init();
  }

  checkVIP() {
    return this.isVIP && !this.isVIP();
  }

  async getTasks() {
    const userId = this.getUserId?.();
    if (!userId) return [];
    try {
      const res = await fetch(`${API_URL}/getTodo/${userId}`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  async render() {
    if (!this.listElement) return;
    const vip = this.isVIP ? this.isVIP() : false;
    const user = this.getCurrentUser ? this.getCurrentUser() : null;
    this.toggleInputs(vip);

    if (!user || !vip) {
      this.renderEmpty(vip, user);
      return;
    }

    this.tasks = await this.getTasks();
    this.tasks.length === 0
      ? this.renderEmpty(vip, user)
      : this.renderList(vip);
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
      msg =
        'Nâng cấp VIP để sử dụng tính năng danh sách việc! <a href="pricing.html" style="color: var(--primary-color); text-decoration: underline;">Nâng cấp ngay</a>';
    } else {
      msg =
        'Vui lòng đăng nhập và nâng cấp VIP để sử dụng tính năng danh sách việc! <a href="login.html" style="color: var(--primary-color); text-decoration: underline;">Đăng nhập</a>';
    }
    this.listElement.innerHTML = `<li class="todo-empty">${msg}</li>`;
  }

  renderList(vip) {
    this.listElement.innerHTML = this.tasks
      .map(
        (task) => `
        <li class="todo-item">
          <div class="todo-info">
            <span class="todo-title">${escapeHtml(task.todo_task)}</span>
            <span class="todo-progress">${task.chu_ky} vòng pomodoro</span>
          </div>
          <button type="button" class="todo-delete" data-id="${task.todo_id}" aria-label="Xóa" ${vip ? "" : "disabled"}>×</button>
        </li>
      `,
      )
      .join("");
  }

  async add(text, targetCycles) {
    if (this.checkVIP()) return;
    const userId = this.getUserId?.();
    if (!userId) return;

    try {
      await fetch(`${API_URL}/addTodo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          todo_task: text,
          chu_ky: targetCycles,
        }),
      });
      await this.render();
    } catch (e) {
      console.error(e);
    }
  }

  async delete(todoId) {
    if (this.checkVIP()) return;
    try {
      await fetch(`${API_URL}/deleteTodo/${todoId}`, {
        method: "DELETE",
      });
      await this.render();
    } catch (e) {
      console.error(e);
    }
  }

  init() {
    this.bindForm();
    this.bindList();
  }

  bindForm() {
    if (!this.formElement) return;
    this.formElement.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (this.checkVIP()) {
        alert("Tính năng tạo danh sách việc chỉ dành cho tài khoản VIP!");
        return;
      }
      const text = this.textInput?.value?.trim() || "";
      if (!text) return;
      const targetCycles = parseInt(this.cyclesInput?.value, 10) || 1;
      await this.add(text, targetCycles);
      if (this.textInput) this.textInput.value = "";
      if (this.cyclesInput) this.cyclesInput.value = 4;
    });
  }

  bindList() {
    if (!this.listElement) return;
    this.listElement.addEventListener("click", async (event) => {
      if (this.checkVIP()) return;
      const target = event.target;
      if (target.classList.contains("todo-delete")) {
        const id = target.dataset.id;
        if (id) await this.delete(id);
      }
    });
  }
}

export { Todo };
