export class InputHandler {
  private keyActions: Map<string, () => void> = new Map();

  constructor() {
    window.addEventListener("keydown", (e) => {
      const action = this.keyActions.get(e.key.toLowerCase());
      if (action) action();
    });
  }

  bindKey(key: string, action: () => void): void {
    this.keyActions.set(key.toLowerCase(), action);
  }
}
