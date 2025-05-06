export class Coordinate {
  constructor(public i: number, public j: number) {}

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
}
