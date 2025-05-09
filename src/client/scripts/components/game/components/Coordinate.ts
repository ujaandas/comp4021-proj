export class Coordinate {
  constructor(public i: number, public j: number) {}

  toJSON() {
    return { i: this.i, j: this.j };
  }

  static fromJSON(data: any): Coordinate {
    return new Coordinate(data.i, data.j);
  }

  static makeKey(i: number, j: number): string {
    return `${i},${j}`;
  }

  static fromKey(key: string): Coordinate {
    const [i, j] = key.split(",").map(Number);
    return new Coordinate(i, j);
  }

  get key(): string {
    return Coordinate.makeKey(this.i, this.j);
  }

  static rotatePoint(
    point: { x: number; y: number; z: number },
    angle: number,
    origin: { x: number; y: number; z: number }
  ): { x: number; y: number; z: number } {
    const dx = point.x - origin.x;
    const dy = point.y - origin.y;
    const dz = point.z - origin.z;

    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    let rx: number, ry: number, rz: number;

    rx = dx * cos - dy * sin;
    ry = dx * sin + dy * cos;
    rz = dz;

    return { x: rx + origin.x, y: ry + origin.y, z: rz + origin.z };
  }
}
