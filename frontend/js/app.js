import { auth } from "../../backend/auth.js";
import { Timer } from "./timer.js";
import { History } from "../../backend/history.js";
import { Todo } from "../../backend/todo.js";
import { loadComponents } from "./load.js";

const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

class Settings {
  constructor(onSave) {
    this.font = "'Kumbh Sans', sans-serif";
    this.color = "#F87070";
    this.onSave = onSave;
  }

  setup() {
    this.bind(".font-btn", (btn) => (this.font = btn.style.fontFamily || this.font));
    this.bind(".color-btn", (btn) => (this.color = btn.style.backgroundColor || this.color));
    $("settings-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const val = (id, def) => parseInt($(id)?.value, 10) || def;
      this.onSave?.({
        pomodoro: val("pomodoro-time", 25),
        short: val("short-time", 5),
        long: val("long-time", 15),
      });
      document.documentElement.style.setProperty("--primary-color", this.color);
      document.documentElement.style.setProperty("--primary-font", this.font);
      $("settings-modal")?.close();
    });
  }

  bind(selector, callback) {
    $$(selector).forEach((btn) =>
      btn.addEventListener("click", () => {
        document.querySelector(`${selector}.active`)?.classList.remove("active");
        btn.classList.add("active");
        callback(btn);
      }),
    );
  }
}

class AuthUI {
  setup() {
    $("btn-login")?.addEventListener("click", () => {
      location.href = `login.html?redirect=${encodeURIComponent(location.href)}`;
    });
    $("btn-logout")?.addEventListener("click", () => {
      auth.logout();
      this.update();
    });
    $("btn-pricing")?.addEventListener("click", () => {
      location.href = "pricing.html";
    });
    this.update();
  }

  update() {
    const user = auth.getAuthState().user;
    const info = $("user-info");
    if (info) {
      info.hidden = !user;
      info.textContent = user ? `Xin chào, ${user}` : "";
    }
    if ($("btn-login")) $("btn-login").hidden = Boolean(user);
    if ($("btn-logout")) $("btn-logout").hidden = !user;
    if ($("btn-todo")) $("btn-todo").style.display = !user ? "none" : "";
  }
}

class Modal {
  constructor(history, todo) {
    this.history = history;
    this.todo = todo;
  }

  setup() {
    this.bind("open", "close-settings-btn", "settings-modal");
    this.bind("btn-history", "close-history", "history-modal", () => {
      this.history.renderHistory($("history-body"), auth.getCurrentUser());
    });
    this.bind("btn-todo", "close-todo-btn", "todo-modal", () => this.todo.render());
  }

  bind(openId, closeId, modalId, onOpen) {
    $(openId)?.addEventListener("click", () => {
      onOpen?.();
      $(modalId)?.showModal();
    });
    $(closeId)?.addEventListener("click", () => $(modalId)?.close());
  }
}

class App {
  constructor() {
    const getUser = auth.getCurrentUser.bind(auth);
    this.history = new History(getUser);
    this.todo = new Todo({
      getCurrentUser: getUser,
      isVIP: auth.isUserVIP.bind(auth),
      listElement: $("todo-list"),
      formElement: $("todo-form"),
      textInput: $("todo-text"),
      cyclesInput: $("todo-cycles"),
    });

    this.clock = new Timer({
      buttons: { pomodoro: $("str"), short: $("short"), long: $("long") },
      display: $("time-display"),
      statusButton: $("displaytrangthai"),
      onSessionComplete: () => {
        const time = new Date().toTimeString().split(" ")[0];
        this.history.saveEntry({
          ngay: new Date().toLocaleDateString("vi-VN"),
          gioBatDau: time,
          gioKetThuc: time,
        });
        this.todo?.advance();
      },
    });

    new Settings((cfg) => this.clock.setConfig(cfg)).setup();
    new AuthUI().setup();
    new Modal(this.history, this.todo).setup();
  }
}

async function init() {
  await loadComponents();
  new App();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

export { App };
