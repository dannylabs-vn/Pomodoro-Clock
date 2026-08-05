class Timer {
  constructor({ buttons, display, statusButton, onSessionComplete, initialConfig = { pomodoro: 25, short: 5, long: 15 } }) {
    this.buttons = buttons || {};
    this.display = display;
    this.statusButton = statusButton;
    this.onSessionComplete = onSessionComplete;
    this.config = { ...initialConfig };
    this.currentMode = "pomodoro";
    this.totalTime = this.config.pomodoro * 60;
    this.timeLeft = this.totalTime;
    this.timerId = null;
    this.isRunning = false;
    this.completedPomodoros = 0;
    this.startTime = null;
    this.circumference = 295.3;
    this.init();
  }

  setup() {
    this.buttons();
    this.status();
    this.render();
  }

  init() {
    this.bindButtons();
    this.bindStatus();
    this.updateActive(this.currentMode);
    this.updateDisplay();
  }

  bindButtons() {
    Object.entries(this.buttons).forEach(([mode, btn]) => {
      btn?.addEventListener("click", () => this.switchMode(mode));
    });
  }

  bindStatus() {
    this.statusButton?.addEventListener("click", () => {
      if (this.isRunning) this.stop();
      else if (this.timeLeft > 0) this.start();
    });
  }

  updateActive(mode) {
    Object.values(this.buttons).forEach((btn) => btn?.classList.remove("active"));
    this.buttons[mode]?.classList.add("active");
  }

  format(seconds) {
    this.mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    this.secs = String(seconds % 60).padStart(2, "0");
    return `${this.mins}:${this.secs}`;
  }

  updateProgress() {
    this.percentage = this.totalTime > 0 ? this.timeLeft / this.totalTime : 0;
    this.offset = this.circumference - this.percentage * this.circumference;
    this.progressCircle = document.querySelector(".progress");
    if (this.progressCircle) this.progressCircle.style.strokeDashoffset = this.offset;
    this.vongDe = document.querySelector(".vong-de");
    if (this.vongDe) this.vongDe.style.opacity = 0.4 + this.percentage * 0.8;
  }

  updateDisplay() {
    if (this.display) this.display.textContent = this.format(this.timeLeft);
    this.updateProgress();
  }

  start() {
    if (this.isRunning) return;
    if (!this.startTime) this.startTime = new Date();
    this.isRunning = true;
    if (this.statusButton) this.statusButton.textContent = "PAUSE";
    this.timerId = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft -= 1;
        this.updateDisplay();
      } else {
        clearInterval(this.timerId);
        this.autoSwitch();
      }
    }, 1000);
  }

  stop() {
    if (!this.isRunning) return;
    clearInterval(this.timerId);
    this.isRunning = false;
    if (this.statusButton) this.statusButton.textContent = "START";
  }

  switchMode(mode, autoStart = true) {
    this.currentMode = mode;
    this.totalTime = this.config[mode] * 60;
    this.timeLeft = this.totalTime;
    this.startTime = null;
    this.updateActive(this.currentMode);
    this.stop();
    this.updateDisplay();
    if (autoStart) this.start();
  }

  autoSwitch() {
    this.stop();
    if (this.currentMode !== "pomodoro") {
      this.switchMode("pomodoro", true);
      return;
    }
    this.onSessionComplete?.();
    this.completedPomodoros = (this.completedPomodoros + 1) % 4;
    this.nextBreak = this.completedPomodoros === 0 ? "long" : "short";
    this.switchMode(this.nextBreak, true);
  }

  setConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.totalTime = this.config[this.currentMode] * 60;
    this.timeLeft = this.totalTime;
    this.updateDisplay();
  }

  getState() {
    return { startTime: this.startTime, currentMode: this.currentMode };
  }
}

export { Timer };