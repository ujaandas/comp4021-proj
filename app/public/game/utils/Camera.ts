export class Camera {
  private _angle: number;
  private readonly step: number = 4;

  constructor() {
    this._angle = 0;
  }

  spinClockwise(): void {
    this._angle = (this._angle + this.step) % 360;
  }

  spinCounterClockwise(): void {
    this._angle = (this._angle - this.step) % 360;
  }

  get angle(): number {
    return this._angle;
  }
}
