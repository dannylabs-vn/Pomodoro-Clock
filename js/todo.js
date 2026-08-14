import { apiFetch } from './api.js';

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Todo — quản lý danh sách việc (VIP feature)
 * Dữ liệu lưu trong PostgreSQL qua API.
 * Mỗi task: { id, text, targetCycles, completedCycles, done }
 */
class Todo {
  constructor({ getCurrentUser, isVIP, listElement, formElement, textInput, cyclesInput }) {
    this.getCurrentUser = getCurrentUser;
    this.isVIP          = isVIP;
    this.listElement    = listElement;
    this.formElement    = formElement;
    this.textInput      = textInput;
    this.cyclesInput    = cyclesInput;
    this.tasks          = [];
    this.init();
  }

  checkVIP() {
    return this.isVIP && !this.isVIP();
  }

  // ── Fetch ─────────────────────────────────────────────────────────────────

  async getTasks() {
    if (!this.getCurrentUser?.()) return [];
    try {
      const res = await apiFetch('/tasks');
      return res.ok ? await res.json() : [];
    } catch {
      return [];
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  async render() {
    if (!this.listElement) return;
    this.tasks = await this.getTasks();
    const vip  = this.isVIP ? this.isVIP() : false;
    const user = this.getCurrentUser ? this.getCurrentUser() : null;
    this.toggleInputs(vip);
    this.tasks.length === 0 ? this.renderEmpty(vip, user) : this.renderList(vip);
  }

  toggleInputs(vip) {
    if (this.textInput)   this.textInput.disabled   = !vip;
    if (this.cyclesInput) this.cyclesInput.disabled = !vip;
    if (this.formElement) {
      const btn = this.formElement.querySelector('button[type="submit"]');
      if (btn) btn.disabled = !vip;
    }
  }

  renderEmpty(vip, currentUser) {
    let msg = '';
    if (vip) {
      msg = 'Chưa có việc nào. Thêm việc và đặt số vòng pomodoro để bắt đầu!';
    } else if (currentUser) {
      msg = 'Nâng cấp VIP để sử dụng tính năng danh sách việc! <a href="pricing.html" style="color: var(--primary-color); text-decoration: underline;">Nâng cấp ngay</a>';
    } else {
      msg = 'Vui lòng đăng nhập và nâng cấp VIP để sử dụng tính năng danh sách việc! <a href="login.html" style="color: var(--primary-color); text-decoration: underline;">Đăng nhập</a>';
    }
    this.listElement.innerHTML = `<li class="todo-empty">${msg}</li>`;
  }

  renderList(vip) {
    this.listElement.innerHTML = this.tasks
      .map((task, index) => `
        <li class="todo-item ${task.done ? 'done' : ''}">
          <input type="checkbox" class="todo-check" data-index="${index}" ${task.done ? 'checked' : ''} ${vip ? '' : 'disabled'} />
          <div class="todo-info">
            <span class="todo-title">${escapeHtml(task.text)}</span>
            <span class="todo-progress">${task.completedCycles}/${task.targetCycles} vòng pomodoro</span>
          </div>
          <button type="button" class="todo-delete" data-index="${index}" aria-label="Xóa" ${vip ? '' : 'disabled'}>×</button>
        </li>
      `)
      .join('');
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────

  async add(text, targetCycles) {
    if (this.checkVIP()) return;
    try {
      const res = await apiFetch('/tasks', {
        method: 'POST',
        body: JSON.stringify({ text, targetCycles }),
      });
      if (res.ok) await this.render();
    } catch (err) {
      console.error('Lỗi thêm task:', err);
    }
  }

  async delete(index) {
    if (this.checkVIP()) return;
    const task = this.tasks[index];
    if (!task) return;
    try {
      const res = await apiFetch(`/tasks/${task.id}`, { method: 'DELETE' });
      if (res.ok) await this.render();
    } catch (err) {
      console.error('Lỗi xóa task:', err);
    }
  }

  async toggle(index, done) {
    if (this.checkVIP()) return;
    const task = this.tasks[index];
    if (!task) return;
    try {
      const res = await apiFetch(`/tasks/${task.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ done }),
      });
      if (res.ok) await this.render();
    } catch (err) {
      console.error('Lỗi toggle task:', err);
    }
  }

  async advance() {
    if (this.checkVIP()) return;
    this.tasks = await this.getTasks();
    const activeTask = this.tasks.find((t) => !t.done);
    if (!activeTask) return;
    const newCompleted = (activeTask.completedCycles || 0) + 1;
    const newDone = newCompleted >= activeTask.targetCycles;
    try {
      await apiFetch(`/tasks/${activeTask.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ completedCycles: newCompleted, done: newDone }),
      });
    } catch (err) {
      console.error('Lỗi advance task:', err);
    }
  }

  // ── Init ──────────────────────────────────────────────────────────────────

  init() {
    this.bindForm();
    this.bindList();
  }

  bindForm() {
    if (!this.formElement) return;
    this.formElement.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (this.checkVIP()) {
        alert('Tính năng tạo danh sách việc chỉ dành cho tài khoản VIP!');
        return;
      }
      const text = this.textInput?.value?.trim() || '';
      if (!text) return;
      const targetCycles = parseInt(this.cyclesInput?.value) || 1;
      await this.add(text, targetCycles);
      if (this.textInput) this.textInput.value = '';
      if (this.cyclesInput) this.cyclesInput.value = 4;
    });
  }

  bindList() {
    if (!this.listElement) return;
    this.listElement.addEventListener('click', async (event) => {
      if (this.checkVIP()) return;
      const target = event.target;
      const index = parseInt(target.dataset.index);
      if (target.classList.contains('todo-delete')) {
        await this.delete(index);
      } else if (target.classList.contains('todo-check')) {
        await this.toggle(index, target.checked);
      }
    });
  }
}

export { Todo };
