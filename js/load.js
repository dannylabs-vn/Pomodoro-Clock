import {App} from "./app.js";
async function loadComponents() {
  const components = [
    { id: "component-header", path: "./components/Header/header.html" },
    { id: "component-display", path: "./components/Display/display.html" },
    { id: "component-sidebar", path: "./components/Sidebar/sidebar.html" },
    { id: "component-settings", path: "./components/Settings/settings.html" },
    { id: "component-todo", path: "./components/Todo/todo.html" },
    { id: "component-history", path: "./components/History/history.html" },

  ];

  await Promise.all(
    components.map(async ({ id, path }) => {
      const res = await fetch(path);
      const html = await res.text();
      const container = document.getElementById(id);
      if (container) container.innerHTML = html;
    }),
  );
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

export { loadComponents };