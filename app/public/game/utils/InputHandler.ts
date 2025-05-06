import { Tileset } from "../tileset/Tileset.js";
import { Camera } from "./Camera.js";

export class InputHandler {
  private keyActions: Map<string, () => void> = new Map();

  constructor(private camera: Camera, private tileset: Tileset) {
    window.addEventListener("keydown", (e) => {
      const action = this.keyActions.get(e.key.toLowerCase());
      if (action) action();
    });
  }

  bindKey(key: string, action: () => void): void {
    this.keyActions.set(key.toLowerCase(), action);
  }

  bindDefaultCameraControls(): void {
    this.bindKey("arrowleft", () => {
      this.camera.spinCounterClockwise();
    });
    this.bindKey("arrowright", () => {
      this.camera.spinClockwise();
    });
  }

  bindDefaultMovementControls(): void {
    this.bindKey("w", () => {
      this.tileset.translateActiveTet(1, 0);
    });

    this.bindKey("a", () => {
      this.tileset.translateActiveTet(0, -1);
    });

    this.bindKey("s", () => {
      this.tileset.translateActiveTet(-1, 0);
    });

    this.bindKey("d", () => {
      this.tileset.translateActiveTet(0, 1);
    });
  }
}
