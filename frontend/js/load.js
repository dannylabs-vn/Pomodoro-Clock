async function loadComponents() {
  const components = [
    { id: "component-header", path: "./components/header/header.html" },
    { id: "component-display", path: "./components/display/display.html" },
    { id: "component-sidebar", path: "./components/sidebar/sidebar.html" },
    { id: "component-settings", path: "./components/settings/settings.html" },
    { id: "component-todo", path: "./components/Todo/todo.html" },
    { id: "component-history", path: "./components/History/history.html" },
  ];

  await Promise.all(
    components.map(async ({ id, path }) => {
      const res = await fetch(path);
      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      doc.querySelectorAll("script").forEach((s) => s.remove());
      const container = document.getElementById(id);
      if (container) {
        container.innerHTML = doc.body ? doc.body.innerHTML : html;
      }
    }),
  );
}

export { loadComponents };
