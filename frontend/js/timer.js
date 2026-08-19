class Timer {
  constructor({ buttons = {}, display, statusButton, onSessionComplete, initialConfig = { pomodoro: 25, short: 5, long: 15 } }) {
    this.buttons = buttons;
    this.display = display;
    this.statusButton = statusButton;
    this.onSessionComplete = onSessionComplete;
    this.config = { ...initialConfig };
    this.currentMode = "pomodoro";
    this.totalTime = this.config.pomodoro * 60;
    console.log(this.config.pomodoro, this.totalTime);
    this.timeLeft = this.totalTime;
    this.timerId = null;
    this.isRunning = false;
    this.completedPomodoros = 0;
    this.startTime = null;
    this.circumference = 295.3;
    this.init();
  }

  init() {
    Object.entries(this.buttons).forEach(([mode, btn]) => {
      btn?.addEventListener("click", () => this.switchMode(mode));
    });
    this.statusButton?.addEventListener("click", () => {
      if (this.isRunning) this.stop();
      else if (this.timeLeft > 0) this.start();
    });
    this.updateActive(this.currentMode);
    this.updateDisplay();
  }

  updateActive(mode) {
    Object.values(this.buttons).forEach((btn) => btn?.classList.remove("active"));
    this.buttons[mode]?.classList.add("active");
  }

  format(seconds) {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  }

  updateProgress() {
    const percentage = this.totalTime > 0 ? this.timeLeft / this.totalTime : 0;
    const offset = this.circumference - percentage * this.circumference;
    const circle = document.querySelector(".progress");
    if (circle) circle.style.strokeDashoffset = offset;
    const vongDe = document.querySelector(".vong-de");
    if (vongDe) vongDe.style.opacity = 0.4 + percentage * 0.8;
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
    const nextBreak = this.completedPomodoros === 0 ? "long" : "short";
    this.switchMode(nextBreak, true);
  }

  setConfig(newConfig) {
    console.log(newConfig);
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