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
      if (id === "component-settings") {
        console.log(html);
      }
      const container = document.getElementById(id);
      if (container) container.innerHTML = html;
    }),
  );
}

export { loadComponents };
