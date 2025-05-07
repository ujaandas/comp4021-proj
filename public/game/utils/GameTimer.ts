export class GameTimer {
  private lastTime: number;
  private delay: number;
  private callback: () => void;

  constructor(delay: number, callback: () => void) {
    this.delay = delay;
    this.callback = callback;
    this.lastTime = Date.now();
  }

  update() {
    const now = Date.now();
    if (now - this.lastTime >= this.delay) {
      this.callback();
      this.lastTime = now;
    }
  }
}
