import { Tileset } from "../tileset/Tileset.js";
import { Camera } from "./Camera.js";

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

  bindDefaultCameraControls(camera: Camera): void {
    this.bindKey("arrowleft", () => {
      camera.spinClockwise();
    });
    this.bindKey("arrowright", () => {
      camera.spinCounterClockwise();
    });
  }

  bindDefaultMovementControls(tileset: Tileset): void {
    this.bindKey("w", () => {
      // tileset.translateActiveBlock(-1, -1);
      tileset.translateActiveTet(-1, -1);
    });

    this.bindKey("a", () => {
      // tileset.translateActiveBlock(-1, 1);
      tileset.translateActiveTet(-1, 1);
    });

    this.bindKey("s", () => {
      // tileset.translateActiveBlock(1, 1);
      tileset.translateActiveTet(1, 1);
    });

    this.bindKey("d", () => {
      // tileset.translateActiveBlock(1, -1);
      tileset.translateActiveTet(1, -1);
    });
  }
}
