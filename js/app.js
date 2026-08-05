import { auth } from "./auth.js";
import { Timer } from "./timer.js";
import { History } from "./history.js";
import { Todo } from "./todo.js";

class Settings {
  font = "'Kumbh Sans', sans-serif";
  color = "#F87070";

  constructor(onSave) {
    this.onSave = onSave;
  }

  setup() {
    this.fonts();
    this.colors();
    this.form();
  }

  fonts() {
    this.bind(
      ".font-btn",
      (btn) => (this.font = btn.style.fontFamily || this.font),
    );
  }

  colors() {
    this.bind(
      ".color-btn",
      (btn) => (this.color = btn.style.backgroundColor || this.color),
    );
  }

  form() {
    document
      .getElementById("settings-form")
      ?.addEventListener("submit", (event) => {
        event.preventDefault();
        this.save();
      });
  }

  bind(selector, callback) {
    document.querySelectorAll(selector).forEach((btn) =>
      btn.addEventListener("click", () => {
        document
          .querySelector(`${selector}.active`)
          ?.classList.remove("active");
        btn.classList.add("active");
        callback(btn);
      }),
    );
  }

  save() {
    this.val = (id, fallback) =>
      parseInt(document.getElementById(id)?.value, 10) || fallback;
    this.onSave?.({
      pomodoro: this.val("pomodoro-time", 25),
      short: this.val("short-time", 5),
      long: this.val("long-time", 15),
    });

    document.documentElement.style.setProperty("--primary-color", this.color);
    document.documentElement.style.setProperty("--primary-font", this.font);
    document.getElementById("settings-modal")?.close();
  }
}

class AuthUI {
  setup() {
    this.login();
    this.logout();
    this.pricing();
    this.update();
  }

  login() {
    document.getElementById("btn-login")?.addEventListener("click", () => {
      location.href = `login.html?redirect=${encodeURIComponent(location.href)}`;
    });
  }

  logout() {
    document.getElementById("btn-logout")?.addEventListener("click", () => {
      auth.logout();
      this.update();
    });
  }

  pricing() {
    document.getElementById("btn-pricing")?.addEventListener("click", () => {
      location.href = "pricing.html";
    });
  }

  update() {
    const getById = (id) => document.getElementById(id);
    this.user = auth.getAuthState().user;
    const info = getById("user-info");
    if (info) {
      info.hidden = !this.user;
      info.textContent = this.user ? `Xin chào, ${this.user}` : "";
    }
    const setProperty = (id, property, value) => {
      const element = getById(id);
      if (element) element[property] = value;
    };
    setProperty("btn-login", "hidden", Boolean(this.user));
    setProperty("btn-logout", "hidden", !this.user);
    ["btn-history", "btn-todo"].forEach((id) => {
      const element = getById(id);
      if (element)
        element.style.display =
          id === "btn-todo" && !this.user ? "none" : "block";
    });
  }
}

class Modal {
  constructor(history, todo) {
    this.history = history;
    this.todo = todo;
  }

  setup() {
    this.settings();
    this.historyModal();
    this.todoModal();
  }

  settings() {
    this.bind("open", "close-settings-btn", "settings-modal");
  }

  historyModal() {
    this.bind("btn-history", "close-history", "history-modal", () => {
      this.history.renderHistory(
        document.getElementById("history-body"),
        auth.getCurrentUser(),
      );
    });
  }

  todoModal() {
    this.bind("btn-todo", "close-todo-btn", "todo-modal", () =>
      this.todo.render(),
    );
  }

  bind(openId, closeId, modalId, onOpen) {
    document.getElementById(openId)?.addEventListener("click", () => {
      onOpen?.();
      document.getElementById(modalId)?.showModal();
    });

    document
      .getElementById(closeId)
      ?.addEventListener("click", () =>
        document.getElementById(modalId)?.close(),
      );
  }
}

class App {
  constructor() {
    this.setup();
  }

  setup() {
    this.stores();
    this.timer();
    this.modules();
  }

  stores() {
    const getById = (id) => document.getElementById(id);
    this.getUser = auth.getCurrentUser.bind(auth);
    this.history = new History(this.getUser);
    this.todo = new Todo({
      getCurrentUser: this.getUser,
      isVIP: auth.isUserVIP.bind(auth),
      listElement: getById("todo-list"),
      formElement: getById("todo-form"),
      textInput: getById("todo-text"),
      cyclesInput: getById("todo-cycles"),
    });
  }

  timer() {
    const getById = (id) => document.getElementById(id);
    this.clock = new Timer({
      buttons: {
        pomodoro: getById("str"),
        short: getById("short"),
        long: getById("long"),
      },
      display: getById("time-display"),
      statusButton: getById("displaytrangthai"),
      onSessionComplete: () => this.record(),
    });
  }

  record() {
    this.time = new Date().toTimeString().split(" ")[0];
    this.history.saveEntry({
      ngay: new Date().toLocaleDateString("vi-VN"),
      gioBatDau: this.time,
      gioKetThuc: this.time,
    });
  }

  modules() {
    new Settings((config) => this.clock.setConfig(config)).setup();
    new AuthUI().setup();
    new Modal(this.history, this.todo).setup();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => new App());
} else {
  new App();
}
