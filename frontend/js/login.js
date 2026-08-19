import { auth } from "./auth.js";

const $ = (id) => document.getElementById(id);

class Login {
  constructor() {
    this.redirectUrl =
      new URLSearchParams(location.search).get("redirect") || "index.html";
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
    $("login-user_name")?.focus();
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
    $("login-form")?.addEventListener("submit", async (event) => {
      event.preventDefault();

      const user_name = $("login-user_name")?.value.trim() || "";
      const password = $("login-password")?.value || "";
      const errorEl = $("login-error");
      const submitBtn = $("login-submit");
      const mode = submitBtn?.dataset.mode || "login";

      if (errorEl) errorEl.textContent = "";

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Đang xử lý...";
      }

      const actions = {
        login: () => auth.login(user_name, password),
        register: () => auth.register(user_name, password),
      };
      const result = await actions[mode]();

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent =
          mode === "login" ? "Đăng nhập" : "Tạo tài khoản";
      }

      if (result === true) {
        location.href = this.redirectUrl;
        return;
      }
      if (errorEl) errorEl.textContent = result;
      $("login-form")?.reset();
    });
  }

  toggleMode() {
    const submitBtn = $("login-submit");
    const isRegistering = submitBtn?.dataset.mode === "register";
    const targetMode = isRegistering ? "login" : "register";

    const modes = {
      login: {
        title: "Đăng nhập",
        submit: "Đăng nhập",
        toggle: "Chưa có tài khoản? Tạo tài khoản mới",
      },
      register: {
        title: "Tạo tài khoản",
        submit: "Tạo tài khoản",
        toggle: "Đã có tài khoản? Đăng nhập",
      },
    };
    const cfg = modes[targetMode];

    if (submitBtn) {
      submitBtn.dataset.mode = targetMode;
      submitBtn.textContent = cfg.submit;
    }
    const titleEl = $("login-title");
    if (titleEl) titleEl.textContent = cfg.title;
    const toggleEl = $("toggle-register");
    if (toggleEl) toggleEl.textContent = cfg.toggle;
    const errorEl = $("login-error");
    if (errorEl) errorEl.textContent = "";
  }
}

new Login();
export { Login };
