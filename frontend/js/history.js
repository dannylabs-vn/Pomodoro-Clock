const API_URL =
  window.location.protocol === "file:" ||
  (window.location.hostname === "localhost" && window.location.port !== "5000") ||
  (window.location.hostname === "127.0.0.1" && window.location.port !== "5000")
    ? "http://localhost:5000"
    : "";

class History {
  constructor(getUserId, getCurrentUser) {
    this.getUserId = getUserId;
    this.getCurrentUser = getCurrentUser;
  }

  async saveEntry(so_vong = 1) {
    const userId = this.getUserId?.();
    if (!userId) return;
    const his_date = new Date().toISOString().split("T")[0];
    try {
      await fetch(`${API_URL}/addHistory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, his_date, so_vong }),
      });
    } catch (e) {
      console.error(e);
    }
  }

  async getHistory() {
    const userId = this.getUserId?.();
    if (!userId) return [];
    try {
      const res = await fetch(`${API_URL}/getHistory/${userId}`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  async renderHistory(container) {
    if (!container) return;
    const history = await this.getHistory();
    const currentUser = this.getCurrentUser?.();

    if (!history || history.length === 0) {
      container.innerHTML = await (
        await fetch("./components/History/nohistory.html")
      ).text();
      if (!currentUser) {
        const hide = document.getElementById("hide");
        if (hide) hide.hidden = false;
      }
      return;
    }

    container.innerHTML = history
      .map(
        (item) => `
          <tr>
            <td>${item.his_date ? new Date(item.his_date).toLocaleDateString("vi-VN") : ""}</td>
            <td>${item.so_vong} vòng</td>
          </tr>
        `,
      )
      .join("");
  }
}

export { History };
