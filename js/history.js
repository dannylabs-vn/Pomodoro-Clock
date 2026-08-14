import { Store } from "./store.js";

class History extends Store {
  constructor(getCurrentUser) {
    super("pomodoroHistory", getCurrentUser);
  }

  saveEntry(entry) {
    const history = this.loadData();
    history.unshift(entry);
    this.saveData(history.slice(0, 50));
  }

  getHistory() {
    return this.loadData();
  }

  // renderHistory(container, currentUser) {
  async renderHistory(container, currentUser) {
    if (!container) return;
    const history = this.getHistory();

    // container.innerHTML = `<tr><td colspan="3" style="text-align:center;opacity:.5">Chưa có lịch sử${currentUser ? "" : " (log in để lưu lịch sử)"}</td></tr>`;

    if (history.length === 0) {
      container.innerHTML = await (
        await fetch("./components/History/nohistory.html")
      ).text();
      if (!currentUser) {
        document.getElementById("hide").hidden = false;
      }
      return;
    }

    container.innerHTML = history
      .map(
        (item) => `
          <tr>
            <td>${item.ngay}</td>
            <td>${item.gioBatDau}</td>
            <td>${item.gioKetThuc}</td>
          </tr>
        `,
      )
      .join("");
  }
}

export { History };
