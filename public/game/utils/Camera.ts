import { Settings } from "./Settings.js";

export class Camera {
  private _angle: number;
  private targetAngle: number;
  private readonly rotationIncrement: number = 45;
  private readonly angularSpeed: number = 180;

  constructor() {
    this._angle = Settings.initialAngle;
    this.targetAngle = this._angle;
  }

  spinClockwise(): void {
    this.targetAngle = (this.targetAngle + this.rotationIncrement) % 360;
  }

  spinCounterClockwise(): void {
    this.targetAngle = (this.targetAngle - this.rotationIncrement + 360) % 360;
  }

  update(deltaTime: number): void {
    const deltaSeconds = deltaTime / 1000;

    let diff = (this.targetAngle - this._angle + 360) % 360;
    if (diff > 180) {
      diff -= 360;
    }

    const maxStep = this.angularSpeed * deltaSeconds;
    if (Math.abs(diff) <= maxStep) {
      this._angle = this.targetAngle;
    } else {
      this._angle += Math.sign(diff) * maxStep;
      this._angle = (this._angle + 360) % 360;
    }

    console.log(`Angle: ${this._angle}`);
  }

  get angle(): number {
    return this._angle;
  }
}
