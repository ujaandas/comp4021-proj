import { Tileset } from "../tileset/Tileset.js";
import { Camera } from "./Camera.js";
import { Settings } from "./Settings.js";

export class InputHandler {
  private keyActions: Map<string, () => void> = new Map();
  private rotationSnap: number = 45;

  constructor(private camera: Camera, private tileset: Tileset) {
    window.addEventListener("keydown", (e) => {
      const action = this.keyActions.get(e.key.toLowerCase());
      if (e.repeat) return;
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

  private getRotatedDirection(x: number, y: number): [number, number] {
    const currentRotation = this.camera.angle;
    const effectiveRotation =
      (((Settings.initialAngle - currentRotation) % 360) + 360) % 360;

    const clampedAngle =
      Math.round(effectiveRotation / this.rotationSnap) * this.rotationSnap;

    const rad = clampedAngle * (Math.PI / 180);

    const newX = Math.round(x * Math.cos(rad) - y * Math.sin(rad));
    const newY = Math.round(x * Math.sin(rad) + y * Math.cos(rad));

    return [newX, newY];
  }

  bindDefaultMovementControls(): void {
    this.bindKey("w", () => {
      const [dx, dy] = this.getRotatedDirection(1, 0);
      this.tileset.translateActiveTet(dx, dy);
    });

    this.bindKey("a", () => {
      const [dx, dy] = this.getRotatedDirection(0, -1);
      this.tileset.translateActiveTet(dx, dy);
    });

    this.bindKey("s", () => {
      const [dx, dy] = this.getRotatedDirection(-1, 0);
      this.tileset.translateActiveTet(dx, dy);
    });

    this.bindKey("d", () => {
      const [dx, dy] = this.getRotatedDirection(0, 1);
      this.tileset.translateActiveTet(dx, dy);
    });

    this.bindKey(" ", () => {
      this.tileset.quickDropActiveTet();
    });

    this.bindKey("r", () => {
      this.tileset.spinActiveTet(Math.PI / 2);
    });

    this.bindKey("c", () => {
      const tetPreviewEl = document.getElementById("tetrominoPreview");
      if (tetPreviewEl) {
        tetPreviewEl.style.display = "block";
      }
    });
  }
}
