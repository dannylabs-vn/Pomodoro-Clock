import { auth } from "./auth.js";

class Pricing {
  constructor() {
    if (location.pathname.includes("pricing.html")) this.init();
  }

  init() {
    this.back();
    this.toggle();
    this.upgrade();
    this.guestPlan();
    this.syncBilling();
    this.renderUI();
  }

  back() {
    document.getElementById("back-btn")?.addEventListener("click", () => {
      location.href = "index.html";
    });
  }

  toggle() {
    document.getElementById("pricing-toggle")?.addEventListener("change", () => this.syncBilling());
  }

  upgrade() {
    document.querySelector(".upgrade-btn")?.addEventListener("click", () => {
      this.user = auth.getCurrentUser();
      if (!this.user) {
        location.href = "login.html";
        return;
      }
      if (!auth.isUserVIP(this.user)) {
        auth.upgradeToVIP(this.user);
        this.renderUI();
        alert("Cảm ơn bạn đã nâng cấp lên VIP! Tất cả tính năng đã được mở khóa.");
        return;
      }
      this.renderUI();
      alert("Bạn đã là thành viên VIP! Tất cả tính năng đã được mở khóa.");
    });
  }

  guestPlan() {
    document.querySelector(".guest-plan-btn")?.addEventListener("click", () => {
      alert("Bạn đang sử dụng gói Thường. Hãy đăng nhập & nhận VIP để mở khóa tất cả tính năng!");
    });
  }

  syncBilling() {
    this.toggleEl = document.getElementById("pricing-toggle");
    this.cards = document.getElementById("pricing-cards");
    if (this.toggleEl && this.cards) this.cards.classList.toggle("show-annually", !this.toggleEl.checked);
  }

  renderUI() {
    this.user = auth.getCurrentUser();
    this.isVIP = auth.isUserVIP(this.user);
    this.stateKey = this.isVIP ? "vip" : this.user ? "user" : "guest";

    this.states = {
      vip: { status: "Bạn đang sử dụng gói VIP", upgrade: "Hiện tại", upgradeDis: true, guest: "Gói hiện tại", guestDis: true, active: "vip" },
      user: { status: "Bạn đang sử dụng gói Thường", upgrade: "Nâng cấp VIP", upgradeDis: false, guest: "Hiện tại", guestDis: false, active: "free" },
      guest: { status: "Đăng nhập để mở khóa tất cả tính năng", upgrade: "Nâng cấp VIP", upgradeDis: false, guest: "Hiện tại", guestDis: false, active: "none" },
    };

    this.cfg = this.states[this.stateKey];
    this.statusEl = document.getElementById("pricing-status");
    if (this.statusEl) this.statusEl.textContent = this.cfg.status;

    this.upgradeBtn = document.querySelector(".upgrade-btn");
    if (this.upgradeBtn) {
      this.upgradeBtn.textContent = this.cfg.upgrade;
      this.upgradeBtn.disabled = this.cfg.upgradeDis;
    }

    this.guestBtn = document.querySelector(".guest-plan-btn");
    if (this.guestBtn) {
      this.guestBtn.textContent = this.cfg.guest;
      this.guestBtn.disabled = this.cfg.guestDis;
    }

    document.querySelector(".cards-container .card:first-child")?.classList.toggle("active", this.cfg.active === "free");
    document.querySelector(".cards-container .card:nth-child(2)")?.classList.toggle("active", this.cfg.active === "vip");
  }
}

new Pricing();
export { Pricing };