import { auth } from "./auth.js";

const $ = (id) => document.getElementById(id);

class Login {
  constructor() {
    this.redirectUrl = new URLSearchParams(location.search).get("redirect") || "index.html";
    this.setup();
  }

  setup() {
    this.modal();
    this.close();
    this.toggleBtn();
    this.form();
  }

  modal() {
    $("login-modal")?.showModal();
    $("login-username")?.focus();
  }

  close() {
    $("close-login")?.addEventListener("click", () => {
      location.href = this.redirectUrl;
    });
  }

  toggleBtn() {
    $("toggle-register")?.addEventListener("click", () => this.toggleMode());
  }

  
  form() {
    $("login-form")?.addEventListener("submit", (event) => {
      event.preventDefault();
      this.username = $("login-username")?.value.trim() || "";
      this.password = $("login-password")?.value || "";
      this.errorEl = $("login-error");
      if (this.errorEl) this.errorEl.textContent = "";

      this.mode = $("login-submit")?.dataset.mode || "login";
      this.actions = {
        register: () => auth.register(this.username, this.password) ? null : "Tên đăng nhập đã tồn tại.",
        login: () => auth.login(this.username, this.password) ? null : "Sai tên đăng nhập hoặc mật khẩu.",
      };

      this.error = this.actions[this.mode]();
      if (!this.error) {
        location.href = this.redirectUrl;
        return;
      }
      if (this.errorEl) this.errorEl.textContent = this.error;
      $("login-form")?.reset();
    });
  }

  toggleMode() {
    this.submitBtn = $("login-submit");
    this.isRegistering = this.submitBtn?.dataset.mode === "register";
    this.targetMode = this.isRegistering ? "login" : "register";

    this.modes = {
      login: { title: "Đăng nhập", submit: "Đăng nhập", toggle: "Chưa có tài khoản? Tạo tài khoản mới" },
      register: { title: "Tạo tài khoản", submit: "Tạo tài khoản", toggle: "Đã có tài khoản? Đăng nhập" },
    };

    this.cfg = this.modes[this.targetMode];
    if (this.submitBtn) {
      this.submitBtn.dataset.mode = this.targetMode;
      this.submitBtn.textContent = this.cfg.submit;
    }
    this.titleEl = $("login-title");
    if (this.titleEl) this.titleEl.textContent = this.cfg.title;
    this.toggleEl = $("toggle-register");
    if (this.toggleEl) this.toggleEl.textContent = this.cfg.toggle;
    this.errorEl = $("login-error");
    if (this.errorEl) this.errorEl.textContent = "";
  }
}

new Login();
export { Login };